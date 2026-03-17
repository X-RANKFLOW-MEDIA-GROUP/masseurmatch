import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
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
import SearchPageClient from "./SearchPageClient";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SEARCH_FAQS = [
  {
    question: "How do I search massage therapists on MasseurMatch?",
    answer:
      "Use city, specialty, and listing tier filters to narrow the directory, then open a profile to compare bio, pricing, and contact details.",
  },
  {
    question: "Can I browse therapists by city?",
    answer:
      "Yes. MasseurMatch is organized around city landing pages so visitors can find local massage therapists and move into specialty pages from there.",
  },
  {
    question: "Does the search page show live therapist listings?",
    answer:
      "Yes. The search page renders public therapist listings directly and updates the results when you apply new filters.",
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
  const tierValue = getFirstParam(params.tier);
  const hasFilters = Boolean(city || modality || tierValue || getFirstParam(params.goal) || getFirstParam(params.session));

  return createPageMetadata({
    title: city ? `Search massage therapists in ${city}` : "Search massage therapists",
    description: city
      ? `Browse massage therapist listings in ${city}, compare specialties, and connect directly with providers.`
      : "Search massage therapists by city, specialty, and listing tier through a crawlable public directory.",
    path: "/search",
    keywords: ["search massage therapists", city, modality, tierValue],
    noIndex: hasFilters,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const cities = getCities();
  const city = resolveCityName(getFirstParam(params.city));
  const modality = getFirstParam(params.modality);
  const session = getFirstParam(params.session);
  const goal = getFirstParam(params.goal);
  const tierValue = getFirstParam(params.tier);
  const tier = isTier(tierValue) ? tierValue : "";
  const results = await getPublicTherapists({
    city: city || undefined,
    modality: modality || undefined,
    tier: tier || undefined,
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
          name: "Search massage therapists",
          description:
            "Search massage therapist listings by city, specialty, and listing tier through the public MasseurMatch directory.",
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

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Explore and search</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">
            Search massage therapists by city, specialty, and intent.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This search page is built for both users and crawlers: clear landing copy, crawlable therapist cards,
            and filters that help visitors narrow the directory without losing context.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {quickCities.map((entry) => (
            <Link
              key={entry.slug}
              href={`/${entry.slug}`}
              className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
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
            session,
            goal,
            tier,
          }}
        />

        <section className="mt-12 grid gap-6 rounded-3xl border border-border bg-background p-6 shadow-sm lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Built to support crawl depth</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Search points visitors into city pages, therapist detail pages, specialty landing pages, and editorial
              content so the site has meaningful internal links instead of one thin results screen.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/blog" className="text-primary hover:underline">
                Visit the blog
              </Link>
              <Link href="/chat" className="text-primary hover:underline">
                Meet Knotty AI
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
