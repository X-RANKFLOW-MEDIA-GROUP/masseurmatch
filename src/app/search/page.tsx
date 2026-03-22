import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  type TherapistTier,
  getCities,
  getPublicTherapists,
} from "@/app/_lib/directory";
import { TextReveal } from "@/components/animations/TextReveal";
import type { DirectorySession } from "@/components/sections/AdvancedDirectoryFilter";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import SearchPageClient from "./SearchPageClient";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SEARCH_FAQS = [
  {
    question: "How do I search trusted massage therapists on MasseurMatch?",
    answer:
      "Use city, Deep Tissue, Outcall, Incall, and Verified filters to narrow results instantly, then open a profile and use the direct call or message actions.",
  },
  {
    question: "Can I browse trusted therapists by city?",
    answer:
      "Yes. MasseurMatch is organized around city, category, and service-intent pages so visitors can find local options and move into more specific listings from there.",
  },
  {
    question: "Does the search page show live profile data?",
    answer:
      "Yes. The search page renders public therapist listings directly and updates the visible results without a full page refresh when filters change.",
  },
];

const isTier = (value: string): value is TherapistTier =>
  value === "free" || value === "standard" || value === "pro" || value === "elite";

const getFirstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] || "") : (value || "");

const resolveCityName = (value: string) => {
  if (!value) {
    return "";
  }

  const matchedCity = getCities().find((city) => city.slug === value || city.name === value);
  return matchedCity?.name || value;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const city = resolveCityName(getFirstParam(params.city));
  const modality = getFirstParam(params.modality);
  const keyword = getFirstParam(params.keyword);
  const verified = getFirstParam(params.verified) === "1";
  const tierValue = getFirstParam(params.tier);
  return createPageMetadata({
    title: city ? `Verified male massage therapists in ${city}` : "Search verified male massage therapists",
    description: city
      ? `Browse therapist listings in ${city}, compare specialties and verification signals, and contact providers directly through a safer premium directory flow.`
      : "Search verified male massage therapists by city, specialty, and listing tier through a crawlable public directory optimized for local near-me intent.",
    path: "/search",
    keywords: ["search massage therapists", "male massage near me", city, modality, keyword, verified ? "verified massage therapist" : "", tierValue],
    noIndex: true,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const cities = getCities();
  const city = resolveCityName(getFirstParam(params.city));
  const modality = getFirstParam(params.modality);
  const keyword = getFirstParam(params.keyword);
  const sessionParam = getFirstParam(params.session);
  const session: DirectorySession =
    sessionParam === "home-visit" ? "home-visit" : sessionParam === "incall" ? "incall" : "";
  const goal = getFirstParam(params.goal);
  const verified = getFirstParam(params.verified) === "1";
  const availableToday = getFirstParam(params.available) === "1";
  const masterOnly = getFirstParam(params.master) === "1";
  const tierValue = getFirstParam(params.tier);
  const tier = isTier(tierValue) ? tierValue : "";
  const lgbtqAffirming = getFirstParam(params.lgbtq) === "1";
  const results = await getPublicTherapists({
    city: city || undefined,
    modality: modality || undefined,
    keyword: keyword || undefined,
    session: session || undefined,
    verified,
    availableToday,
    tier: tier || undefined,
    lgbtqAffirming: lgbtqAffirming || undefined,
    page: 1,
    pageSize: 12,
  });
  const quickCities = cities.slice(0, 12);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Search", path: "/search" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Search verified massage therapists",
          description:
            "Search massage therapist listings by city, specialty, session format, and listing tier through the public MasseurMatch directory.",
          path: "/search",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Search results",
          path: "/search",
          items: results.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
      />
      <JsonLd data={buildFaqJsonLd(SEARCH_FAQS)} />

      <div className="page-shell py-10">
        <div className="rounded-[2.2rem] border border-slate-800 bg-slate-950 px-6 py-8 shadow-[0_28px_80px_rgba(15,23,42,0.22)] sm:px-8 sm:py-10">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-slate-400">Explore and search</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-7xl">
            <TextReveal text="Find trusted therapists fast." delay={0.05} />
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-lg font-light leading-relaxed text-slate-300">
            Search is built for confidence-first discovery: visible verification, cleaner local intent pages, and direct
            contact options that move users from browsing to calling or messaging in seconds.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {quickCities.map((entry) => (
            <Link
              key={entry.slug}
              href={`/${entry.slug}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              {entry.name}
            </Link>
          ))}
        </div>

        <SearchPageClient
          cities={cities}
          items={results.items}
          total={results.total}
          filters={{
            city,
            modality,
            keyword,
            session,
            goal,
            verified,
            availableToday,
            masterOnly,
            tier,
            lgbtqAffirming,
          }}
        />

        <section className="mt-12 grid gap-6 rounded-3xl border border-border bg-background p-6 shadow-sm lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Built to support safer discovery at scale</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Search points visitors into city pages, therapist detail pages, specialty landing pages, and trust content
              so the site has meaningful internal links instead of one thin results screen.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/blog" className="text-primary hover:underline">
                Visit the blog
              </Link>
              <Link href="/compare" className="text-primary hover:underline">
                Compare competitors
              </Link>
              <Link href="/safety" className="text-primary hover:underline">
                Read trust and safety
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {SEARCH_FAQS.map((item) => (
              <article key={item.question} className="rounded-2xl border border-border bg-secondary/30 p-4">
                <h3 className="font-semibold text-foreground">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
