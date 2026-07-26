import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CityDirectoryPage as CityDirectoryPageShell } from "@/app/_components/city-directory-page";
import { buildAreaCopyInput, buildSuburbIntro } from "@/app/_lib/area-copy";
import { getCities, getCityInventoryCount, getPublicTherapists } from "@/app/_lib/directory";
import {
  formatSlugLabel,
  getKeywordBySlug,
  getSegmentBySlug,
} from "@/app/_lib/directory-taxonomy";
import { getLaunchAreaPaths, getLaunchKeywordPaths, getLaunchSegmentPaths, isLaunchUrl } from "@/app/_lib/launch-urls";
import { GUIDES } from "@/app/guides/data";
import { getLocalSeoCityContent } from "@/app/_lib/local-seo-content";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { SEO_CITY_MIN_PUBLIC_PROFILES } from "@/app/_lib/sitemap-release";
import {
  TherapistComparison,
  type TherapistProfile as ComparisonTherapistProfile,
} from "@/components/sections/TherapistComparison";
import { formatCityLabel } from "@/data/cities";

type Params = { city: string };

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DFW_SUBURB_SLUGS = new Set([
  "plano",
  "irving",
  "richardson",
  "fort-worth",
  "frisco",
  "addison",
  "carrollton",
  "arlington",
  "grand-prairie",
]);

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function generateStaticParams(): Params[] {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);

  if (!city) {
    return createPageMetadata({
      title: "Page not found",
      description: "The requested city directory page could not be found.",
      path: `/${resolvedParams.city}`,
      noIndex: true,
    });
  }

  let inventoryCount = 0;
  try {
    inventoryCount = await getCityInventoryCount(city.name);
  } catch {
    inventoryCount = 0;
  }

  const localContent = getLocalSeoCityContent(city.slug);
  const cityLabel = formatCityLabel(city.name, city.stateCode);
  const countLabel = inventoryCount === 0 ? "" : inventoryCount < 10 ? String(inventoryCount) : `${inventoryCount}+`;
  const title = inventoryCount > 0
    ? localContent?.title || `${countLabel} Male Massage Therapists in ${cityLabel}`
    : `Male Massage Therapists in ${cityLabel} — Coming Soon`;
  const description = inventoryCount > 0
    ? localContent?.description ||
      `Find male massage therapists in ${cityLabel}. Compare specialties, incall and outcall options, availability, rates, trust signals, and direct contact details.`
    : `MasseurMatch is preparing its male massage therapist directory for ${cityLabel}. Explore active markets while local listings are added.`;

  return createPageMetadata({
    title,
    description,
    path: `/${city.slug}`,
    keywords: [
      `male massage ${city.name}`,
      `${city.name} male massage`,
      `male massage ${city.name} ${city.stateCode}`,
      `gay friendly massage ${city.name}`,
      `massage therapist ${city.name}`,
      `deep tissue massage ${city.name}`,
      `sports massage ${city.name}`,
      `mobile massage ${city.name}`,
    ],
    noIndex: inventoryCount < SEO_CITY_MIN_PUBLIC_PROFILES,
  });
}

export default async function CityDirectoryPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);

  if (!city) notFound();

  const canonicalCityPath = `/${city.slug}`;
  const localContent = getLocalSeoCityContent(city.slug);
  const allCities = getCities();

  const citySegmentLinks = getLaunchSegmentPaths()
    .filter((path) => path.startsWith(`${canonicalCityPath}/`))
    .map((path) => {
      const [, segmentSlug] = path.split("/").filter(Boolean);
      const segment = getSegmentBySlug(segmentSlug || "");
      return {
        href: path,
        label: segment?.shortLabel || formatSlugLabel(segmentSlug || "segment"),
        description:
          segment?.intro || `Browse ${formatSlugLabel(segmentSlug || "segment").toLowerCase()} options in ${city.name}.`,
      };
    });

  const cityKeywordLinks = getLaunchKeywordPaths()
    .filter((path) => path.startsWith(`${canonicalCityPath}/`))
    .map((path) => {
      const [, , keywordSlug] = path.split("/").filter(Boolean);
      const keyword = getKeywordBySlug(keywordSlug || "");
      return { href: path, label: keyword?.shortLabel || formatSlugLabel(keywordSlug || "service") };
    });

  const cityAreaLinks = getLaunchAreaPaths()
    .filter((path) => path.startsWith(`${canonicalCityPath}/`))
    .map((path) => {
      const [, , areaSlug] = path.split("/").filter(Boolean);
      return { href: path, label: formatSlugLabel(areaSlug || "area") };
    });

  const cityGuideLinks = GUIDES.filter((guide) => guide.cityLinks.includes(canonicalCityPath))
    .slice(0, 4)
    .map((guide) => ({ href: `/guides/${guide.slug}`, label: guide.h1 }));

  const relatedCityLinks = (localContent?.relatedCitySlugs || [])
    .map((slug) => allCities.find((entry) => entry.slug === slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .map((entry) => ({ href: `/${entry.slug}`, label: formatCityLabel(entry.name, entry.stateCode) }));

  const therapists = await getPublicTherapists({ city: city.name, page: 1, pageSize: 9 });
  const hasInventory = therapists.items.length > 0;

  const cityIntro = localContent?.intro
    || (DFW_SUBURB_SLUGS.has(city.slug)
      ? buildSuburbIntro(buildAreaCopyInput({ area: city.name, city: "DFW", therapists: therapists.items }))
      : hasInventory
        ? `Find male massage therapists in ${city.name}. Compare public profiles, incall and outcall options, specialties, availability, rates, and direct contact details.`
        : `MasseurMatch is preparing its ${city.name} directory. Profiles are reviewed before going live, and empty markets remain outside the sitemap until real inventory is available.`);

  const defaultFaqs = [
    {
      question: `How do I find a male massage therapist in ${city.name}?`,
      answer: "Compare public profiles, specialties, incall or outcall options, availability, rates, service areas, and visible trust signals before contacting a provider directly.",
    },
    {
      question: `Can I find outcall massage options in ${city.name}?`,
      answer: "Yes, when providers list outcall or mobile service. Confirm the exact location, service area, travel fee, rate, timing, and boundaries directly.",
    },
    {
      question: `Does MasseurMatch handle booking in ${city.name}?`,
      answer: "No. MasseurMatch is a discovery directory. Clients contact independent providers directly to confirm availability, pricing, boundaries, and scheduling.",
    },
  ];
  const cityFaqs = localContent?.faqs || defaultFaqs;

  const comparisonProfiles: ComparisonTherapistProfile[] = therapists.items.slice(0, 3).map((item, idx) => ({
    id: item.id,
    name: item.display_name || item.full_name || `Therapist ${idx + 1}`,
    image: item.avatar_url || "",
    reviews: item.review_count || 0,
    specialties: item.specialties || [],
    priceRange: {
      min: item.incall_price || 80,
      max: item.outcall_price || item.incall_price || 140,
    },
    availability: { available: item.available_now === true },
    incall: Boolean(item.incall_price),
    outcall: Boolean(item.outcall_price),
    experience: item.years_experience ?? undefined,
    features: {
      incall: Boolean(item.incall_price),
      outcall: Boolean(item.outcall_price),
      verified: item._tier === "standard" || item._tier === "pro" || item._tier === "elite",
      profile: true,
    },
  }));

  return (
    <>
      <CityDirectoryPageShell
        eyebrow="City directory"
        title={hasInventory ? `Male massage therapists in ${city.name}` : `Male massage therapists in ${city.name} — coming soon`}
        intro={cityIntro}
        breadcrumbJsonLd={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: city.stateName, path: `/states/${toSlug(city.stateName)}` },
          { name: city.name, path: canonicalCityPath },
        ])}
        collectionJsonLd={buildCollectionPageJsonLd({
          name: hasInventory ? `Male massage therapists in ${city.name}` : `${city.name} massage directory — coming soon`,
          description: cityIntro,
          path: canonicalCityPath,
        })}
        itemListJsonLd={buildItemListJsonLd({
          name: `${city.name} public therapist listings`,
          path: canonicalCityPath,
          items: therapists.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
        leadLinks={[
          hasInventory
            ? isLaunchUrl(`${canonicalCityPath}/verified-profiles`)
              ? { href: `${canonicalCityPath}/verified-profiles`, label: `Active profiles in ${city.name}` }
              : { href: `${canonicalCityPath}/male-therapists`, label: `Male therapists in ${city.name}` }
            : { href: "/states", label: "Browse active states" },
          { href: "/search", label: "Search all providers" },
          { href: "/safety", label: "Read safety guidance" },
        ]}
        linkSections={[
          ...(citySegmentLinks.length
            ? [{
                title: `Popular massage searches in ${city.name}`,
                layout: "grid" as const,
                description: "Browse canonical local pages by session format, audience, and service intent.",
                items: citySegmentLinks,
              }]
            : []),
          ...(cityKeywordLinks.length
            ? [{
                title: `Massage techniques in ${city.name}`,
                layout: "chips" as const,
                description: "Technique pages are indexed only when matching public provider inventory exists.",
                items: cityKeywordLinks,
              }]
            : []),
          ...(cityAreaLinks.length
            ? [{
                title: `Neighborhoods and local areas in ${city.name}`,
                layout: "chips" as const,
                description: "Local-area pages remain inventory-gated to avoid thin or duplicate pages.",
                items: cityAreaLinks,
              }]
            : []),
          ...(relatedCityLinks.length
            ? [{
                title: `Nearby cities to ${city.name}`,
                layout: "chips" as const,
                items: relatedCityLinks,
              }]
            : []),
          ...(cityGuideLinks.length
            ? [{
                title: `${city.name} massage guides`,
                layout: "chips" as const,
                description: "Editorial guides that help you choose a session format, technique, and provider with confidence.",
                items: cityGuideLinks,
              }]
            : []),
          {
            title: "Compare major directory alternatives",
            layout: "chips" as const,
            items: [
              { href: "/compare", label: "All comparisons" },
              { href: "/compare/masseurmatch-vs-masseurfinder", label: "MasseurMatch vs MasseurFinder" },
              { href: "/compare/masseurmatch-vs-rentmasseur", label: "MasseurMatch vs RentMasseur" },
            ],
          },
        ]}
        therapists={therapists.items}
        listingTitle={`Public provider profiles in ${city.name}`}
        listingDescription="Compare specialties, session formats, availability, rates, service areas, and direct contact options."
        emptyTitle={`No approved public profiles are live in ${city.name} yet.`}
        emptyDescription="This city remains outside the sitemap until real public inventory is available. Browse an active state or city instead."
        faqTitle={`Common questions about male massage in ${city.name}`}
        faqItems={cityFaqs}
      />

      {comparisonProfiles.length > 1 ? (
        <section className="page-shell pb-14">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Compare profiles in {city.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Review public profile details side by side before contacting a provider.</p>
            <div className="mt-6">
              <TherapistComparison
                profiles={comparisonProfiles}
                features={[
                  { key: "incall", label: "Incall" },
                  { key: "outcall", label: "Outcall" },
                  { key: "verified", label: "Paid directory tier" },
                  { key: "profile", label: "Public profile" },
                ]}
              />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
