import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import { getCities } from "@/app/_lib/directory";
import {
  applyExploreFilters,
  buildExploreItemListJsonLd,
  getBaseExploreFilters,
  getExploreDefaults,
  loadExploreProviders,
} from "@/app/_lib/explore";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";
import ExplorePageClient from "../../ExplorePageClient";

type Params = { city: string };

export const revalidate = 60;

function getExploreCity(slug: string) {
  return getCities().find((city) => city.slug === slug);
}

export function generateStaticParams(): Params[] {
  return getCities().map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getExploreCity(resolvedParams.city);
  const metadata = createPageMetadata({
    title: city ? `Explore providers in ${city.name}` : "Explore providers",
    description: city
      ? `Browse provider discovery results for ${city.name} with distance, pricing, and availability filters.`
      : "Browse providers by city.",
    path: `/explore/usa/${resolvedParams.city}`,
    keywords: city ? [`explore ${city.name}`, `${city.name} providers`, `${city.name} massage`] : ["explore providers"],
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

export default async function ExploreCityPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const city = getExploreCity(resolvedParams.city);

  if (!city) {
    notFound();
  }

  const filters = {
    ...getExploreDefaults(),
    city: city.name,
  };
  const baseFilters = getBaseExploreFilters(filters);
  const baseResult = await loadExploreProviders(baseFilters);
  const initialItems = applyExploreFilters(baseResult, filters);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explore", path: "/explore" },
          { name: city.name, path: `/explore/usa/${city.slug}` },
        ])}
      />
      <JsonLd data={buildExploreItemListJsonLd(city.name, initialItems.slice(0, 12))} />

      <ExplorePageClient
        cities={getCities()}
        hasExplicitLocation
        initialBaseItems={baseResult}
        initialFilters={filters}
        initialInvalidProviderCount={0}
        initialTotal={initialItems.length}
      />
    </>
  );
}
