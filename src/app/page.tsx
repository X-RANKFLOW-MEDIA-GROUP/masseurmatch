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
import { getProfilePhotosBatch, getPublicTherapists } from "@/app/_lib/directory";
import { LANDING_FAQ } from "@/lib/marketing/home-data";
import type { Metadata } from "next";

export const revalidate = 3600;

// ─── Metadata ───────────────────────────────────────────────────────────────

export const metadata: Metadata = createPageMetadata({
  title: "Find Verified Male Massage Therapists Near You | MasseurMatch",
  description:
    "MasseurMatch is the premium US directory for verified LGBTQ+-affirming male massage therapists. Search Dallas, Miami, NYC, LA, Chicago & cities across the US. Compare deep tissue, Swedish, outcall & incall options. A modern alternative to MasseurFinder and RentMasseur.",
  path: "/",
  keywords: [
    // Brand
    "MasseurMatch",
    "male massage therapist directory",
    // Primary search intent
    "verified male massage therapist",
    "male massage therapist near me",
    "massage therapist near me",
    "LGBTQ affirming massage",
    "gay friendly massage therapist",
    // Services
    "deep tissue massage",
    "Swedish massage",
    "outcall massage service",
    "incall massage",
    // Cities (top markets)
    "massage therapist Dallas",
    "massage therapist Miami",
    "massage therapist New York",
    "massage therapist Los Angeles",
  ],
});

// ─── Page ────────────────────────────────────────────────────────────────────

function isRealProfileId(id: string | null | undefined) {
  return Boolean(id && !id.toLowerCase().startsWith("fallback-"));
}

export default async function HomePage() {
  let featuredTherapists: Awaited<ReturnType<typeof getPublicTherapists>>["items"] = [];
  try {
    // Run both queries in parallel — lgbtq-affirming preferred, broad as fallback
    const [lgbtqResult, broadResult] = await Promise.all([
      getPublicTherapists({ page: 1, pageSize: 6, lgbtqAffirming: true }),
      getPublicTherapists({ page: 1, pageSize: 6 }),
    ]);
    featuredTherapists = lgbtqResult.items.length > 0 ? lgbtqResult.items : broadResult.items;

    const realIds = featuredTherapists
      .filter((t) => isRealProfileId(t.id))
      .map((t) => t.id);

    if (realIds.length > 0) {
      const photoBatch = await getProfilePhotosBatch(realIds, 1);
      featuredTherapists = featuredTherapists.map((therapist) => {
        if (!isRealProfileId(therapist.id)) return therapist;
        const photos = photoBatch.get(therapist.id) ?? [];
        const primaryPhoto = photos.find((photo) => photo.is_primary) ?? photos[0];
        return primaryPhoto
          ? { ...therapist, profile_photo: primaryPhoto.storage_path }
          : therapist;
      });
    }
  } catch {
    featuredTherapists = [];
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
      {/* Organization */}
      <JsonLd data={buildOrganizationJsonLd()} />

      {/* WebSite + SearchAction */}
      <JsonLd data={buildWebsiteJsonLd()} />

      {/* CollectionPage */}
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch — Verified Male Massage Therapist Directory",
          description: SITE_DESCRIPTION,
          path: "/",
        })}
      />

      {/* Top Cities ItemList */}
      <JsonLd
        data={buildItemListJsonLd({
          name: "Top Cities — Male Massage Therapist Directory",
          path: "/",
          items: topCityItems,
        })}
      />

      {/* FAQPage — must mirror the FAQ content visibly rendered by FaqAccordion */}
      <JsonLd data={buildFaqJsonLd(LANDING_FAQ)} />

      {/* Standalone BreadcrumbList */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: siteUrl("/"),
            },
          ],
        }}
      />

      {/* SpeakableSpecification */}
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
        {/* 1. Hero Cinematic — Large hero section with cinematic visual */}
        <HeroCinematic />

        {/* 2. Featured Verified Profiles — Premium editorial cards (moved after hero) */}
        <FeaturedTherapistsEditorial featuredTherapists={featuredTherapists} />

        {/* 3. AI-Powered Discovery Section */}
        <AIDiscoverySection />

        {/* 4. Browse by Major Cities */}
        <CityDiscoveryShowcase />

        {/* 5. How It Works — 3-step premium layout */}
        <HowItWorksPremium />

        {/* 6. Trust / Verification Dashboard */}
        <TrustDashboardSection />

        {/* 7. Provider Growth CTA */}
        <ProviderGrowthCTA />

        {/* 8. FAQ Section */}
        <FaqAccordion items={LANDING_FAQ} />

        {/* 9. Final CTA */}
        <FinalCta />
      </div>
    </>
  );
}
