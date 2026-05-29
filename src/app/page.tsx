import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/json-ld";
import { Hero } from "@/components/marketing/Hero";
import { ValuesMarquee } from "@/components/marketing/ValuesMarquee";
import { StatsBand } from "@/components/marketing/StatsBand";
import { HomeSeoLanding } from "@/app/_components/home-seo-landing";
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
import { getPublicTherapists, getCities } from "@/app/_lib/directory";
import { competitorsByTier } from "@/lib/competitors";
import { GUIDES } from "@/app/guides/data";
import {
  PRIORITY_CITY_SLUGS,
  CITY_HIGHLIGHTS,
  CITY_ROUTE_COUNTS,
} from "@/lib/marketing/home-data";

export const revalidate = 3600;

// ─── Metadata ───────────────────────────────────────────────────────────────

export const metadata: Metadata = createPageMetadata({
  title: "Find Verified Male Massage Therapists Near You | MasseurMatch",
  description:
    "MasseurMatch is the premium US directory for verified LGBTQ+-affirming male massage therapists. Search Dallas, Miami, NYC, LA, Chicago & 80+ cities. Compare deep tissue, Swedish, outcall & incall options. A modern alternative to MasseurFinder and RentMasseur.",
  path: "/",
  keywords: [
    // Brand
    "MasseurMatch",
    "masseurmatch.com",
    "MasseurMatch directory",
    // Primary search intent
    "male massage therapist directory",
    "verified male massage therapist",
    "male massage therapist near me",
    "massage therapist near me",
    "massage therapist directory USA",
    "male massage near me",
    "male to male massage near me",
    "massage for men",
    "male massage therapist",
    // LGBTQ
    "LGBTQ massage therapist",
    "LGBTQ affirming massage",
    "gay massage directory",
    "gay massage therapist near me",
    "gay friendly massage therapist",
    // Competitor capture — people searching these are potential users
    "MasseurFinder",
    "MasseurFinder alternative",
    "masseurfinder.com",
    "masseurfinder alternative",
    "RentMasseur",
    "RentMasseur alternative",
    "rentmasseur.com",
    "better than RentMasseur",
    "alternative to RentMasseur",
    "MasseurFinder vs MasseurMatch",
    "RentMasseur vs MasseurMatch",
    "MassageFinder",
    "MassageFinder alternative",
    "FindAMasseur",
    "FindAMasseur alternative",
    "MassageM4M",
    "MassageM4M alternative",
    "SexyMasseur",
    "SexyMasseur alternative",
    "ProMasseurs",
    "ProMasseurs alternative",
    "GayWellness",
    "FriendlyMasseurs",
    "niche massage directory",
    "best massage therapist directory",
    // Services
    "deep tissue massage therapist",
    "Swedish massage therapist",
    "outcall massage therapist",
    "incall massage therapist",
    "sports massage therapist",
    "mobile massage therapist",
    "hotel massage service",
    "therapeutic massage near me",
    // Cities (top markets)
    "massage therapist Dallas",
    "massage therapist Miami",
    "massage therapist New York",
    "massage therapist Los Angeles",
    "massage therapist Chicago",
    "massage therapist Houston",
    "massage therapist Atlanta",
    "massage therapist Washington DC",
    "massage therapist San Francisco",
    "massage therapist Seattle",
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

// ─── Static homepage data ────────────────────────────────────────────────────

const HOME_INTENT_CARDS = [
  {
    href: "/dallas/wellness/deep-tissue",
    title: "Deep Tissue Massage in Dallas",
    description:
      "Find licensed therapists specializing in deep tissue work across Dallas neighborhoods including Oak Lawn, Uptown, and Medical District.",
    cityLabel: "Dallas, TX",
  },
  {
    href: "/dallas/wellness/outcall",
    title: "Outcall Massage in Dallas",
    description:
      "Browse therapists offering mobile and hotel outcall sessions across Dallas and the DFW metro area.",
    cityLabel: "Dallas, TX",
  },
  {
    href: "/miami/wellness/outcall",
    title: "Outcall Massage in Miami",
    description:
      "Discover verified outcall therapists in Miami Beach, South Beach, Brickell, and surrounding neighborhoods.",
    cityLabel: "Miami, FL",
  },
  {
    href: "/los-angeles/wellness/deep-tissue",
    title: "Deep Tissue Massage in Los Angeles",
    description:
      "Compare deep tissue specialists across West Hollywood, Santa Monica, Silver Lake, and greater LA.",
    cityLabel: "Los Angeles, CA",
  },
  {
    href: "/chicago/wellness/incall",
    title: "Incall Massage in Chicago",
    description:
      "Find incall massage sessions in Chicago's Near North Side, Boystown, River North, and South Loop.",
    cityLabel: "Chicago, IL",
  },
  {
    href: "/new-york/wellness/outcall",
    title: "Outcall Massage in New York",
    description:
      "Browse mobile and hotel outcall therapists serving Manhattan, Brooklyn, and the NYC metro area.",
    cityLabel: "New York, NY",
  },
];

const CITY_COVERAGE_LINE =
  "Covering 80+ US cities — Dallas, Miami, New York, Los Angeles, Chicago, Houston, Atlanta, Washington DC, San Francisco, Seattle, Denver, Boston, Phoenix, Las Vegas, and more.";

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch featured therapists — graceful fallback if DB unavailable
  let featuredTherapists: Awaited<ReturnType<typeof getPublicTherapists>>["items"] = [];
  try {
    const result = await getPublicTherapists({ page: 1, pageSize: 6, lgbtqAffirming: true });
    featuredTherapists = result.items;
    if (featuredTherapists.length === 0) {
      const fallback = await getPublicTherapists({ page: 1, pageSize: 6 });
      featuredTherapists = fallback.items;
    }
  } catch {
    featuredTherapists = [];
  }

  // Build city cards from static priority list
  const allCities = getCities();
  const launchCities = PRIORITY_CITY_SLUGS.flatMap((slug) => {
    const city = allCities.find((c) => c.slug === slug);
    if (!city) return [];
    return [
      {
        href: `/${slug}`,
        city,
        listingCount: 0,
        routeCount: CITY_ROUTE_COUNTS[slug] ?? 12,
        highlights: CITY_HIGHLIGHTS[slug] ?? ["Verified Profiles", "Incall & Outcall"],
      },
    ];
  });

  // Top comparison competitors for the homepage hub
  const comparisonLinks = competitorsByTier.slice(0, 6);

  // Top guides
  const guides = GUIDES.slice(0, 4);

  // JSON-LD: top city list for ItemList schema
  const topCityItems = launchCities.map((entry) => ({
    name: `Massage Therapists in ${entry.city.name}, ${entry.city.stateCode}`,
    path: entry.href,
  }));

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

      {/* Competitor comparison ItemList — helps Google understand alternatives context */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "MasseurMatch Comparison Pages — Alternatives to MasseurFinder, RentMasseur & More",
          description:
            "Compare MasseurMatch against leading massage directories including MasseurFinder, RentMasseur, MassageFinder, FindAMasseur, and others.",
          url: siteUrl("/compare"),
          numberOfItems: comparisonLinks.length,
          itemListElement: comparisonLinks.map((competitor, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `MasseurMatch vs ${competitor.name}`,
            url: siteUrl(`/compare/${competitor.slug}`),
            description: competitor.hubDescription,
          })),
        }}
      />

      {/* FAQPage — includes competitor comparison questions for rich snippet eligibility */}
      <JsonLd data={buildFaqJsonLd(HOME_FAQ)} />

      {/* SpeakableSpecification — helps voice search */}
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

      {/* Editorial Hero Section */}
      <Hero />

      {/* Brand values ticker + animated stats band */}
      <ValuesMarquee />
      <StatsBand />

      <HomeSeoLanding
        launchCities={launchCities}
        intentCards={HOME_INTENT_CARDS}
        featuredTherapists={featuredTherapists}
        comparisonLinks={comparisonLinks}
        guides={guides}
        cityCoverageLine={CITY_COVERAGE_LINE}
      />
    </>
  );
}
