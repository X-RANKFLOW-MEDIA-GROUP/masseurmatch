import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityDirectoryPage as CityDirectoryPageShell } from "@/app/_components/city-directory-page";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { DIRECTORY_SEGMENTS, SPECIALTY_KEYWORDS } from "@/app/_lib/directory-taxonomy";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";
import { AdvancedHeroSection, TherapistComparison, type ComparisonTherapistProfile } from "@/components";

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

  const cityIntro = `Explore verified massage therapists in ${city.name}, with public profiles, specialties, and transparent service details.`;

  return createPageMetadata({
    title: `${city.name} massage therapists`,
    description: cityIntro,
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

  const cityIntro = `Browse public therapist listings in ${city.name}. Compare specialties, availability, and profile details in one place.`;

  const therapists = await getPublicTherapists({ city: city.name, page: 1, pageSize: 9 });
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

  return (
    <>
      <section className="page-shell py-6 lg:py-7">
        <AdvancedHeroSection
          title={`${city.name} massage therapists`}
          subtitle="City Directory"
          description={cityIntro}
          cta={{ text: "Search all cities", href: "/search" }}
          parallax={true}
          animated={true}
        />
      </section>

      <CityDirectoryPageShell
        eyebrow="City directory"
        title={`${city.name} massage therapists`}
        intro={cityIntro}
        breadcrumbJsonLd={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: city.name, path: `/${city.slug}` },
        ])}
        collectionJsonLd={buildCollectionPageJsonLd({
          name: `${city.name} massage therapists`,
          description: cityIntro,
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
