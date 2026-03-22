export type DirectorySearchConfig = {
  keyword?: string;
  modality?: string;
  session?: "home-visit" | "incall";
  verified?: boolean;
};

export type DirectorySegment = {
  slug: string;
  label: string;
  shortLabel: string;
  intro: string;
  search: DirectorySearchConfig;
};

export type SpecialtyKeyword = {
  slug: string;
  label: string;
  shortLabel: string;
  intro: string;
  search: DirectorySearchConfig;
};

export const DIRECTORY_SEGMENTS: DirectorySegment[] = [
  {
    slug: "verified-profiles",
    label: "Verified male massage therapists",
    shortLabel: "Verified",
    intro:
      "Browse verified profiles first so city discovery starts with clearer trust signals, cleaner listings, and direct contact options.",
    search: {
      verified: true,
    },
  },
  {
    slug: "male-therapists",
    label: "Male massage therapists",
    shortLabel: "Male therapists",
    intro:
      "Compare male massage therapist profiles with city context, specialties, and direct contact without marketplace friction.",
    search: {
      keyword: "male",
    },
  },
  {
    slug: "lgbtq-friendly",
    label: "LGBTQ-friendly massage therapists",
    shortLabel: "LGBTQ-friendly",
    intro:
      "Explore welcoming profiles built for respectful, inclusive discovery with visible trust and safety guidance.",
    search: {
      keyword: "gay",
    },
  },
  {
    slug: "sports-recovery",
    label: "Sports recovery massage",
    shortLabel: "Sports recovery",
    intro:
      "Find therapists focused on recovery, mobility, body maintenance, and performance-minded wellness sessions.",
    search: {
      keyword: "sports",
    },
  },
  {
    slug: "wellness",
    label: "Premium wellness massage",
    shortLabel: "Wellness",
    intro:
      "Browse calm, premium wellness-focused listings with stronger editorial consistency and straightforward contact flow.",
    search: {},
  },
];

export const SPECIALTY_KEYWORDS: SpecialtyKeyword[] = [
  {
    slug: "deep-tissue",
    label: "Deep tissue massage",
    shortLabel: "Deep tissue",
    intro:
      "Compare deep tissue massage listings, rates, and trust signals for focused pressure, relief, and recovery support.",
    search: {
      modality: "deep",
    },
  },
  {
    slug: "swedish",
    label: "Swedish massage",
    shortLabel: "Swedish",
    intro:
      "Browse Swedish massage listings designed around relaxation, circulation, and full-body maintenance.",
    search: {
      modality: "swedish",
    },
  },
  {
    slug: "sports-recovery",
    label: "Sports recovery massage",
    shortLabel: "Sports recovery",
    intro:
      "Find sports recovery listings that focus on mobility, maintenance, and performance-minded bodywork in your city.",
    search: {
      keyword: "sports",
    },
  },
  {
    slug: "thai",
    label: "Thai massage",
    shortLabel: "Thai",
    intro:
      "Find Thai massage profiles that emphasize stretching, mobility, and assisted bodywork with direct contact clarity.",
    search: {
      modality: "thai",
    },
  },
  {
    slug: "mobile-massage",
    label: "Mobile massage",
    shortLabel: "Mobile",
    intro:
      "Explore mobile massage listings for therapists who can travel to homes, hotels, and requested locations.",
    search: {
      session: "home-visit",
    },
  },
  {
    slug: "hotel-massage",
    label: "Hotel massage",
    shortLabel: "Hotel",
    intro:
      "Browse hotel massage listings for travel-focused sessions with clear direct-contact and availability expectations.",
    search: {
      session: "home-visit",
    },
  },
  {
    slug: "outcall",
    label: "Outcall massage",
    shortLabel: "Outcall",
    intro:
      "Explore outcall massage listings for therapists who travel to homes, hotels, or requested locations.",
    search: {
      session: "home-visit",
    },
  },
  {
    slug: "incall",
    label: "Incall massage",
    shortLabel: "Incall",
    intro:
      "Browse incall massage listings for sessions hosted in a therapist studio, office, or treatment space.",
    search: {
      session: "incall",
    },
  },
];

export const DEFAULT_CITY_KEYWORDS = SPECIALTY_KEYWORDS.map((keyword) => keyword.slug);

export const formatSlugLabel = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getSegmentBySlug = (slug: string) =>
  DIRECTORY_SEGMENTS.find((segment) => segment.slug === slug);

export const getKeywordBySlug = (slug: string) =>
  SPECIALTY_KEYWORDS.find((keyword) => keyword.slug === slug);

export function getSegmentSearchFilters(slug: string): DirectorySearchConfig {
  return getSegmentBySlug(slug)?.search ?? {};
}

export function getKeywordSearchFilters(slug: string): DirectorySearchConfig {
  return getKeywordBySlug(slug)?.search ?? {};
}

export function resolveDirectoryFilters(...configs: DirectorySearchConfig[]): DirectorySearchConfig {
  return configs.reduce<DirectorySearchConfig>(
    (accumulator, config) => ({
      keyword: config.keyword ?? accumulator.keyword,
      modality: config.modality ?? accumulator.modality,
      session: config.session ?? accumulator.session,
      verified: accumulator.verified || Boolean(config.verified),
    }),
    {},
  );
}
