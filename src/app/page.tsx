import { JsonLd } from "@/app/_components/json-ld";
import { HeroCinematic } from "@/components/marketing/HeroCinematic";
import { AIDiscoverySection } from "@/components/marketing/AIDiscoverySection";
import { CityDiscoveryShowcase } from "@/components/marketing/CityDiscoveryShowcase";
import { HowItWorksPremium } from "@/components/marketing/HowItWorksPremium";
import { FeaturedTherapistsEditorial } from "@/components/marketing/FeaturedTherapistsEditorial";
import { TrustDashboardSection } from "@/components/marketing/TrustDashboardSection";
import { ProviderGrowthCTA } from "@/components/marketing/ProviderGrowthCTA";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { FinalCta } from "@/components/marketing/FinalCta";
import {
  createPageMetadata,
  buildFaqJsonLd,
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  buildCollectionPageJsonLd,
  SITE_DESCRIPTION,
} from "@/app/_lib/seo";
import { siteUrl } from "@/lib/site";
import {
  getProfilePhotosBatch,
  getPublicTherapistBySlug,
  getPublicTherapists,
} from "@/app/_lib/directory";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { LANDING_FAQ } from "@/lib/marketing/home-data";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
  title: "Find Verified Male Massage Therapists Near You | MasseurMatch",
  description:
    "MasseurMatch is the premium US directory for verified LGBTQ+-affirming male massage therapists. Search Dallas, Miami, NYC, LA, Chicago & cities across the US. Compare deep tissue, Swedish, outcall & incall options. A modern alternative to MasseurFinder and RentMasseur.",
  path: "/",
  keywords: [
    "MasseurMatch",
    "male massage therapist directory",
    "verified male massage therapist",
    "male massage therapist near me",
    "massage therapist near me",
    "LGBTQ affirming massage",
    "gay friendly massage therapist",
    "deep tissue massage",
    "Swedish massage",
    "outcall massage service",
    "incall massage",
    "massage therapist Dallas",
    "massage therapist Miami",
    "massage therapist New York",
    "massage therapist Los Angeles",
  ],
});

function isRealProfileId(id: string | null | undefined) {
  return Boolean(id && !id.toLowerCase().startsWith("fallback-"));
}

async function getHomepageFeaturedProfiles() {
  const admin = createSupabaseAdminClient();
  const now = Date.now();
  const { data, error } = await (admin as any)
    .from("featured_masters")
    .select("profile_id, display_order, starts_at, ends_at")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(24);

  if (error || !data) return [];

  const activeIds = data
    .filter((entry: { profile_id: string | null; starts_at: string | null; ends_at: string | null }) => {
      if (!entry.profile_id) return false;
      const startsAt = entry.starts_at ? new Date(entry.starts_at).getTime() : null;
      const endsAt = entry.ends_at ? new Date(entry.ends_at).getTime() : null;
      return (startsAt == null || startsAt <= now) && (endsAt == null || endsAt > now);
    })
    .map((entry: { profile_id: string }) => entry.profile_id);

  const profiles = await Promise.all(activeIds.map((id: string) => getPublicTherapistBySlug(id)));
  return profiles.filter((profile): profile is NonNullable<typeof profile> => profile !== null).slice(0, 6);
}

export default async function HomePage() {
  let featuredTherapists: Awaited<ReturnType<typeof getPublicTherapists>>["items"] = [];
  try {
    // Featured Masters are the source of truth for the homepage. Public directory
    // results only fill empty slots, so an admin feature action guarantees priority
    // while still enforcing the normal approved/public/safety eligibility rules.
    const [managedFeatured, lgbtqResult, broadResult] = await Promise.all([
      getHomepageFeaturedProfiles(),
      getPublicTherapists({ page: 1, pageSize: 12, lgbtqAffirming: true }),
      getPublicTherapists({ page: 1, pageSize: 12 }),
    ]);

    const seenIds = new Set<string>();
    featuredTherapists = [...managedFeatured, ...lgbtqResult.items, ...broadResult.items]
      .filter((therapist) => {
        if (seenIds.has(therapist.id)) return false;
        seenIds.add(therapist.id);
        return true;
      })
      .slice(0, 6);

    const realIds = featuredTherapists.filter((t) => isRealProfileId(t.id)).map((t) => t.id);
    if (realIds.length > 0) {
      const photoBatch = await getProfilePhotosBatch(realIds, 1);
      featuredTherapists = featuredTherapists.map((therapist) => {
        if (!isRealProfileId(therapist.id)) return therapist;
        const photos = photoBatch.get(therapist.id) ?? [];
        const primaryPhoto = photos.find((photo) => photo.is_primary) ?? photos[0];
        return primaryPhoto ? { ...therapist, profile_photo: primaryPhoto.storage_path } : therapist;
      });
    }
  } catch {
    // Never take the homepage down if the featured-management table is unavailable.
    try {
      const fallback = await getPublicTherapists({ page: 1, pageSize: 6 });
      featuredTherapists = fallback.items;
    } catch {
      featuredTherapists = [];
    }
  }

  const topCityItems = [
    { name: "Massage Therapists in New York, NY", path: "/new-york" },
    { name: "Massage Therapists in Los Angeles, CA", path: "/los-angeles" },
    { name: "Massage Therapists in Miami, FL", path: "/miami" },
    { name: "Massage Therapists in Chicago, IL", path: "/chicago" },
    { name: "Massage Therapists in Dallas, TX", path: "/dallas" },
    { name: "Massage Therapists in Houston, TX", path: "/houston" },
    { name: "Massage Therapists in Atlanta, GA", path: "/atlanta" },
    { name: "Massage Therapists in Washington, DC", path: "/washington-dc" },
  ];

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildWebsiteJsonLd()} />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch — Verified Male Massage Therapist Directory",
          description: SITE_DESCRIPTION,
          path: "/",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Top Cities — Male Massage Therapist Directory",
          path: "/",
          items: topCityItems,
        })}
      />
      <JsonLd data={buildFaqJsonLd(LANDING_FAQ)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "MasseurMatch — Verified Male Massage Therapist Directory",
          description: SITE_DESCRIPTION,
          url: siteUrl("/"),
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".speakable-intro"],
          },
        }}
      />

      <div className="relative min-h-screen overflow-x-hidden bg-background">
        <HeroCinematic />
        <FeaturedTherapistsEditorial featuredTherapists={featuredTherapists} />
        <AIDiscoverySection />
        <CityDiscoveryShowcase />
        <HowItWorksPremium />
        <TrustDashboardSection />
        <ProviderGrowthCTA />
        <FaqAccordion items={LANDING_FAQ} />
        <FinalCta />
      </div>
    </>
  );
}
