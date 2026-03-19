import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { CityDirectoryPage } from "@/app/_components/city-directory-page";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import {
  DIRECTORY_SEGMENTS,
  IDENTITY_SEGMENT_SLUGS,
  SPECIALTY_KEYWORDS,
  getSegmentBySlug,
} from "@/app/_lib/directory-taxonomy";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { city: string; segment: string };

export const dynamic = "force-dynamic";

const fetchSegmentTherapists = cache(
  (cityName: string, modality: string | undefined) =>
    getPublicTherapists({ city: cityName, modality, page: 1, pageSize: 9 }),
);

export function generateStaticParams(): Params[] {
  const allCities = getCities();
  return allCities.flatMap((city) => DIRECTORY_SEGMENTS.map((segment) => ({ city: city.slug, segment: segment.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);

  if (!city || !segment) {
    return createPageMetadata({
      title: "Directory",
      description: "City segment directory page.",
      path: `/${resolvedParams.city}/${resolvedParams.segment}`,
      noIndex: true,
    });
  }

  const modalityFilter = IDENTITY_SEGMENT_SLUGS.has(segment.slug) ? undefined : segment.shortLabel;
  const { total } = await fetchSegmentTherapists(city.name, modalityFilter);

  return createPageMetadata({
    title: `${city.name} ${segment.label}`,
    description: `${segment.intro} Browse local listings, city context, and specialty paths in ${city.name}.`,
    path: `/${city.slug}/${segment.slug}`,
    keywords: [city.name, segment.label, `${city.name} ${segment.shortLabel}`],
    noIndex: total === 0,
  });
}

export default async function CitySegmentPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);

  if (!city || !segment) {
    notFound();
  }

  const modalityFilter = IDENTITY_SEGMENT_SLUGS.has(segment.slug) ? undefined : segment.shortLabel;
  const therapists = await fetchSegmentTherapists(city.name, modalityFilter);
  const segmentFaqs = [
    {
      question: `What does ${segment.shortLabel} mean on MasseurMatch?`,
      answer: `This category highlights profiles that align with ${segment.shortLabel.toLowerCase()} preferences in ${city.name}, making local discovery faster.`,
    },
    {
      question: `How do I contact providers from this ${city.name} page?`,
      answer: `Open any profile and use the direct call or message actions. MasseurMatch is directory-first and does not process bookings on-site.`,
    },
    {
      question: `Are these listings updated for near-me search intent?`,
      answer: `Yes. Segment pages are built as crawlable local doors so users can land directly on category + city combinations.`,
    },
  ];

  return (
    <CityDirectoryPage
      eyebrow="City segment page"
      title={`${city.name} ${segment.label}`}
      intro={`${segment.intro} This landing page gives search engines a meaningful city-plus-category destination and gives visitors a clean route into therapist profiles.`}
      breadcrumbJsonLd={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: city.name, path: `/${city.slug}` },
        { name: segment.shortLabel, path: `/${city.slug}/${segment.slug}` },
      ])}
      collectionJsonLd={buildCollectionPageJsonLd({
        name: `${city.name} ${segment.label}`,
        description: `${segment.intro} Browse local listings and internal specialty links in ${city.name}.`,
        path: `/${city.slug}/${segment.slug}`,
      })}
      itemListJsonLd={buildItemListJsonLd({
        name: `${city.name} ${segment.shortLabel} listings`,
        path: `/${city.slug}/${segment.slug}`,
        items: therapists.items.map((item) => ({
          name: item.display_name || item.full_name || "Therapist",
          path: `/therapists/${item.slug || item.id}`,
        })),
      })}
      leadLinks={[
        { href: `/${city.slug}`, label: `Back to ${city.name}` },
        { href: "/search", label: "Search all cities" },
      ]}
      linkSections={[
        {
          title: "Explore specialty massage pages",
          layout: "chips",
          items: SPECIALTY_KEYWORDS.map((keyword) => ({
            href: `/${city.slug}/${segment.slug}/${keyword.slug}`,
            label: keyword.label,
          })),
        },
      ]}
      therapists={therapists.items}
      listingTitle="Listings on this page"
      listingDescription={
        IDENTITY_SEGMENT_SLUGS.has(segment.slug)
          ? `These listings are shown with ${city.name} context and linked specialty pages to support discovery and internal navigation.`
          : `Listings here are filtered to reflect the ${segment.shortLabel.toLowerCase()} focus in ${city.name}.`
      }
      emptyTitle="No listings matched this segment yet."
      emptyDescription="Use the specialty links above or return to the city page for broader therapist coverage."
      faqTitle={`Common Questions About ${segment.shortLabel} Massage in ${city.name}`}
      faqItems={segmentFaqs}
    />
  );
}
