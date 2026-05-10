import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { state: string; county: string };

export const revalidate = 300;

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function toTitle(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStateCities(stateSlug: string) {
  return getCities()
    .filter((city) => toSlug(city.stateName) === stateSlug)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function generateStaticParams(): Params[] {
  return Array.from(new Set(getCities().map((city) => toSlug(city.stateName)))).map((state) => ({
    state,
    county: "all-counties",
  }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const stateCities = getStateCities(resolved.state);

  if (stateCities.length === 0) {
    return createPageMetadata({
      title: "County massage directory",
      description: "County landing page for MasseurMatch.",
      path: `/states/${resolved.state}/counties/${resolved.county}`,
      noIndex: true,
    });
  }

  const inventory = await Promise.all(
    stateCities.map((city) => getPublicTherapists({ city: city.name, page: 1, pageSize: 1 })),
  );
  const total = inventory.reduce((sum, result) => sum + result.total, 0);
  const countyName = resolved.county === "all-counties" ? `${stateCities[0].stateName} counties` : toTitle(resolved.county);

  return createPageMetadata({
    title: `Massage therapists in ${countyName}`,
    description: `Browse county-level massage therapist discovery in ${stateCities[0].stateName}. Continue into city pages, specialties, incall, outcall, trust signals, and direct contact options.`,
    path: `/states/${resolved.state}/counties/${resolved.county}`,
    keywords: [`massage therapists ${stateCities[0].stateName.toLowerCase()}`, "massage therapists by county", "county massage directory"],
    noIndex: total === 0 || resolved.county === "all-counties",
  });
}

export default async function CountyPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const stateCities = getStateCities(resolved.state);

  if (stateCities.length === 0) notFound();

  const cityInventory = await Promise.all(
    stateCities.map(async (city) => {
      const result = await getPublicTherapists({ city: city.name, page: 1, pageSize: 1 });
      return { city, total: result.total };
    }),
  );
  const totalProfiles = cityInventory.reduce((sum, item) => sum + item.total, 0);
  const stateName = stateCities[0].stateName;
  const countyName = resolved.county === "all-counties" ? `${stateName} County Directory` : `${toTitle(resolved.county)}, ${stateName}`;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "States", path: "/states" },
          { name: stateName, path: `/states/${resolved.state}` },
          { name: countyName, path: `/states/${resolved.state}/counties/${resolved.county}` },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${countyName} massage therapist directory`,
          description: `County-level navigation for massage therapists, cities, specialties, incall, outcall, and direct contact options in ${stateName}.`,
          path: `/states/${resolved.state}/counties/${resolved.county}`,
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: `${stateName} county city links`,
          path: `/states/${resolved.state}/counties/${resolved.county}`,
          items: cityInventory.map(({ city }) => ({
            name: `${city.name}, ${city.stateCode}`,
            path: `/states/${resolved.state}/cities/${city.slug}`,
          })),
        })}
      />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">County directory</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{countyName}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
              This county route is a safe national SEO hub. It links users into city pages and remains noindex until a real county dataset and useful inventory depth are available.
            </p>
            <p className="mt-3 text-sm font-semibold text-foreground">Public profiles across linked cities: {totalProfiles}</p>
          </header>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Cities served in {stateName}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {cityInventory.map(({ city, total }) => (
                <Link
                  key={`${city.stateCode}-${city.slug}`}
                  href={`/states/${resolved.state}/cities/${city.slug}`}
                  className="rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-muted/40"
                >
                  <span className="font-semibold">{city.name}, {city.stateCode}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{total} public profiles</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
