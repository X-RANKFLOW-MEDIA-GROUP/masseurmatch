import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityDirectoryPage as CityDirectoryPageShell } from "@/app/_components/city-directory-page";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { DIRECTORY_SEGMENTS, SPECIALTY_KEYWORDS } from "@/app/_lib/directory-taxonomy";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { city: string };

export function generateStaticParams(): Params[] {
  return getCities().map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);

  if (!city) {
    return createPageMetadata({
      title: "City",
      description: "City directory page.",
      path: `/${resolvedParams.city}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${city.name} massage therapists`,
    description: city.intro,
    path: `/${city.slug}`,
    keywords: [
      `${city.name} massage therapist`,
      `${city.name} wellness`,
      `${city.name} massage directory`,
    ],
  });
}

export default async function CityDirectoryPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);

  if (!city) {
    notFound();
  }

  const therapists = await getPublicTherapists({ city: city.name, page: 1, pageSize: 9 });

  return (
    <CityDirectoryPageShell
      eyebrow="City directory"
      title={`${city.name} massage therapists`}
      intro={city.intro}
      breadcrumbJsonLd={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: city.name, path: `/${city.slug}` },
      ])}
      collectionJsonLd={buildCollectionPageJsonLd({
        name: `${city.name} massage therapists`,
        description: city.intro,
        path: `/${city.slug}`,
      })}
      itemListJsonLd={buildItemListJsonLd({
        name: `${city.name} therapist listings`,
        path: `/${city.slug}`,
        items: therapists.items.map((item) => ({
          name: item.display_name || item.full_name || "Therapist",
          path: `/therapists/${item.slug || item.id}`,
        })),
      })}
      leadLinks={[
        { href: "/search", label: "Search all cities" },
        { href: "/therapists", label: "Browse therapist directory" },
      ]}
      linkSections={[
        {
          title: "Explore by category",
          layout: "grid",
          items: DIRECTORY_SEGMENTS.slice(0, 3).map((segment) => ({
            href: `/${city.slug}/${segment.slug}`,
            label: segment.shortLabel,
            description: segment.intro,
          })),
        },
        {
          title: `Popular specialties in ${city.name}`,
          layout: "chips",
          items: SPECIALTY_KEYWORDS.map((keyword) => ({
            href: `/${city.slug}/wellness/${keyword.slug}`,
            label: keyword.label,
          })),
        },
      ]}
      therapists={therapists.items}
      listingTitle={`Therapist listings in ${city.name}`}
      listingDescription="Public therapist cards help this city page work as both a user entry point and a crawlable local landing page for search."
      emptyTitle={`No public listings yet for ${city.name}.`}
      emptyDescription="Visitors can still use the broader search page, city category pages, and specialty links while this city grows."
    />
  );
}
