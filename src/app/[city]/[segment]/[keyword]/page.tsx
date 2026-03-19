import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { CityDirectoryPage } from "@/app/_components/city-directory-page";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import {
  getKeywordBySlug,
  getSegmentBySlug,
} from "@/app/_lib/directory-taxonomy";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { city: string; segment: string; keyword: string };

export const dynamic = "force-dynamic";

const fetchKeywordTherapists = cache(
  (cityName: string, modality: string) =>
    getPublicTherapists({ city: cityName, modality, page: 1, pageSize: 9 }),
);

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);
  const keyword = getKeywordBySlug(resolvedParams.keyword);

  if (!city || !segment || !keyword) {
    return createPageMetadata({
      title: "Specialty page",
      description: "Keyword directory page.",
      path: `/${resolvedParams.city}/${resolvedParams.segment}/${resolvedParams.keyword}`,
      noIndex: true,
    });
  }

  const { total } = await fetchKeywordTherapists(city.name, keyword.shortLabel);

  return createPageMetadata({
    title: `${keyword.label} in ${city.name}`,
    description: `${keyword.intro} Compare local therapist listings through the ${segment.shortLabel.toLowerCase()} path in ${city.name}.`,
    path: `/${city.slug}/${segment.slug}/${keyword.slug}`,
    keywords: [city.name, keyword.label, segment.label],
    noIndex: total === 0,
  });
}

export default async function CityKeywordPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);
  const keyword = getKeywordBySlug(resolvedParams.keyword);

  if (!city || !segment || !keyword) {
    notFound();
  }

  const therapists = await fetchKeywordTherapists(city.name, keyword.shortLabel);
  const keywordFaqs = [
    {
      question: `How do I choose ${keyword.shortLabel.toLowerCase()} in ${city.name}?`,
      answer: `Compare specialties, profile bios, and verification signals first, then contact providers directly to confirm fit and availability.`,
    },
    {
      question: `Can I find nearby ${keyword.shortLabel.toLowerCase()} options fast?`,
      answer: `Yes. This page is optimized for local discovery and links to therapist profiles built for immediate call or message actions.`,
    },
    {
      question: `Does MasseurMatch process appointments for ${keyword.shortLabel.toLowerCase()}?`,
      answer: `No. MasseurMatch is a discovery engine. Scheduling is handled directly between visitor and provider.`,
    },
  ];

  return (
    <CityDirectoryPage
      eyebrow="Specialty massage page"
      title={`${keyword.label} in ${city.name}`}
      intro={`${keyword.intro} This specialty page also inherits the ${segment.shortLabel.toLowerCase()} path so search engines and users have stronger context around the page intent.`}
      breadcrumbJsonLd={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: city.name, path: `/${city.slug}` },
        { name: segment.shortLabel, path: `/${city.slug}/${segment.slug}` },
        { name: keyword.shortLabel, path: `/${city.slug}/${segment.slug}/${keyword.slug}` },
      ])}
      collectionJsonLd={buildCollectionPageJsonLd({
        name: `${keyword.label} in ${city.name}`,
        description: `${keyword.intro} Compare local therapist listings in ${city.name}.`,
        path: `/${city.slug}/${segment.slug}/${keyword.slug}`,
      })}
      itemListJsonLd={buildItemListJsonLd({
        name: `${city.name} ${keyword.shortLabel} listings`,
        path: `/${city.slug}/${segment.slug}/${keyword.slug}`,
        items: therapists.items.map((item) => ({
          name: item.display_name || item.full_name || "Therapist",
          path: `/therapists/${item.slug || item.id}`,
        })),
      })}
      leadLinks={[
        { href: `/${city.slug}/${segment.slug}`, label: `Back to ${segment.shortLabel}` },
        { href: `/${city.slug}`, label: `Back to ${city.name}` },
        { href: "/search", label: "Search all cities" },
      ]}
      therapists={therapists.items}
      listingTitle={`Listings for ${keyword.shortLabel}`}
      listingDescription={`Compare public therapist cards that match ${keyword.shortLabel.toLowerCase()} in ${city.name}.`}
      emptyTitle={`No public listings matched ${keyword.shortLabel} yet.`}
      emptyDescription="Try the broader city segment page or the main search page to view nearby or related therapist profiles."
      faqTitle={`Common Questions About ${keyword.shortLabel} in ${city.name}`}
      faqItems={keywordFaqs}
    />
  );
}
