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
import { getLaunchKeywordPaths } from "@/app/_lib/launch-urls";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

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
  // Generate long-tail local SEO routes on demand so production builds stay fast and reliable.
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);
  const segment = getSegmentBySlug(resolvedParams.segment);
  const routePath = `/${resolvedParams.city}/${resolvedParams.segment}`;

  // FIRST_30_URLS_IN_ORDER controls launch discovery/sitemap exposure only.
  // Any city and segment that exist in the canonical data/taxonomy must remain
  // routable so legacy redirects never terminate at a 404.
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
    // Supabase unavailable — fall through with zero total
  }

  const isGayMassageSegment = segment.slug === "gay-massage" || segment.slug === "lgbtq-friendly";
  const cityLabel = `${city.name}, ${city.stateCode}`;
  const title = isGayMassageSegment
    ? `Gay Massage Therapists in ${cityLabel} | Verified LGBTQ+-Affirming`
    : `${city.name} ${segment.label}`;
  const description = isGayMassageSegment
    ? `Find verified, LGBTQ+-affirming male massage therapists in ${cityLabel}. Browse gay-friendly profiles with identity verification, affirming practice standards, and direct contact on MasseurMatch.`
    : `${segment.intro} Compare trusted local listings, direct contact options, and stronger city-intent pages in ${city.name}.`;
  const keywords = isGayMassageSegment
    ? [
        `gay massage ${city.name}`,
        `gay massage therapist ${city.name}`,
        `LGBTQ massage ${city.name}`,
        `gay-friendly massage near me`,
        `male massage therapist ${city.name}`,
        `queer massage ${city.name}`,
        `${city.name} gay bodywork`,
        `LGBTQ affirming massage ${city.stateCode}`,
      ]
    : [city.name, segment.label, `${city.name} verified massage`, `${city.name} ${segment.shortLabel}`];

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

  if (!city || !segment) {
    notFound();
  }

  const therapists = await fetchSegmentTherapists(city.name, segment.slug);
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
      answer: `This page groups listings around ${segment.shortLabel.toLowerCase()} intent in ${city.name}, making local discovery safer, cleaner, and faster.`,
    },
    {
      question: `How do I contact providers from this ${city.name} page?`,
      answer: `Open any profile and use the direct call or message actions. MasseurMatch stays discovery-first and does not process bookings on-site.`,
    },
    {
      question: `Why does this page exist separately from the main ${city.name} page?`,
      answer: `Segment pages give Google and visitors a stronger city-plus-intent destination, which helps MasseurMatch compete for long-tail local searches.`,
    },
  ];

  return (
    <CityDirectoryPage
      eyebrow="City segment page"
      title={`${city.name} ${segment.label}`}
      intro={`${segment.intro} This landing page gives search engines a meaningful city-plus-category destination and gives visitors a clean route into therapist profiles.`}
      breadcrumbJsonLd={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: city.name, path: canonicalCityPath },
        { name: segment.shortLabel, path: `${canonicalCityPath}/${segment.slug}` },
      ])}
      collectionJsonLd={buildCollectionPageJsonLd({
        name: `${city.name} ${segment.label}`,
        description: `${segment.intro} Browse local listings and internal specialty links in ${city.name}.`,
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
        { href: `/search?city=${city.slug}&verified=1`, label: `Verified in ${city.name}` },
        { href: "/safety", label: "Safety guidance" },
      ]}
      linkSections={
        launchServiceLinks.length
          ? [
              {
                title: `Service pages inside ${segment.shortLabel}`,
                layout: "chips" as const,
                description:
                  "Use these city-plus-service routes to narrow the directory by both intent and modality without losing the trust context.",
                items: launchServiceLinks,
              },
            ]
          : []
      }
      therapists={therapists.items}
      listingTitle="Listings on this page"
      listingDescription={`These listings reflect the ${segment.shortLabel.toLowerCase()} focus in ${city.name} and are structured to feel more premium, more trustworthy, and easier to scan on mobile.`}
      emptyTitle="No listings matched this segment yet."
      emptyDescription="Use the service links above or return to the city page for broader trusted-directory coverage."
      faqTitle={`Common Questions About ${segment.shortLabel} Massage in ${city.name}`}
      faqItems={segmentFaqs}
    />
  );
}
