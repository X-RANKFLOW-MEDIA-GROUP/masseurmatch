import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import { getCities } from "@/app/_lib/directory";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";

type Params = { state: string };

export const revalidate = 60;

function toStateSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getStateDirectory(stateSlug: string) {
  const cities = getCities()
    .filter((city) => toStateSlug(city.stateName) === stateSlug)
    .sort((left, right) => left.name.localeCompare(right.name));

  if (cities.length === 0) {
    return null;
  }

  return {
    stateName: cities[0]?.stateName || "",
    cities,
  };
}

export function generateStaticParams(): Params[] {
  return Array.from(new Set(getCities().map((city) => toStateSlug(city.stateName)))).map((state) => ({ state }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const stateDirectory = getStateDirectory(resolvedParams.state);
  const metadata = createPageMetadata({
    title: stateDirectory ? `Explore providers in ${stateDirectory.stateName}` : "Explore providers by state",
    description: stateDirectory
      ? `Browse city entry points inside ${stateDirectory.stateName} and continue into noindex explore pages.`
      : "Browse providers by state.",
    path: `/explore/${resolvedParams.state}`,
  });

  return {
    ...metadata,
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        noimageindex: true,
      },
    },
  };
}

export default async function ExploreStatePage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const stateDirectory = getStateDirectory(resolvedParams.state);

  if (!stateDirectory) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explore", path: "/explore" },
          { name: stateDirectory.stateName, path: `/explore/${resolvedParams.state}` },
        ])}
      />

      <main className="page-shell py-10">
        <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Explore by state</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
            Browse cities in {stateDirectory.stateName}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            These state browse pages are navigation helpers only. Choose a city below to open the explore view with a
            location already selected.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-background p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stateDirectory.cities.map((city) => (
              <Link
                key={city.slug}
                href={`/explore/usa/${city.slug}`}
                className="rounded-2xl border border-border bg-background px-4 py-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
