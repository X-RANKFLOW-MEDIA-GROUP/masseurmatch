import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import { createPageMetadata, buildBreadcrumbJsonLd } from "@/app/_lib/seo";
import { getCities } from "@/app/_lib/directory";
import { cityDisplayName } from "@/data/cities";
import { ExploreLocationFinder } from "./ExploreLocationFinder";

const FEATURED_CITY_SLUGS = [
  "atlanta",
  "austin",
  "boston",
  "charlotte",
  "chicago",
  "dallas",
  "denver",
  "houston",
  "las-vegas",
  "los-angeles",
  "miami",
  "minneapolis",
  "nashville",
  "new-york",
  "orlando",
  "philadelphia",
  "phoenix",
  "portland",
  "san-diego",
  "san-francisco",
  "seattle",
  "st-louis",
  "tampa",
  "washington-dc",
];

function toStateSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const metadata: Metadata = createPageMetadata({
  title: "Explore therapists by city — MasseurMatch",
  description:
    "Browse male massage therapists across every major US city and state.",
  path: "/explore",
  keywords: [
    "massage therapists by city",
    "massage therapists by state",
    "explore massage directory",
  ],
});

export default function ExplorePage() {
  const allCities = getCities();

  const featuredCities = FEATURED_CITY_SLUGS.map((slug) =>
    allCities.find((c) => c.slug === slug),
  ).filter(Boolean);

  const states = Array.from(
    new Map(
      allCities
        .sort((a, b) => a.stateName.localeCompare(b.stateName))
        .map((city) => [city.stateCode, city]),
    ).values(),
  );

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explore", path: "/explore" },
        ])}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Explore massage therapists by location
        </h1>
        <div className="mt-4 max-w-4xl space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Start with a city or state to browse public provider profiles and local discovery pages. Each active
            city page can help you compare specialties, incall and outcall options, availability, service areas,
            rates, and direct contact information before reaching out to an independent provider.
          </p>
          <p>
            Some locations may be listed before public inventory is available. Those pages remain outside the
            sitemap or marked noindex until approved profiles support useful local results. This prevents empty or
            repetitive pages from competing with active markets and keeps the directory focused on real provider
            coverage.
          </p>
          <p>
            MasseurMatch does not process appointments or payments. Open a provider profile to review the details
            they have published, then contact them directly to confirm timing, location, pricing, boundaries, and
            any questions about credentials or services.
          </p>
        </div>

        <h2 className="mt-10 font-display text-2xl font-semibold">Featured cities</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {featuredCities.map((city) => (
            <Link
              key={city!.slug}
              href={`/${city!.slug}`}
              className="truncate rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:border-primary/40"
            >
              {cityDisplayName(city!.name, city!.stateCode)}{" "}
              <span className="text-muted-foreground">{city!.stateCode}</span>
            </Link>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl font-semibold">Browse states</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          State pages organize active city directories and help search engines understand the relationship between
          state, city, service, and provider entities across the national MasseurMatch directory.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {states.map((state) => (
            <Link
              key={state.stateCode}
              href={`/states/${toStateSlug(state.stateName)}`}
              className="truncate rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:border-primary/40"
            >
              {state.stateName}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
