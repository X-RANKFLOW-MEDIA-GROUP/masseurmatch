import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityDirectoryPage as CityDirectoryPageShell } from "@/app/_components/city-directory-page";
import { JsonLd } from "@/app/_components/json-ld";
import { buildAreaCopyInput, buildSuburbIntro } from "@/app/_lib/area-copy";
import { getCities, getCityInventoryCount, getPublicTherapists } from "@/app/_lib/directory";
import {
  formatSlugLabel,
  getKeywordBySlug,
  getSegmentBySlug,
} from "@/app/_lib/directory-taxonomy";
import { getLaunchAreaPaths, getLaunchKeywordPaths, getLaunchSegmentPaths } from "@/app/_lib/launch-urls";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd, buildLocalBusinessJsonLd } from "@/app/_lib/structured-data";
import { TherapistComparison, type ComparisonTherapistProfile } from "@/components";

type Params = { city: string };

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DFW_SUBURB_SLUGS = new Set([
  "plano", "irving", "richardson", "fort-worth", "frisco",
  "addison", "carrollton", "arlington", "grand-prairie",
]);

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

  const inventoryCount = await getCityInventoryCount(city.name);
  const cityLabel = `${city.name}, ${city.stateCode}`;

  const title = inventoryCount > 0
    ? `${inventoryCount}+ Verified Male Massage Therapists in ${cityLabel}`
    : `Verified Male Massage Therapists in ${cityLabel}`;

  const description = `Find trusted, verified male massage therapists in ${cityLabel}. LGBTQ+-friendly directory with identity-verified professionals, real reviews, and direct contact. Compare rates, specialties & availability.`;

  return createPageMetadata({
    title,
    description,
    path: `/${city.slug}`,
    keywords: [
      `${city.name} male massage`,
      `gay massage ${city.name}`,
      `${city.name} LGBTQ massage therapist`,
      `${city.name} verified massage therapist`,
      `male massage near me ${city.name}`,
      `${city.name} deep tissue massage`,
      `${city.name} sports massage`,
      `mobile massage ${city.name}`,
    ],
    noIndex: inventoryCount === 0,
  });
}

export default async function CityDirectoryPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const city = getCities().find((entry) => entry.slug === resolvedParams.city);

  if (!city) {
    notFound();
  }

  const canonicalCityPath = `/${city.slug}`;
  const citySegmentLinks = getLaunchSegmentPaths()
    .filter((path) => path.startsWith(`${canonicalCityPath}/`))
    .map((path) => {
      const [, segmentSlug] = path.split("/").filter(Boolean);
      const segment = getSegmentBySlug(segmentSlug || "");

      return {
        href: path,
        label: segment?.shortLabel || formatSlugLabel(segmentSlug || "segment"),
        description:
          segment?.intro ||
          `High-intent ${formatSlugLabel(segmentSlug || "segment").toLowerCase()} route for ${city.name}.`,
      };
    });
  const cityKeywordLinks = getLaunchKeywordPaths()
    .filter((path) => path.startsWith(`${canonicalCityPath}/`))
    .map((path) => {
      const [, , keywordSlug] = path.split("/").filter(Boolean);
      const keyword = getKeywordBySlug(keywordSlug || "");

      return {
        href: path,
        label: keyword?.shortLabel || formatSlugLabel(keywordSlug || "service"),
      };
    });
  const cityAreaLinks = getLaunchAreaPaths()
    .filter((path) => path.startsWith(`${canonicalCityPath}/`))
    .map((path) => {
      const [, , areaSlug] = path.split("/").filter(Boolean);

      return {
        href: path,
        label: formatSlugLabel(areaSlug || "area"),
      };
    });

  const therapists = await getPublicTherapists({ city: city.name, page: 1, pageSize: 9 });

  const cityIntro = DFW_SUBURB_SLUGS.has(city.slug)
    ? buildSuburbIntro(buildAreaCopyInput({ area: city.name, city: "DFW", therapists: therapists.items }))
    : `Search-first city page for trusted male massage discovery in ${city.name}. Compare verified profiles, outcall and incall options, specialties, and direct contact in one cleaner flow.`;

  const comparisonProfiles: ComparisonTherapistProfile[] = therapists.items.slice(0, 3).map((item, idx) => ({
    id: item.id,
    name: item.display_name || item.full_name || `Therapist ${idx + 1}`,
    image: item.avatar_url || "",
    rating: 4.8,
    reviews: item.review_count || 0,
    specialties: item.specialties || [],
    priceRange: {
      min: item.incall_price || 80,
      max: item.outcall_price || item.incall_price || 140,
    },
    availability: {
      available: true,
      nextAvailable: "Today",
    },
    incall: Boolean(item.incall_price),
    outcall: Boolean(item.outcall_price),
    experience: 4 + idx,
    responseTime: "Within 2 hours",
    features: {
      incall: Boolean(item.incall_price),
      outcall: Boolean(item.outcall_price),
      verified: item._tier === "standard" || item._tier === "pro" || item._tier === "elite",
      profile: true,
    },
  }));

  const cityFaqs = [
    {
      question: `How do I find a trusted male massage therapist in ${city.name}?`,
      answer: `Start with verified profiles, then compare specialties, incall or outcall options, photo quality, and direct contact methods before you reach out.`,
    },
    {
      question: `Can I find outcall massage options in ${city.name}?`,
      answer: `Yes. Use outcall pages and listing badges to quickly identify therapists who travel to a home, hotel, or requested location.`,
    },
    {
      question: `Does MasseurMatch handle booking in ${city.name}?`,
      answer: `No. MasseurMatch is a trusted discovery directory. You contact therapists directly by phone, WhatsApp, or SMS to confirm fit, timing, and availability.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={buildLocalBusinessJsonLd({
          cityName: city.name,
          stateName: city.stateName,
          path: canonicalCityPath,
          therapistCount: therapists.items.length,
        })}
      />
      <CityDirectoryPageShell
        eyebrow="City directory"
        title={`Verified male massage therapists in ${city.name}`}
        intro={cityIntro}
        breadcrumbJsonLd={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: city.name, path: canonicalCityPath },
        ])}
        collectionJsonLd={buildCollectionPageJsonLd({
          name: `Verified male massage therapists in ${city.name}`,
          description: cityIntro,
          path: canonicalCityPath,
        })}
        itemListJsonLd={buildItemListJsonLd({
          name: `${city.name} verified therapist listings`,
          path: canonicalCityPath,
          items: therapists.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
        leadLinks={[
          { href: `/search?city=${city.slug}&verified=1`, label: `Browse verified in ${city.name}` },
          { href: "/search", label: "Search all cities" },
          { href: "/safety", label: "Read safety policy" },
          { href: "/compare", label: "Compare top directory alternatives" },
        ]}
        linkSections={[
          ...(citySegmentLinks.length
            ? [{
                title: `High-intent pages in ${city.name}`,
                layout: "grid" as const,
                description:
                  "These city-plus-intent pages are designed to feel stronger than a generic directory landing page and to capture more local search demand.",
                items: citySegmentLinks,
              }]
            : []),
          ...(cityKeywordLinks.length
            ? [{
                title: `Popular service intents in ${city.name}`,
                layout: "chips" as const,
                description:
                  "Jump into the service combinations people search most often when they already know the type of session they want.",
                items: cityKeywordLinks,
              }]
            : []),
          ...(cityAreaLinks.length
            ? [{
                title: `Neighborhood pages in ${city.name}`,
                layout: "chips" as const,
                description:
                  "These neighborhood landers cluster local intent around the areas already covered by live therapist inventory.",
                items: cityAreaLinks,
              }]
            : []),
          {
            title: "Compare major directory alternatives",
            layout: "chips",
            items: [
              {
                href: "/compare",
                label: "All comparisons",
              },
              {
                href: "/compare/masseurmatch-vs-masseurfinder",
                label: "vs MasseurFinder",
              },
              {
                href: "/compare/masseurmatch-vs-rentmasseur",
                label: "vs RentMasseur",
              },
            ],
          },
        ]}
        therapists={therapists.items}
        listingTitle={`Trusted listings in ${city.name}`}
        listingDescription="Each card combines visual quality, verification status, and direct-contact clarity so this city page performs as both a better user journey and a stronger local SEO landing page."
        emptyTitle={`No public listings are live in ${city.name} yet.`}
        emptyDescription="You can still explore verified intent pages, broader city routes, and comparison content while this market grows."
        faqTitle={`Common Questions About Male Massage in ${city.name}`}
        faqItems={cityFaqs}
      />

      {comparisonProfiles.length > 1 ? (
        <section className="page-shell pb-14">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Compare top profiles in {city.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Use side-by-side comparison to quickly decide who matches your preferences.</p>
            <div className="mt-6">
              <TherapistComparison
                profiles={comparisonProfiles}
                features={[
                  { key: "incall", label: "Incall" },
                  { key: "outcall", label: "Outcall" },
                  { key: "verified", label: "Verified tier" },
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
