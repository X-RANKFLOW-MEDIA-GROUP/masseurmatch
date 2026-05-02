import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import { getCanonicalCitySlug, resolveCitySlug } from "@/app/_lib/city-routing";
import {
  DALLAS_NEIGHBORHOOD_SLUGS,
  DALLAS_ORDERED_CATEGORY_SLUGS,
  DALLAS_SERVICE_SLUGS,
  DALLAS_SESSION_SLUGS,
  getCityCanonicalCategorySlugs,
} from "@/app/_lib/dallas-cluster";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { city: string };

export const revalidate = 60;

export function generateStaticParams(): Params[] {
  return getCities().map((city) => ({ city: getCanonicalCitySlug(city.slug) }));
}

function cityDisplayName(canonicalCity: string): string {
  return canonicalCity
    .split("-")
    .slice(0, -1)
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const citySlug = resolveCitySlug(resolved.city);

  if (!citySlug) {
    return createPageMetadata({
      title: "City",
      description: "City landing page.",
      path: `/cities/${resolved.city}`,
      noIndex: true,
    });
  }

  const city = getCities().find((entry) => entry.slug === citySlug);
  if (!city) {
    return createPageMetadata({
      title: "City",
      description: "City landing page.",
      path: `/cities/${resolved.city}`,
      noIndex: true,
    });
  }

  const canonicalCity = getCanonicalCitySlug(city.slug);

  return createPageMetadata({
    title: `Gay Massage in ${city.name}, ${city.stateCode} | Verified Male Massage Therapists | MasseurMatch`,
    description:
      `Discover verified male massage therapists in ${city.name} with city-first pages for services, sessions, and neighborhoods.` ,
    path: `/cities/${canonicalCity}`,
    keywords: [
      `gay massage ${city.name.toLowerCase()}`,
      `male massage ${city.name.toLowerCase()}`,
      `${city.name.toLowerCase()} outcall massage`,
    ],
  });
}

export default async function CanonicalCityPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const citySlug = resolveCitySlug(resolved.city);

  if (!citySlug) {
    notFound();
  }

  const city = getCities().find((entry) => entry.slug === citySlug);
  if (!city) {
    notFound();
  }

  const canonicalCity = getCanonicalCitySlug(city.slug);
  const canonicalCityPath = `/cities/${canonicalCity}`;
  const cityName = city.name;
  const therapists = await getPublicTherapists({ city: cityName, page: 1, pageSize: 10 });

  const categories = getCityCanonicalCategorySlugs(canonicalCity);
  const internalSiblingLinks = categories.slice(0, 12).map((slug) => ({
    href: `${canonicalCityPath}/${slug}`,
    label: slug.replace(/-/g, " "),
  }));

  const faq = [
    {
      question: `How do I find trusted male massage therapists in ${cityName}?`,
      answer:
        "Start with verified profile signals, then compare modality, session type, and neighborhood coverage before direct contact.",
    },
    {
      question: `Can I find outcall and hotel options in ${cityName}?`,
      answer:
        "Yes. Use the outcall, mobile, and hotel routes to see providers with travel-ready formats and clear contact preferences.",
    },
    {
      question: `Why does this city page link to neighborhood pages?`,
      answer:
        "Neighborhood intent converts faster. Micro-area pages keep location relevance high and reduce mismatch during provider selection.",
    },
    {
      question: `Does MasseurMatch process booking payments?`,
      answer:
        "No. MasseurMatch is discovery-first. Visitors contact therapists directly to confirm fit, availability, and session details.",
    },
    {
      question: `What is the Dallas-first rollout strategy?`,
      answer:
        "Dallas is the beachhead market for 60 to 90 days, with DFW support pages reinforcing authority and regional intent coverage.",
    },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: cityDisplayName(canonicalCity), path: canonicalCityPath },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${cityName} city directory`,
          description: `City-first route for ${cityName} services, sessions, and neighborhoods.`,
          path: canonicalCityPath,
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: `${cityName} profile listings`,
          path: canonicalCityPath,
          items: therapists.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
      />
      <JsonLd data={buildFaqJsonLd(faq)} />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">City Beachhead</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{cityName} Gay Massage and Male Massage Therapists</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
              Dallas-first city template for high-intent discovery. This page consolidates services, session formats, neighborhood routes,
              and profile listings so users can move from broad search to direct contact with less friction. It is designed to compete
              directly with city and micro-area structures already ranking in DFW.
            </p>
          </header>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Popular Services</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_SERVICE_SLUGS.map((slug) => (
                <Link key={slug} href={`${canonicalCityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-foreground">Session Formats</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_SESSION_SLUGS.map((slug) => (
                <Link key={slug} href={`${canonicalCityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-foreground">Popular Neighborhoods</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_NEIGHBORHOOD_SLUGS.map((slug) => (
                <Link key={slug} href={`${canonicalCityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">How Direct Contact Works</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>Choose city, service, or neighborhood route based on search intent.</li>
              <li>Compare profile trust indicators, session format, and starting rates.</li>
              <li>Open profile details and contact provider directly by preferred channel.</li>
              <li>Confirm boundaries, duration, and availability before scheduling.</li>
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Dallas Profiles</h2>
            {therapists.items.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {therapists.items.slice(0, 10).map((therapist, index) => (
                  <article key={therapist.id} className="rounded-2xl border border-border p-4">
                    <h3 className="font-semibold text-foreground">
                      <Link href={`/therapists/${therapist.slug || therapist.id}`} className="transition hover:text-primary">
                        {therapist.display_name || therapist.full_name || `Therapist ${index + 1}`}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{therapist.city || cityName} • {therapist.modality || "Massage services"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {therapist.incall_price ? `Incall from $${therapist.incall_price}` : "Incall not listed"} • {therapist.outcall_price ? `Outcall from $${therapist.outcall_price}` : "Outcall not listed"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Profiles are being expanded for this market. City and service pages remain live for intent capture.</p>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Guides That Support This City</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <Link href="/guides/incall-vs-outcall-dallas" className="rounded-full border border-border px-3 py-2 text-foreground">Incall vs Outcall Dallas</Link>
              <Link href="/guides/how-to-choose-a-male-massage-therapist-in-dallas" className="rounded-full border border-border px-3 py-2 text-foreground">Choose a Male Therapist in Dallas</Link>
              <Link href="/guides/hotel-massage-in-dallas-what-to-know" className="rounded-full border border-border px-3 py-2 text-foreground">Hotel Massage Dallas</Link>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Internal Links</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {internalSiblingLinks.map((entry) => (
                <Link key={entry.href} href={entry.href} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {entry.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
