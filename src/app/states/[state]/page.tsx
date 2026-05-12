import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCanonicalCitySlug } from "@/app/_lib/city-routing";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { state: string };

export const revalidate = 300;

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getStateDirectory(stateSlug: string) {
  const cities = getCities()
    .filter((city) => toSlug(city.stateName) === stateSlug)
    .sort((left, right) => left.name.localeCompare(right.name));

  const firstCity = cities[0];
  if (!firstCity) return null;

  return {
    stateName: firstCity.stateName,
    stateCode: firstCity.stateCode,
    cities,
  };
}

export function generateStaticParams(): Params[] {
  return Array.from(new Set(getCities().map((city) => toSlug(city.stateName)))).map((state) => ({ state }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const stateDirectory = getStateDirectory(resolved.state);

  if (!stateDirectory) {
    return createPageMetadata({
      title: "State massage directory",
      description: "State landing page for MasseurMatch.",
      path: `/states/${resolved.state}`,
      noIndex: true,
    });
  }

  const inventory = await Promise.all(
    stateDirectory.cities.map((city) => getPublicTherapists({ city: city.name, page: 1, pageSize: 1 })),
  );
  const total = inventory.reduce((sum, result) => sum + result.total, 0);

  return createPageMetadata({
    title: `Massage therapists in ${stateDirectory.stateName}`,
    description: `Browse verified massage therapists in ${stateDirectory.stateName} by city, specialty, incall, outcall, trust signals, and direct contact options.`,
    path: `/states/${resolved.state}`,
    keywords: [`massage therapists ${stateDirectory.stateName.toLowerCase()}`, `${stateDirectory.stateName.toLowerCase()} massage directory`, "massage therapists by state"],
    noIndex: total === 0,
  });
}

export default async function StatePage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const stateDirectory = getStateDirectory(resolved.state);

  if (!stateDirectory) notFound();

  const cityInventory = await Promise.all(
    stateDirectory.cities.map(async (city) => {
      const result = await getPublicTherapists({ city: city.name, page: 1, pageSize: 1 });
      return { city, total: result.total };
    }),
  );

  const totalProfiles = cityInventory.reduce((sum, item) => sum + item.total, 0);
  const cityItems = cityInventory.map(({ city }) => ({
    name: `${city.name}, ${city.stateCode}`,
    path: `/states/${resolved.state}/cities/${city.slug}`,
  }));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "States", path: "/states" },
          { name: stateDirectory.stateName, path: `/states/${resolved.state}` },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${stateDirectory.stateName} massage therapist directory`,
          description: `State directory for massage therapists, city pages, specialties, incall, outcall, and direct contact options in ${stateDirectory.stateName}.`,
          path: `/states/${resolved.state}`,
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: `${stateDirectory.stateName} city directory`,
          path: `/states/${resolved.state}`,
          items: cityItems,
        })}
      />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">State directory</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Massage Therapists in {stateDirectory.stateName}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
              Browse MasseurMatch city pages in {stateDirectory.stateName}. State pages support national SEO while only becoming indexable when useful public inventory exists.
            </p>
            <p className="mt-3 text-sm font-semibold text-foreground">Public profiles found across this state: {totalProfiles}</p>
          </header>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Cities in {stateDirectory.stateName}</h2>
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

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Canonical city routes</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {stateDirectory.cities.map((city) => (
                <Link
                  key={`canonical-${city.slug}`}
                  href={`/cities/${getCanonicalCitySlug(city.slug)}`}
                  className="rounded-xl border border-border px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-muted/40"
                >
                  /cities/{getCanonicalCitySlug(city.slug)}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
