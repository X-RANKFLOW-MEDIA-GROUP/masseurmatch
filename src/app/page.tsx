import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/json-ld";
import { Hero } from "@/components/marketing/Hero";
import { CityMarquee } from "@/components/marketing/CityMarquee";
import { StatsBand } from "@/components/marketing/StatsBand";
import { CityCaseStudies } from "@/components/marketing/CityCaseStudies";
import { FeaturedTherapistsEditorial } from "@/components/marketing/FeaturedTherapistsEditorial";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { USStateMapGrid } from "@/components/marketing/USStateMapGrid";
import { FinalCta } from "@/components/marketing/FinalCta";
import { HowItWorksTease } from "@/components/marketing/HowItWorksTease";
import { WhyMasseurMatch } from "@/components/marketing/WhyMasseurMatch";
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

// ─── FAQ content (also used for JSON-LD) ────────────────────────────────────

const HOME_FAQ = [
  {
    question: "What is MasseurMatch?",
    answer:
      "MasseurMatch is a premium US discovery directory for verified LGBTQ+-affirming male massage therapists. Search by city, filter by specialty (deep tissue, Swedish, sports), choose incall or outcall, and contact therapists directly without any booking middleman.",
  },
  {
    question: "How do I find verified male massage therapists near me?",
    answer:
      "Select your city on MasseurMatch, browse profiles with trust signals, compare specialties and session types (incall or outcall), check availability and pricing, then contact your therapist directly to confirm details.",
  },
  {
    question: "Which cities does MasseurMatch cover?",
    answer:
      "MasseurMatch covers cities across the US including Dallas, Miami, New York, Los Angeles, Chicago, Houston, Atlanta, Washington DC, San Francisco, Seattle, Denver, Boston, Phoenix, Las Vegas, New Orleans, and many more.",
  },
  {
    question: "What makes MasseurMatch different?",
    answer:
      "MasseurMatch is built for serious wellness seekers. Premium verified profiles, identity checks, transparent pricing, LGBTQ+-affirming therapists, and a professional brand that respects both clients and providers. No booking middleman — just direct contact, clear terms, and trust signals.",
  },
  {
    question: "How do I know if a therapist is verified on MasseurMatch?",
    answer:
      "Verified therapists display trust signals on their profiles: identity verification badges, availability status, years of experience, and professional credentials. Elite tier therapists have enhanced verification and premium features.",
  },
  {
    question: "Can I find outcall and incall massage options on MasseurMatch?",
    answer:
      "Yes. Each MasseurMatch profile clearly shows whether a therapist offers incall (at their location), outcall (to your home or hotel), or both — with pricing anchors where available.",
  },
  {
    question: "Is MasseurMatch LGBTQ+ friendly?",
    answer:
      "Absolutely. MasseurMatch is designed as an inclusive LGBTQ+-affirming directory where clients can safely discover therapists who are welcoming, professional, and experienced with diverse clientele.",
  },
  {
    question: "Does MasseurMatch handle booking or payment?",
    answer:
      "No. MasseurMatch is a discovery directory — not a booking platform. Clients review profiles and contact therapists directly to confirm session details, rates, availability, and boundaries outside the platform.",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

function isRealProfileId(id: string | null | undefined) {
  return Boolean(id && !id.toLowerCase().startsWith("fallback-"));
}

export default async function HomePage() {
  // Coming-soon mode — redirect to waitlist until launch (remove after July 7, 2026)
  redirect("/waitlist");

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
      <JsonLd
        data={{
          ...buildWebsiteJsonLd(),
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: siteUrl("/search?q={search_term_string}&city={city_name}"),
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />

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

      {/* FAQPage */}
      <JsonLd data={buildFaqJsonLd(HOME_FAQ)} />

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
        {/* ── FIRST FOLD — live profiles + AI assistant ─────────────────── */}
        <div className="home-dark relative">
          {/* 1. Editorial hero */}
          <Hero therapists={featuredTherapists} />

          {/* 2. Slim popular-cities marquee */}
          <CityMarquee />
        </div>

        {/* ── LIGHT BODY ─────────────────────────────────────────────── */}
        <StatsBand />
        <CityCaseStudies />
        <HowItWorksTease />
        <FeaturedTherapistsEditorial featuredTherapists={featuredTherapists} />
        <WhyMasseurMatch />
        <USStateMapGrid />
        <FaqAccordion items={LANDING_FAQ} />
        <FinalCta />
      </div>
    </>
  );
}
