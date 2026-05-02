import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/JsonLd";
import { createPageMetadata, buildBreadcrumbJsonLd } from "@/app/_lib/seo";
import {
  applyExploreFilters,
  buildExploreItemListJsonLd,
  getBaseExploreFilters,
  getExploreDefaults,
  loadExploreProviders,
  parseExploreSearchParams,
} from "@/app/_lib/explore";
import { getCities } from "@/app/_lib/directory";
import ExplorePageClient from "./ExplorePageClient";

type ExplorePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const DESCRIPTION =
  "Find providers near you with live availability, distance, and starting prices on MasseurMatch.";

const getFirstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || "" : value || "";

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseExploreSearchParams(params);
  const metadata = createPageMetadata({
    title: `Explore Providers in ${filters.city || getExploreDefaults().city} | MasseurMatch`,
    description: DESCRIPTION,
    path: "/explore",
    keywords: [
      "explore providers",
      "available now massage",
      "starting price massage",
      filters.city,
    ],
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

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const filters = parseExploreSearchParams(params);
  const baseFilters = getBaseExploreFilters(filters);
  const baseResult = await loadExploreProviders(baseFilters);
  const initialItems = applyExploreFilters(baseResult.items, filters);
  const hasExplicitLocation = Boolean(getFirstParam(params.city) || getFirstParam(params.zip));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explore", path: "/explore" },
        ])}
      />
      <JsonLd data={buildExploreItemListJsonLd(filters.city, initialItems.slice(0, 12))} />

      <ExplorePageClient
        cities={getCities()}
        hasExplicitLocation={hasExplicitLocation}
        initialBaseItems={baseResult}
        initialFilters={filters}
        initialInvalidProviderCount={0}
        initialTotal={initialItems.length}
      />
    </>
  );
}
