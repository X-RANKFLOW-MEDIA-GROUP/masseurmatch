import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/app/_components/json-ld";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { formatCityLabel } from "@/data/cities";

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
  return [];
}

async function getStateInventory(stateSlug: string) {
  const stateDirectory = getStateDirectory(stateSlug);
  if (!stateDirectory) return null;

  const cityInventory = await Promise.all(
    stateDirectory.cities.map(async (city) => {
      const result = await getPublicTherapists({ city: city.name, page: 1, pageSize: 1 });
      return { city, total: result.total };
    }),
  );

  return {
    ...stateDirectory,
    cityInventory,
    totalProfiles: cityInventory.reduce((sum, item) => sum + item.total, 0),
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const state = await getStateInventory(resolved.state);

  if (!state) {
    return createPageMetadata({
      title: "State massage directory",
      description: "State landing page for MasseurMatch.",
      path: `/states/${resolved.state}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `Male massage therapists in ${state.stateName}`,
    description: `Browse male massage therapists in ${state.stateName} by city, specialty, incall, outcall, availability, trust signals, and direct contact options.`,
    path: `/states/${resolved.state}`,
    keywords: [
      `male massage therapists ${state.stateName.toLowerCase()}`,
      `${state.stateName.toLowerCase()} massage directory`,
      "massage therapists by state",
    ],
    noIndex: state.totalProfiles === 0,
  });
}

export default async function StatePage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const state = await getStateInventory(resolved.state);

  if (!state) notFound();

  const activeCities = state.cityInventory.filter((item) => item.total > 0);
  const upcomingCities = state.cityInventory.filter((item) => item.total === 0);
  const itemListCities = activeCities.length > 0 ? activeCities : state.cityInventory;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "States", path: "/states" },
          { name: state.stateName, path: `/states/${resolved.state}` },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${state.stateName} male massage therapist directory`,
          description: `Browse city directories and independent provider profiles in ${state.stateName}.`,
          path: `/states/${resolved.state}`,
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: `${state.stateName} active city directory`,
          path: `/states/${resolved.state}`,
          items: itemListCities.map(({ city }) => ({
            name: formatCityLabel(city.name, city.stateCode),
            path: `/${city.slug}`,
          })),
        })}
      />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">State directory</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Male Massage Therapists in {state.stateName}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
              Browse canonical city pages in {state.stateName}. Active markets link directly to public provider inventory, while cities without inventory remain outside the sitemap until useful listings are available.
            </p>
            <p className="mt-3 text-sm font-semibold text-foreground">Public profiles across this state: {state.totalProfiles}</p>
          </header>

          {activeCities.length > 0 ? (
            <section className="rounded-3xl border border-border bg-background p-6">
              <h2 className="text-2xl font-semibold text-foreground">Active cities in {state.stateName}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {activeCities.map(({ city, total }) => (
                  <Link
                    key={`${city.stateCode}-${city.slug}`}
                    href={`/${city.slug}`}
                    className="rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-muted/40"
                  >
                    <span className="font-semibold">{formatCityLabel(city.name, city.stateCode)}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{total} public {total === 1 ? "profile" : "profiles"}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {upcomingCities.length > 0 ? (
            <section className="rounded-3xl border border-border bg-background p-6">
              <h2 className="text-2xl font-semibold text-foreground">More cities</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                These city routes remain followable but are not eligible for sitemap inclusion until real approved public inventory is available.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {upcomingCities.map(({ city }) => (
                  <Link
                    key={`upcoming-${city.slug}`}
                    href={`/${city.slug}`}
                    className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-secondary"
                  >
                    {formatCityLabel(city.name, city.stateCode)}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </>
  );
}
