import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCanonicalCitySlug } from "@/app/_lib/city-routing";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { state: string; city: string };

export const revalidate = 300;

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getCityForParams(stateSlug: string, citySlug: string) {
  return getCities().find((city) => toSlug(city.stateName) === stateSlug && city.slug === citySlug) || null;
}

export function generateStaticParams(): Params[] {
  return getCities().map((city) => ({ state: toSlug(city.stateName), city: city.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const city = getCityForParams(resolved.state, resolved.city);

  if (!city) {
    return createPageMetadata({
      title: "City massage directory",
      description: "City landing page for MasseurMatch.",
      path: `/states/${resolved.state}/cities/${resolved.city}`,
      noIndex: true,
    });
  }

  const therapists = await getPublicTherapists({ city: city.name, page: 1, pageSize: 1 });

  return createPageMetadata({
    title: `Massage therapists in ${city.name}, ${city.stateCode}`,
    description: `Browse verified massage therapists in ${city.name}, ${city.stateName}. Compare specialties, incall, outcall, trust signals, availability, and direct contact options.`,
    path: `/states/${resolved.state}/cities/${city.slug}`,
    keywords: [`massage therapists ${city.name.toLowerCase()}`, `${city.name.toLowerCase()} massage directory`, `${city.stateName.toLowerCase()} massage therapists`],
    noIndex: therapists.total === 0,
  });
}

export default async function StateCityPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const city = getCityForParams(resolved.state, resolved.city);

  if (!city) notFound();

  const therapists = await getPublicTherapists({ city: city.name, page: 1, pageSize: 12 });
  const canonicalCityPath = `/cities/${getCanonicalCitySlug(city.slug)}`;
  const currentPath = `/states/${resolved.state}/cities/${city.slug}`;

  const serviceLinks = [
    "gay-massage",
    "male-massage",
    "deep-tissue",
    "swedish",
    "sports-massage",
    "incall",
    "outcall",
    "mobile",
    "hotel",
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "States", path: "/states" },
          { name: city.stateName, path: `/states/${resolved.state}` },
          { name: city.name, path: currentPath },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${city.name}, ${city.stateCode} massage therapist directory`,
          description: `State-scoped city route for massage therapists, service pages, incall, outcall, and direct contact options in ${city.name}, ${city.stateName}.`,
          path: currentPath,
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: `${city.name} therapist listings`,
          path: currentPath,
          items: therapists.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
      />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">State city directory</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Massage Therapists in {city.name}, {city.stateCode}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
              This state-scoped page connects {city.name} into MasseurMatch’s national architecture. Use it to browse therapists, jump to canonical city routes, and discover service-specific pages when local inventory exists.
            </p>
            <p className="mt-3 text-sm font-semibold text-foreground">Public profiles found: {therapists.total}</p>
          </header>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Canonical local page</h2>
            <Link href={canonicalCityPath} className="mt-4 inline-block rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-muted/40">
              {canonicalCityPath}
            </Link>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Popular local service routes</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {serviceLinks.map((slug) => (
                <Link key={slug} href={`${canonicalCityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Profiles in {city.name}</h2>
            {therapists.items.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {therapists.items.map((therapist, index) => (
                  <article key={therapist.id} className="rounded-2xl border border-border p-4">
                    <h3 className="font-semibold text-foreground">
                      <Link href={`/therapists/${therapist.slug || therapist.id}`} className="transition hover:text-primary">
                        {therapist.display_name || therapist.full_name || `Therapist ${index + 1}`}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{therapist.city || city.name} • {therapist.modality || "Massage services"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {therapist.incall_price ? `Incall from $${therapist.incall_price}` : "Incall not listed"} • {therapist.outcall_price ? `Outcall from $${therapist.outcall_price}` : "Outcall not listed"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Profiles are being expanded for this market. This page stays followable and becomes indexable when inventory exists.</p>
            )}
          </section>
        </div>
      </section>
    </>
  );
}
