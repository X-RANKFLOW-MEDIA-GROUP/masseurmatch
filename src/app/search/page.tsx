import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/json-ld";
import {
  type TherapistTier,
  getCities,
  getPublicTherapists,
} from "@/app/_lib/directory";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import type { DirectorySession } from "@/components/sections/AdvancedDirectoryFilter";
import SearchPageClient from "./SearchPageClient";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getFirstParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] || "") : (value || "");

const isTier = (value: string): value is TherapistTier =>
  value === "free" || value === "standard" || value === "pro" || value === "elite";

const resolveCityName = (raw: string): string => raw.trim();

const SEARCH_FAQS = [
  {
    question: "How do I find a therapist near me?",
    answer:
      "Use your location or the city filter to narrow results to your area. Then compare specialties, profile details, availability, and pricing before contacting a therapist directly.",
  },
  {
    question: "Does MasseurMatch handle booking or payments?",
    answer:
      "No. MasseurMatch is a discovery directory only. You review profiles and contact therapists directly to confirm availability, rates, and location.",
  },
  {
    question: "What does the verified badge mean?",
    answer:
      "A verification badge reflects the checks described on MasseurMatch's verification page. Review each profile and contact the independent provider directly for any details important to you.",
  },
  {
    question: "Can I filter by specialty or session type?",
    answer:
      "Yes. Use the modality and session filters to narrow results by massage technique, outcall, incall, and other profile details.",
  },
];

const SEARCH_FILTER_PARAMS = [
  "city",
  "modality",
  "tier",
  "keyword",
  "session",
  "goal",
  "verified",
  "available",
  "master",
  "lgbtq",
] as const;

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const city = getFirstParam(params.city);
  const hasFilters = SEARCH_FILTER_PARAMS.some((param) => Boolean(getFirstParam(params[param])));

  return createPageMetadata({
    title: city ? `${city} massage therapists — directory search` : "Search massage therapists",
    description: city
      ? `Search massage therapists in ${city}. Compare specialties, availability, profile details, and pricing, then contact providers directly.`
      : "Search the MasseurMatch directory by city, specialty, session format, and tier. Compare public massage therapist profiles and contact providers directly.",
    path: "/search",
    noIndex: hasFilters,
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
    pageSize: 500,
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
          name: "Search massage therapists",
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

      <div className="page-shell py-6 sm:py-8">
        <header className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-brand-secondary">
              Find a therapist
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {city ? `Massage therapists in ${city}` : "Browse massage therapists"}
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Profiles first. Filter by location, specialty, availability, service format, and price without digging through extra content.
          </p>
        </header>

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

        <div className="mt-8 flex flex-wrap gap-2" aria-label="Popular cities">
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

        <section className="mt-12 grid gap-6 rounded-3xl border border-border bg-background p-6 shadow-sm lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Helpful details without blocking discovery</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              MasseurMatch connects visitors with public provider profiles, city pages, specialty pages, and trust information while keeping the directory itself immediately usable.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/how-it-works" className="text-primary hover:underline">
                How it works
              </Link>
              <Link href="/trust" className="text-primary hover:underline">
                Trust and safety
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
