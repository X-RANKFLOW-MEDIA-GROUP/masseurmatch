import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import { createPageMetadata, buildBreadcrumbJsonLd } from "@/app/_lib/seo";
import { getCities } from "@/app/_lib/directory";

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
          Explore
        </h1>
        <p className="mt-1 text-muted-foreground">
          Find therapists by city or state.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold">Cities</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {featuredCities.map((city) => (
            <Link
              key={city!.slug}
              href={`/${city!.slug}`}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/40"
            >
              {city!.name}{" "}
              <span className="text-muted-foreground">{city!.stateCode}</span>
            </Link>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl font-semibold">States</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {states.map((state) => (
            <Link
              key={state.stateCode}
              href={`/states/${toStateSlug(state.stateName)}`}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/40"
            >
              {state.stateName}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
