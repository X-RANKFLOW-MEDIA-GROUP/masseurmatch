import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/json-ld";
import { CinematicHomepage } from "@/components/homepage/CinematicHomepage";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { getLaunchAreaPaths, getLaunchCityPaths, getLaunchKeywordPaths, getLaunchSegmentPaths } from "@/app/_lib/launch-urls";
import {
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { siteUrl } from "@/lib/site";
import MasseurProfile from "@/app/_components/MasseurProfileClient";

export const revalidate = 1800;

const homeMetadata = createPageMetadata({
  title: "Gay massage therapists & male massage near me — verified LGBTQ+ directory",
  description:
    "Find verified gay massage therapists and male massage near you. LGBTQ+-affirming directory covering Dallas, Miami, Chicago, Houston, Austin and 100+ US cities. Compare outcall, incall, deep tissue, Swedish, and direct-contact profiles.",
  path: "/",
  keywords: [
    "gay massage near me",
    "gay massage therapist",
    "male massage near me",
    "male massage therapist",
    "lgbt massage",
    "lgbtq massage directory",
    "verified male massage directory",
    "dallas male massage",
    "outcall male massage",
    "deep tissue male massage",
    "swedish massage men",
    "trusted premium massage directory",
    "male massage by city",
    "gay affirming massage",
  ],
});

export const metadata: Metadata = {
  ...homeMetadata,
  alternates: {
    canonical: siteUrl("/"),
    languages: {
      en: siteUrl("/"),
      "pt-BR": siteUrl("/pt-br"),
    },
  },
};

export default async function HomePage() {
  const cities = getCities();
  const therapistsResult = await getPublicTherapists({ pageSize: 60 });
  const therapists = therapistsResult.items;

  const featuredTherapists = therapists
    .filter(
      (therapist) =>
        therapist._tier === "elite" ||
        therapist._tier === "pro" ||
        Boolean(therapist.is_verified_identity || therapist.is_verified_profile),
    )
    .slice(0, 6);

  const cityCounts = new Map<string, number>();
  const cityHighlights = new Map<string, Set<string>>();

  therapists.forEach((therapist) => {
    const cityKey = therapist.city?.toLowerCase().trim();

    if (!cityKey) {
      return;
    }

    cityCounts.set(cityKey, (cityCounts.get(cityKey) || 0) + 1);

    const highlights = cityHighlights.get(cityKey) || new Set<string>();
    (therapist.specialties || []).slice(0, 3).forEach((specialty) => highlights.add(specialty));

    if (therapist.available_now) {
      highlights.add("Available now");
    }

    if (therapist.outcall_price) {
      highlights.add("Outcall");
    }

    if (therapist.incall_price) {
      highlights.add("Incall");
    }

    cityHighlights.set(cityKey, highlights);
  });

  const launchSegmentPaths = getLaunchSegmentPaths();
  const launchKeywordPaths = getLaunchKeywordPaths();
  const launchAreaPaths = getLaunchAreaPaths();

  const launchCities = getLaunchCityPaths()
    .map((path) => {
      const citySlug = path.split("/").filter(Boolean)[0] || "";
      const city = cities.find((entry) => entry.slug === citySlug);

      if (!city) {
        return null;
      }

      const cityKey = city.name.toLowerCase();
      const highlightValues = Array.from(cityHighlights.get(cityKey) || []);
      const routeCount = [
        path,
        ...launchSegmentPaths.filter((entry) => entry.startsWith(`${path}/`)),
        ...launchKeywordPaths.filter((entry) => entry.startsWith(`${path}/`)),
        ...launchAreaPaths.filter((entry) => entry.startsWith(`${path}/`)),
      ].length;

      return {
        href: path,
        city,
        listingCount: cityCounts.get(cityKey) || 0,
        routeCount,
        highlights: (highlightValues.length > 0
          ? highlightValues
          : ["Verified", "City page", "Direct contact"]).slice(0, 3),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const homeFaqs = [
    {
      question: "How do I find verified male massage therapists near me?",
      answer:
        "Start with a city page, then compare specialties, incall or outcall options, visible pricing, reviews, and profile quality before contacting a therapist directly.",
    },
    {
      question: "Which cities have live MasseurMatch landing pages?",
      answer:
        "Current launch pages include Dallas, Plano, Irving, Highland Park, Houston, Austin, Miami, and Chicago, with local service and neighborhood clusters expanding alongside therapist coverage.",
    },
    {
      question: "Can I compare deep tissue, Swedish, hotel, and outcall options?",
      answer:
        "Yes. The directory includes city-plus-service routes for deep tissue, Swedish, sports recovery, hotel massage, mobile massage, incall, and outcall discovery.",
    },
    {
      question: "Does MasseurMatch handle booking or payments?",
      answer:
        "No. MasseurMatch is a discovery directory. Users review profiles and contact therapists directly to confirm rates, boundaries, timing, location, and availability.",
    },
  ];

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch Premium Massage Directory",
          description:
            "Discover verified male massage therapists nearby with real availability, transparent pricing, and direct contact.",
          path: "/",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Top MasseurMatch city pages",
          path: "/",
          items: launchCities.map((city) => ({
            name: `Verified male massage therapists in ${city.city.name}`,
            path: city.href,
          })),
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Featured MasseurMatch therapists",
          path: "/",
          items: featuredTherapists.map((therapist) => ({
            name: therapist.display_name || therapist.full_name || "Therapist",
            path: `/therapists/${therapist.slug || therapist.id}`,
          })),
        })}
      />
      <JsonLd data={buildFaqJsonLd(homeFaqs)} />

      <CinematicHomepage
        featuredTherapists={featuredTherapists}
        totalTherapists={therapistsResult.total}
        cityCount={launchCities.length}
      />
    </>
  );
}
