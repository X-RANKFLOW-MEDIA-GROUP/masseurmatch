import type { Metadata } from "next";
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
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";

type Params = { city: string; segment: string; keyword: string };

export const revalidate = 60;

export function generateStaticParams(): Params[] {
  return [];
}

async function fetchKeywordTherapists(cityName: string, segmentSlug: string, keywordSlug: string) {
  return getPublicTherapists({
    city: cityName,
    page: 1,
    pageSize: 9,
    ...resolveDirectoryFilters(
      getSegmentSearchFilters(segmentSlug),
      getKeywordSearchFilters(keywordSlug),
    ),
  });
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);
  const keyword = getKeywordBySlug(resolvedParams.keyword);
  const routePath = `/${resolvedParams.city}/${resolvedParams.segment}/${resolvedParams.keyword}`;

  if (!city || !segment || !keyword) {
    return createPageMetadata({
      title: "Specialty page",
      description: "Massage provider specialty directory page.",
      path: routePath,
      noIndex: true,
    });
  }

  let total = 0;
  try {
    ({ total } = await fetchKeywordTherapists(city.name, segment.slug, keyword.slug));
  } catch {
    total = 0;
  }

  return createPageMetadata({
    title: `${keyword.label} in ${city.name}`,
    description: `${keyword.intro} Compare public provider profiles and direct contact options for ${keyword.shortLabel.toLowerCase()} in ${city.name}.`,
    path: `/${city.slug}/${segment.slug}/${keyword.slug}`,
    keywords: [city.name, keyword.label, segment.label, `${city.name} ${keyword.shortLabel}`],
    noIndex: total === 0,
  });
}

export default async function CityKeywordPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);
  const keyword = getKeywordBySlug(resolvedParams.keyword);

  if (!city || !segment || !keyword) notFound();

  const therapists = await fetchKeywordTherapists(city.name, segment.slug, keyword.slug);
  const canonicalCityPath = `/${city.slug}`;
  const hasInventory = therapists.items.length > 0;

  const keywordFaqs = [
    {
      question: `How do I choose ${keyword.shortLabel.toLowerCase()} in ${city.name}?`,
      answer: `Compare provider supplied specialties, profile details, visible trust signals, and session format, then contact the independent provider directly to confirm fit, credentials important to you, and availability.`,
    },
    {
      question: `Are ${keyword.shortLabel.toLowerCase()} providers currently listed in ${city.name}?`,
      answer: hasInventory
        ? `Yes. This page currently has public profiles matching ${keyword.shortLabel.toLowerCase()} in ${city.name}. Review each profile and contact the provider directly for current details.`
        : `No approved public profiles currently match this exact specialty page. Use the broader ${city.name} directory to check other public profiles.`,
    },
    {
      question: `Does MasseurMatch book ${keyword.shortLabel.toLowerCase()} sessions?`,
      answer: `No. MasseurMatch is a discovery directory. Scheduling, pricing, payment, and session arrangements happen directly between the client and the independent provider.`,
    },
  ];

  return (
    <CityDirectoryPage
      eyebrow="Specialty massage page"
      title={`${keyword.label} in ${city.name}`}
      intro={hasInventory
        ? `${keyword.intro} Compare public profiles currently matched to ${keyword.shortLabel.toLowerCase()} in ${city.name}, including provider supplied service details and direct contact options.`
        : `${keyword.intro} No approved public profiles currently match this exact specialty in ${city.name}. Browse the broader city directory while new listings are reviewed.`}
      breadcrumbJsonLd={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: city.name, path: canonicalCityPath },
        { name: segment.shortLabel, path: `${canonicalCityPath}/${segment.slug}` },
        { name: keyword.shortLabel, path: `${canonicalCityPath}/${segment.slug}/${keyword.slug}` },
      ])}
      collectionJsonLd={buildCollectionPageJsonLd({
        name: `${keyword.label} in ${city.name}`,
        description: hasInventory
          ? `${keyword.intro} Compare public provider profiles in ${city.name}.`
          : `No approved public provider profiles currently match ${keyword.shortLabel.toLowerCase()} in ${city.name}.`,
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
      listingDescription={hasInventory
        ? `Compare public profiles that currently match ${keyword.shortLabel.toLowerCase()} in ${city.name}.`
        : `No approved public profiles currently match this exact specialty in ${city.name}.`}
      emptyTitle={`No public listings matched ${keyword.shortLabel} yet.`}
      emptyDescription="Try the broader city segment page or the main city page to view other public provider profiles."
      faqTitle={`Common Questions About ${keyword.shortLabel} in ${city.name}`}
      faqItems={keywordFaqs}
    />
  );
}
