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
import {
  createPageMetadata,
  buildFaqJsonLd,
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  buildCollectionPageJsonLd,
  SITE_NAME,
  SITE_DESCRIPTION,
} from "@/app/_lib/seo";
import { siteUrl } from "@/lib/site";
import { getProfilePhotos, getPublicTherapists } from "@/app/_lib/directory";
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
      "MasseurMatch covers 80+ US cities including Dallas, Miami, New York, Los Angeles, Chicago, Houston, Atlanta, Washington DC, San Francisco, Seattle, Denver, Boston, Phoenix, Las Vegas, New Orleans, and many more.",
  },
  {
    question: "Is MasseurMatch a good alternative to MasseurFinder?",
    answer:
      "Yes. MasseurMatch is a modern alternative to MasseurFinder, built around city-first local SEO, cleaner premium profiles, stronger trust signals, and a professional wellness-forward brand — without the legacy directory feel.",
  },
  {
    question: "How does MasseurMatch compare to RentMasseur?",
    answer:
      "MasseurMatch offers a cleaner professional experience than RentMasseur. The focus is on wellness-forward discovery: verified profiles, transparent pricing, and direct contact without the mixed-intent marketplace environment.",
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
  // Fetch featured therapists — graceful fallback if DB unavailable.
  // The hero itself filters out fallback/demo/test profiles so the first fold only
  // renders approved live profiles from Supabase.
  let featuredTherapists: Awaited<ReturnType<typeof getPublicTherapists>>["items"] = [];
  try {
    const result = await getPublicTherapists({ page: 1, pageSize: 6, lgbtqAffirming: true });
    featuredTherapists = result.items;
    if (featuredTherapists.length === 0) {
      const fallback = await getPublicTherapists({ page: 1, pageSize: 6 });
      featuredTherapists = fallback.items;
    }

    featuredTherapists = await Promise.all(
      featuredTherapists.map(async (therapist) => {
        if (!isRealProfileId(therapist.id)) return therapist;
        const photos = await getProfilePhotos(therapist.id, 1);
        const primaryPhoto = photos.find((photo) => photo.is_primary) ?? photos[0];
        return {
          ...therapist,
          profile_photo: primaryPhoto?.storage_path ?? therapist.profile_photo,
        };
      }),
    );
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
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl("/"),
              },
            ],
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
        <FeaturedTherapistsEditorial featuredTherapists={featuredTherapists} />
        <USStateMapGrid />
        <FaqAccordion items={LANDING_FAQ} />
        <FinalCta />
      </div>
    </>
  );
}
