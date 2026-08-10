import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/JsonLd";
import { getCities } from "@/app/_lib/directory";
import {
  applyExploreFilters,
  buildExploreItemListJsonLd,
  getBaseExploreFilters,
  getExploreDefaults,
} from "@/app/_lib/explore";
import { loadExploreProviders } from "@/app/_lib/explore-server";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";
import ExplorePageClient from "./ExplorePageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = createPageMetadata({
  title: "Explore massage therapists near you — MasseurMatch",
  description:
    "Explore public massage therapist profiles by location, distance, availability, service format, and price. Use your location or browse the full directory.",
  path: "/explore",
  keywords: [
    "massage therapist near me",
    "explore massage therapists",
    "local massage directory",
  ],
});

export default async function ExplorePage() {
  const filters = getExploreDefaults();
  const baseFilters = getBaseExploreFilters(filters);
  const baseResult = await loadExploreProviders(baseFilters);
  const initialItems = applyExploreFilters(baseResult.items, filters);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explore", path: "/explore" },
        ])}
      />
      <JsonLd data={buildExploreItemListJsonLd("United States", initialItems.slice(0, 24))} />

      <ExplorePageClient
        cities={getCities()}
        hasExplicitLocation={false}
        initialBaseItems={baseResult.items}
        initialFilters={filters}
        initialInvalidProviderCount={baseResult.invalidProviderCount}
        initialTotal={initialItems.length}
      />
    </>
  );
}
