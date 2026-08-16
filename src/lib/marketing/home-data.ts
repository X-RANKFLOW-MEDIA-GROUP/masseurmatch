import type { CityData } from "@/data/cities";
import { LIVE_COVERAGE_CITIES } from "@/lib/site-stats";

export type FaqItem = {
  question: string;
  answer: string;
};

export const LANDING_FAQ: FaqItem[] = [
  {
    question: "How do I find male massage therapists near me?",
    answer:
      "Start with a city page, then compare public profiles, specialties, incall or outcall options, visible pricing, availability, and trust signals before contacting an independent provider directly. An Identity Verified badge appears only when that provider has completed MasseurMatch's separate identity review.",
  },
  {
    question: "Which cities have MasseurMatch directory pages?",
    answer:
      `MasseurMatch maintains directory pages for ${LIVE_COVERAGE_CITIES}+ US cities. Some markets may still be awaiting approved public provider inventory, and empty local pages are kept out of the sitemap until the required inventory threshold is met.`,
  },
  {
    question: "Can I compare deep tissue, Swedish, hotel, and outcall options?",
    answer:
      "Yes, when matching public providers actually list those specialties or session formats. Local specialty pages do not claim service availability without matching provider data.",
  },
  {
    question: "Does MasseurMatch handle booking or payments?",
    answer:
      "No. MasseurMatch is a discovery directory. Users review profiles and contact independent providers directly to confirm rates, boundaries, timing, location, credentials important to them, availability, scheduling, and payment.",
  },
  {
    question: "How is MasseurMatch different from other massage directories?",
    answer:
      "MasseurMatch focuses on direct provider discovery, structured city and service pages, clear separation between paid visibility and trust signals, and professional LGBTQ+-affirming profile presentation.",
  },
  {
    question: "Is MasseurMatch LGBTQ+ affirming?",
    answer:
      "Yes. MasseurMatch is designed as an inclusive LGBTQ+-affirming directory. Providers indicate their affirmation status, and platform conduct rules require respectful, professional, non-sexual use.",
  },
];

type LaunchCityCard = {
  href: string;
  city: CityData;
  listingCount: number;
  routeCount: number;
  highlights: string[];
};

const PRIORITY_CITY_SLUGS = [
  "dallas",
  "miami",
  "new-york",
  "los-angeles",
  "chicago",
  "houston",
  "atlanta",
  "washington-dc",
] as const;

const CITY_HIGHLIGHTS: Record<string, string[]> = {
  dallas: ["Deep Tissue", "Outcall", "Hotel Massage", "Public Profiles"],
  miami: ["Outcall", "LGBTQ+ Affirming", "Hotel Massage", "City Directory"],
  "new-york": ["Manhattan", "Brooklyn", "Incall & Outcall", "Public Profiles"],
  "los-angeles": ["West Hollywood", "Santa Monica", "Outcall", "City Directory"],
  chicago: ["Deep Tissue", "Sports Recovery", "Incall", "City Directory"],
  houston: ["Outcall", "Deep Tissue", "Swedish", "City Directory"],
  atlanta: ["LGBTQ+ Affirming", "Outcall", "Deep Tissue", "City Directory"],
  "washington-dc": ["Incall & Outcall", "Deep Tissue", "City Directory", "LGBTQ+ Affirming"],
};

const CITY_ROUTE_COUNTS: Record<string, number> = {
  dallas: 42,
  miami: 28,
  "new-york": 36,
  "los-angeles": 32,
  chicago: 24,
  houston: 22,
  atlanta: 18,
  "washington-dc": 20,
};

export function getLaunchCityCards(cities: CityData[]): LaunchCityCard[] {
  return PRIORITY_CITY_SLUGS.map((slug) => {
    const city = cities.find((entry) => entry.slug === slug);
    if (!city) return null;

    return {
      href: `/${city.slug}`,
      city,
      listingCount: city.count,
      routeCount: CITY_ROUTE_COUNTS[city.slug] ?? 0,
      highlights: CITY_HIGHLIGHTS[city.slug] ?? ["City Directory", "Direct Contact"],
    };
  }).filter((item): item is LaunchCityCard => Boolean(item));
}
