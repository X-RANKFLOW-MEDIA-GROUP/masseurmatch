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
  // Generate long-tail local SEO routes on demand so production builds stay fast and reliable.
  return [];
}

function cityDisplayName(canonicalCity: string): string {
  return canonicalCity
    .split("-")
    .slice(0, -1)
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function categoryLabel(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const citySlug = resolveCitySlug(resolved.city);

  if (!citySlug) {
    return createPageMetadata({
      title: "City massage directory",
      description: "City landing page for MasseurMatch.",
      path: `/cities/${resolved.city}`,
      noIndex: true,
    });
  }

  const city = getCities().find((entry) => entry.slug === citySlug);
  if (!city) {
    return createPageMetadata({
      title: "City massage directory",
      description: "City landing page for MasseurMatch.",
      path: `/cities/${resolved.city}`,
      noIndex: true,
    });
  }

  const canonicalCity = getCanonicalCitySlug(city.slug);
  const therapists = await getPublicTherapists({ city: city.name, page: 1, pageSize: 1 });

  return createPageMetadata({
    title: `Massage therapists in ${city.name}, ${city.stateCode}`,
    description:
      `Browse verified massage therapists in ${city.name}, ${city.stateName}. Compare specialties, incall, outcall, trust signals, availability, and direct contact options.` ,
    path: `/cities/${canonicalCity}`,
    keywords: [
      `massage therapists ${city.name.toLowerCase()}`,
      `massage near me ${city.name.toLowerCase()}`,
      `${city.name.toLowerCase()} outcall massage`,
      `${city.name.toLowerCase()} incall massage`,
      `${city.stateName.toLowerCase()} massage directory`,
    ],
    noIndex: therapists.total === 0,
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
    label: categoryLabel(slug),
  }));

  const faq = [
    {
      question: `How do I find massage therapists in ${cityName}?`,
      answer:
        "Start with verified profile signals, then compare specialty, session type, pricing, availability, and direct contact options before reaching out.",
    },
    {
      question: `Can I find incall, outcall, and hotel massage options in ${cityName}?`,
      answer:
        "Yes. Use the incall, outcall, mobile, hotel, and specialty routes to find providers with the right session format where public inventory exists.",
    },
    {
      question: `Why does this city page link to service and neighborhood pages?`,
      answer:
        "City, service, and neighborhood routes help visitors narrow broad local search intent into more relevant therapist profiles.",
    },
    {
      question: `Does MasseurMatch process booking or payments?`,
      answer:
        "No. MasseurMatch is a discovery directory. Visitors contact therapists directly to confirm fit, availability, rates, boundaries, and session details.",
    },
    {
      question: `Does MasseurMatch cover only one city or state?`,
      answer:
        "No. MasseurMatch is built as a national United States directory with city and state pages expanding as useful local inventory becomes available.",
    },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cities", path: "/cities" },
          { name: cityDisplayName(canonicalCity), path: canonicalCityPath },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${cityName}, ${city.stateCode} massage therapist directory`,
          description: `Local route for massage therapists, specialties, session formats, and direct contact options in ${cityName}, ${city.stateName}.`,
          path: canonicalCityPath,
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: `${cityName} therapist listings`,
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">City directory</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Massage Therapists in {cityName}, {city.stateCode}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
              Browse local massage therapist profiles, service routes, session formats, and neighborhood discovery paths in {cityName}.
              MasseurMatch is a national United States directory, so this page is part of a broader state, city, and specialty SEO architecture.
            </p>
          </header>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Popular Services</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_SERVICE_SLUGS.map((slug) => (
                <Link key={slug} href={`${canonicalCityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {categoryLabel(slug)}
                </Link>
              ))}
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-foreground">Session Formats</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_SESSION_SLUGS.map((slug) => (
                <Link key={slug} href={`${canonicalCityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {categoryLabel(slug)}
                </Link>
              ))}
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-foreground">Neighborhood Discovery</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_NEIGHBORHOOD_SLUGS.map((slug) => (
                <Link key={slug} href={`${canonicalCityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {categoryLabel(slug)}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">How Direct Contact Works</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>Choose a city, service, session type, or neighborhood route based on search intent.</li>
              <li>Compare profile trust indicators, session format, pricing, specialties, and availability.</li>
              <li>Open profile details and contact the provider directly through the listed channel.</li>
              <li>Confirm boundaries, duration, location, and availability before scheduling.</li>
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">{cityName} Profiles</h2>
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
              <p className="mt-4 text-sm text-muted-foreground">Profiles are being expanded for this market. This page will stay followable and should only be indexed once public inventory is available.</p>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Guides That Support Local Search</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <Link href="/guides" className="rounded-full border border-border px-3 py-2 text-foreground">Massage Guides</Link>
              <Link href="/therapists" className="rounded-full border border-border px-3 py-2 text-foreground">Therapist Directory</Link>
              <Link href="/for-therapists" className="rounded-full border border-border px-3 py-2 text-foreground">List Your Profile</Link>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Related Local Routes</h2>
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
