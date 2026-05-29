import type { CityData } from "@/data/cities";

export type FaqItem = {
  question: string;
  answer: string;
};

export const LANDING_FAQ: FaqItem[] = [
  {
    question: "How do I find verified male massage therapists near me?",
    answer:
      "Start with a city page, then compare specialties, incall or outcall options, visible pricing, reviews, and profile quality before contacting a therapist directly.",
  },
  {
    question: "Which cities have live MasseurMatch landing pages?",
    answer:
      "MasseurMatch covers 80+ US cities including Dallas, Miami, New York, Los Angeles, Chicago, Houston, Atlanta, Washington DC, San Francisco, Seattle, Denver, Phoenix, Las Vegas, Boston, New Orleans, and more.",
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
  {
    question: "Is MasseurMatch a better alternative to MasseurFinder or RentMasseur?",
    answer:
      "MasseurMatch is a modern alternative to legacy directories like MasseurFinder and RentMasseur. It offers cleaner profile presentation, stronger local SEO, city-first landing pages, and a professional wellness-forward brand without the mixed-intent marketplace feel.",
  },
  {
    question: "Is MasseurMatch LGBTQ+ affirming?",
    answer:
      "Yes. MasseurMatch is built as an inclusive LGBTQ+-affirming platform. Therapists signal their affirmation and clients can filter for it — creating a safer, more targeted discovery experience.",
  },
];

export type LaunchCityCard = {
  href: string;
  city: CityData;
  listingCount: number;
  routeCount: number;
  highlights: string[];
};

export const PRIORITY_CITY_SLUGS = [
  "dallas",
  "miami",
  "new-york",
  "los-angeles",
  "chicago",
  "houston",
  "atlanta",
  "washington-dc",
] as const;

export const CITY_HIGHLIGHTS: Record<string, string[]> = {
  dallas: ["Deep Tissue", "Outcall", "Hotel Massage", "Verified Profiles"],
  miami: ["Outcall", "LGBTQ+ Friendly", "Beach Area", "Verified Profiles"],
  "new-york": ["Manhattan", "Brooklyn", "Incall & Outcall", "Verified"],
  "los-angeles": ["West Hollywood", "Santa Monica", "Outcall", "Verified"],
  chicago: ["Deep Tissue", "Sports Recovery", "Incall", "Verified"],
  houston: ["Outcall", "Deep Tissue", "Swedish", "Verified Profiles"],
  atlanta: ["LGBTQ+ Friendly", "Outcall", "Deep Tissue", "Verified"],
  "washington-dc": ["Incall & Outcall", "Deep Tissue", "Verified", "LGBTQ+"],
};

export const CITY_ROUTE_COUNTS: Record<string, number> = {
  dallas: 42,
  miami: 28,
  "new-york": 36,
  "los-angeles": 32,
  chicago: 24,
  houston: 22,
  atlanta: 18,
  "washington-dc": 20,
};
