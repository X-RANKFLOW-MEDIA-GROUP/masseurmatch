import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityDirectoryPage } from "@/app/_components/city-directory-page";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import {
  formatSlugLabel,
  getKeywordBySlug,
  getSegmentSearchFilters,
  getSegmentBySlug,
} from "@/app/_lib/directory-taxonomy";
import { getLaunchKeywordPaths, isLaunchUrl } from "@/app/_lib/launch-urls";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { formatCityLabel } from "@/data/cities";

type Params = { city: string; segment: string };

export const revalidate = 60;

async function fetchSegmentTherapists(cityName: string, segmentSlug: string) {
  return getPublicTherapists({
    city: cityName,
    page: 1,
    pageSize: 9,
    ...getSegmentSearchFilters(segmentSlug),
  });
}

export function generateStaticParams(): Params[] {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);
  const routePath = `/${resolvedParams.city}/${resolvedParams.segment}`;

  if (!city || !segment) {
    return createPageMetadata({
      title: "Directory",
      description: "City segment directory page.",
      path: routePath,
      noIndex: true,
    });
  }

  let total = 0;
  try {
    ({ total } = await fetchSegmentTherapists(city.name, segment.slug));
  } catch {
    total = 0;
  }

  const isGayMassageSegment = segment.slug === "lgbtq-friendly";
  const cityLabel = formatCityLabel(city.name, city.stateCode);
  const title = isGayMassageSegment
    ? `LGBTQ+-Affirming Male Massage Therapists in ${cityLabel}`
    : `${city.name} ${segment.label}`;
  const description = isGayMassageSegment
    ? `Browse public LGBTQ+-affirming male massage therapist profiles in ${cityLabel}. Compare provider supplied details, visible trust signals, session formats, rates, availability, and direct contact options.`
    : `${segment.intro} Compare public provider profiles and direct contact options in ${city.name}.`;
  const keywords = isGayMassageSegment
    ? [
        `LGBTQ massage ${city.name}`,
        `LGBTQ massage therapist ${city.name}`,
        `gay friendly massage ${city.name}`,
        `male massage therapist ${city.name}`,
        `LGBTQ affirming massage ${city.stateCode}`,
      ]
    : [city.name, segment.label, `${city.name} ${segment.shortLabel}`];

  return createPageMetadata({
    title,
    description,
    path: `/${city.slug}/${segment.slug}`,
    keywords,
    noIndex: total === 0,
  });
}

export default async function CitySegmentPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);

  if (!city || !segment) notFound();

  const therapists = await fetchSegmentTherapists(city.name, segment.slug);
  const hasInventory = therapists.items.length > 0;
  const canonicalCityPath = `/${city.slug}`;
  const launchServiceLinks = getLaunchKeywordPaths()
    .filter((path) => path.startsWith(`${canonicalCityPath}/${segment.slug}/`))
    .map((path) => {
      const [, , keywordSlug] = path.split("/").filter(Boolean);
      const keyword = getKeywordBySlug(keywordSlug || "");
      return {
        href: path,
        label: keyword?.shortLabel || formatSlugLabel(keywordSlug || "service"),
      };
    });

  const segmentFaqs = [
    {
      question: `What does ${segment.shortLabel} mean on MasseurMatch?`,
      answer: `This page groups public profiles that match the ${segment.shortLabel.toLowerCase()} filter in ${city.name}. Review each provider's own profile details and visible trust signals before contacting them directly.`,
    },
    {
      question: `Are matching providers currently listed in ${city.name}?`,
      answer: hasInventory
        ? `Yes. This page currently has public profiles matching the ${segment.shortLabel.toLowerCase()} filter in ${city.name}.`
        : `No approved public profiles currently match this exact filter in ${city.name}. Use the broader city directory to see other public profiles.`,
    },
    {
      question: `Does MasseurMatch handle bookings from this ${city.name} page?`,
      answer: `No. MasseurMatch is a discovery directory. Scheduling, pricing, payment, credentials important to you, and session arrangements are confirmed directly with the independent provider.`,
    },
  ];

  const verifiedProfilesPath = `${canonicalCityPath}/verified-profiles`;
  const secondaryLeadLink =
    segment.slug !== "verified-profiles" && isLaunchUrl(verifiedProfilesPath)
      ? { href: verifiedProfilesPath, label: `Identity Verified profiles in ${city.name}` }
      : { href: "/search", label: "Search all providers" };

  return (
    <CityDirectoryPage
      eyebrow="City directory filter"
      title={`${city.name} ${segment.label}`}
      intro={hasInventory
        ? `${segment.intro} Compare currently matched public profiles in ${city.name}, then open a profile to review provider supplied details and contact options.`
        : `${segment.intro} No approved public profiles currently match this exact filter in ${city.name}. Browse the broader city directory while new listings are reviewed.`}
      breadcrumbJsonLd={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: city.name, path: canonicalCityPath },
        { name: segment.shortLabel, path: `${canonicalCityPath}/${segment.slug}` },
      ])}
      collectionJsonLd={buildCollectionPageJsonLd({
        name: `${city.name} ${segment.label}`,
        description: hasInventory
          ? `${segment.intro} Browse currently matched public profiles in ${city.name}.`
          : `No approved public profiles currently match the ${segment.shortLabel.toLowerCase()} filter in ${city.name}.`,
        path: `${canonicalCityPath}/${segment.slug}`,
      })}
      itemListJsonLd={buildItemListJsonLd({
        name: `${city.name} ${segment.shortLabel} listings`,
        path: `${canonicalCityPath}/${segment.slug}`,
        items: therapists.items.map((item) => ({
          name: item.display_name || item.full_name || "Therapist",
          path: `/therapists/${item.slug || item.id}`,
        })),
      })}
      leadLinks={[
        { href: canonicalCityPath, label: `Back to ${city.name}` },
        secondaryLeadLink,
        { href: "/safety", label: "Safety guidance" },
      ]}
      linkSections={
        launchServiceLinks.length
          ? [
              {
                title: `Related services in ${city.name}`,
                layout: "chips" as const,
                description: "Narrow the public directory by service or session format where matching provider inventory exists.",
                items: launchServiceLinks,
              },
            ]
          : []
      }
      therapists={therapists.items}
      listingTitle="Public profiles on this page"
      listingDescription={hasInventory
        ? `These public profiles currently match the ${segment.shortLabel.toLowerCase()} filter in ${city.name}.`
        : `No approved public profiles currently match the ${segment.shortLabel.toLowerCase()} filter in ${city.name}.`}
      emptyTitle="No public listings matched this filter yet."
      emptyDescription="Return to the city page to view other public provider profiles."
      faqTitle={`Common Questions About ${segment.shortLabel} in ${city.name}`}
      faqItems={segmentFaqs}
    />
  );
}
