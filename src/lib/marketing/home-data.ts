import type { CityData } from "@/data/cities";

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
