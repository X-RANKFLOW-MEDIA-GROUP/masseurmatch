import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { CityDirectoryPage } from "@/app/_components/city-directory-page";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import {
  getKeywordSearchFilters,
  getKeywordBySlug,
  getSegmentSearchFilters,
  resolveDirectoryFilters,
  getSegmentBySlug,
} from "@/app/_lib/directory-taxonomy";
import { getLaunchKeywordPaths, isLaunchUrl } from "@/app/_lib/launch-urls";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { city: string; segment: string; keyword: string };

export const revalidate = 60;

export function generateStaticParams(): Params[] {
  return getLaunchKeywordPaths().map((path) => {
    const [city, segment, keyword] = path.split("/").filter(Boolean);
    return {
      city: city || "",
      segment: segment || "",
      keyword: keyword || "",
    };
  });
}

const fetchKeywordTherapists = cache(
  (cityName: string, segmentSlug: string, keywordSlug: string) =>
    getPublicTherapists({
      city: cityName,
      page: 1,
      pageSize: 9,
      ...resolveDirectoryFilters(
        getSegmentSearchFilters(segmentSlug),
        getKeywordSearchFilters(keywordSlug),
      ),
    }),
);

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);
  const keyword = getKeywordBySlug(resolvedParams.keyword);
  const routePath = `/${resolvedParams.city}/${resolvedParams.segment}/${resolvedParams.keyword}`;

  if (!city || !segment || !keyword || !isLaunchUrl(routePath)) {
    return createPageMetadata({
      title: "Specialty page",
      description: "Keyword directory page.",
      path: routePath,
      noIndex: true,
    });
  }

  const { total } = await fetchKeywordTherapists(city.name, segment.slug, keyword.slug);

  return createPageMetadata({
    title: `${keyword.label} in ${city.name}`,
    description: `${keyword.intro} Compare trusted local therapist listings through the ${segment.shortLabel.toLowerCase()} path in ${city.name}.`,
    path: `/${city.slug}/${segment.slug}/${keyword.slug}`,
    keywords: [city.name, keyword.label, segment.label, `${city.name} verified ${keyword.shortLabel}`],
    noIndex: total === 0,
  });
}

export default async function CityKeywordPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);
  const keyword = getKeywordBySlug(resolvedParams.keyword);
  const routePath = `/${resolvedParams.city}/${resolvedParams.segment}/${resolvedParams.keyword}`;

  if (!city || !segment || !keyword || !isLaunchUrl(routePath)) {
    notFound();
  }

  const therapists = await fetchKeywordTherapists(city.name, segment.slug, keyword.slug);
  const canonicalCityPath = `/${city.slug}`;
  const keywordFaqs = [
    {
      question: `How do I choose ${keyword.shortLabel.toLowerCase()} in ${city.name}?`,
      answer: `Compare specialties, profile bios, verification signals, and session format first, then contact providers directly to confirm fit and availability.`,
    },
    {
      question: `Can I find nearby ${keyword.shortLabel.toLowerCase()} options fast?`,
      answer: `Yes. This page is optimized for local discovery and links to profiles built for immediate call or message actions on mobile.`,
    },
    {
      question: `Is this page only for booking ${keyword.shortLabel.toLowerCase()}?`,
      answer: `No. MasseurMatch is a discovery engine. This page helps visitors find a more relevant shortlist, but scheduling still happens directly between visitor and provider.`,
    },
  ];

  return (
    <CityDirectoryPage
      eyebrow="Specialty massage page"
      title={`${keyword.label} in ${city.name}`}
      intro={`${keyword.intro} This specialty page also inherits the ${segment.shortLabel.toLowerCase()} path so search engines and users have stronger context around the page intent.`}
      breadcrumbJsonLd={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: city.name, path: canonicalCityPath },
        { name: segment.shortLabel, path: `${canonicalCityPath}/${segment.slug}` },
        { name: keyword.shortLabel, path: `${canonicalCityPath}/${segment.slug}/${keyword.slug}` },
      ])}
      collectionJsonLd={buildCollectionPageJsonLd({
        name: `${keyword.label} in ${city.name}`,
        description: `${keyword.intro} Compare local therapist listings in ${city.name}.`,
        path: `${canonicalCityPath}/${segment.slug}/${keyword.slug}`,
      })}
      itemListJsonLd={buildItemListJsonLd({
        name: `${city.name} ${keyword.shortLabel} listings`,
        path: `${canonicalCityPath}/${segment.slug}/${keyword.slug}`,
        items: therapists.items.map((item) => ({
          name: item.display_name || item.full_name || "Therapist",
          path: `/therapists/${item.slug || item.id}`,
        })),
      })}
      leadLinks={[
        { href: `${canonicalCityPath}/${segment.slug}`, label: `Back to ${segment.shortLabel}` },
        { href: canonicalCityPath, label: `Back to ${city.name}` },
        { href: "/safety", label: "Safety guidance" },
      ]}
      therapists={therapists.items}
      listingTitle={`Listings for ${keyword.shortLabel}`}
      listingDescription={`Compare public therapist cards that match ${keyword.shortLabel.toLowerCase()} in ${city.name}, with trust signals and direct-contact clarity kept visible.`}
      emptyTitle={`No public listings matched ${keyword.shortLabel} yet.`}
      emptyDescription="Try the broader city segment page or the main city page to view nearby or related therapist profiles."
      faqTitle={`Common Questions About ${keyword.shortLabel} in ${city.name}`}
      faqItems={keywordFaqs}
    />
  );
}
