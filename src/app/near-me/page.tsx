import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/json-ld";
import { GeoAreaCallout } from "@/app/_components/geo-area-callout";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import SearchPageClient from "@/app/search/SearchPageClient";
import { formatCityLabel } from "@/data/cities";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = createPageMetadata({
  title: "Massage Therapists Near Me | MasseurMatch",
  description:
    "Find massage therapists near you. Use your location, browse public profiles immediately, compare services and pricing, and contact providers directly.",
  path: "/near-me",
  keywords: [
    "massage near me",
    "massage therapist near me",
    "local massage therapy",
    "massage therapists in my area",
  ],
});

export default async function NearMePage() {
  const cities = getCities();
  const results = await getPublicTherapists({ page: 1, pageSize: 500 });
  const topCities = cities.slice(0, 12);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Near Me", path: "/near-me" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Find Massage Therapists Near Me",
          description:
            "Use your location or browse public massage therapist profiles, compare services and pricing, and contact providers directly.",
          path: "/near-me",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Massage therapists near me",
          path: "/near-me",
          items: results.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
      />

      <main className="page-shell py-6 sm:py-8">
        <header className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">Near me</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Find massage therapists near you
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Browse profiles now, or use your location to narrow the directory to your area.
          </p>
        </header>

        <GeoAreaCallout compact navigateToSearch source="near-me" className="mb-5" />

        <SearchPageClient
          cities={cities}
          items={results.items}
          total={results.total}
          filters={{
            city: "",
            modality: "",
            keyword: "",
            session: "",
            goal: "",
            verified: false,
            availableToday: false,
            masterOnly: false,
            tier: "",
            lgbtqAffirming: false,
          }}
        />

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="font-display text-xl font-semibold text-foreground">Popular cities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topCities.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40"
              >
                {formatCityLabel(city.name, city.stateCode)}
              </Link>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground">
            MasseurMatch is a directory. Review public profile details and contact independent providers directly to confirm availability, rates, location, and session details.
          </p>
        </section>
      </main>
    </>
  );
}
