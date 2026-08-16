export type DirectorySearchConfig = {
  keyword?: string;
  modality?: string;
  session?: "home-visit" | "incall";
  verified?: boolean;
  lgbtqAffirming?: boolean;
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
    label: "Identity Verified massage therapists",
    shortLabel: "Identity Verified",
    intro:
      "Browse public profiles whose providers completed MasseurMatch's separate identity review using a supported government ID, a current challenge selfie, and human review. Identity verification is not a professional license check, background check, endorsement, or guarantee.",
    search: {
      verified: true,
    },
  },
  {
    slug: "male-therapists",
    label: "Male massage therapists",
    shortLabel: "Male therapists",
    intro:
      "Compare public male massage therapist profiles by city, provider supplied specialties, session format, rates, availability, and direct contact options.",
    search: {
      keyword: "male",
    },
  },
  {
    slug: "lgbtq-friendly",
    label: "LGBTQ+-affirming massage therapists",
    shortLabel: "LGBTQ+-affirming",
    intro:
      "Explore public profiles from providers who indicate that they are LGBTQ+-affirming, alongside visible platform trust signals and direct contact options.",
    search: {
      keyword: "gay",
      lgbtqAffirming: true,
    },
  },
  {
    slug: "sports-recovery",
    label: "Sports recovery massage",
    shortLabel: "Sports recovery",
    intro:
      "Browse public profiles that mention sports, recovery, mobility, or related bodywork in their provider supplied information.",
    search: {
      keyword: "sports",
    },
  },
  {
    slug: "wellness",
    label: "Wellness massage",
    shortLabel: "Wellness",
    intro:
      "Browse public massage provider profiles and compare service descriptions, rates, availability, and direct contact options.",
    search: {},
  },
];

export const SPECIALTY_KEYWORDS: SpecialtyKeyword[] = [
  {
    slug: "deep-tissue",
    label: "Deep tissue massage",
    shortLabel: "Deep tissue",
    intro:
      "Compare public profiles that list deep tissue massage among their provider supplied techniques or specialties.",
    search: {
      modality: "deep",
    },
  },
  {
    slug: "swedish",
    label: "Swedish massage",
    shortLabel: "Swedish",
    intro:
      "Browse public profiles that list Swedish massage among their provider supplied techniques or specialties.",
    search: {
      modality: "swedish",
    },
  },
  {
    slug: "sports-recovery",
    label: "Sports recovery massage",
    shortLabel: "Sports recovery",
    intro:
      "Browse public profiles that mention sports, recovery, mobility, or related bodywork in their provider supplied information.",
    search: {
      keyword: "sports",
    },
  },
  {
    slug: "thai",
    label: "Thai massage",
    shortLabel: "Thai",
    intro:
      "Browse public profiles that list Thai massage among their provider supplied techniques or specialties.",
    search: {
      modality: "thai",
    },
  },
  {
    slug: "mobile-massage",
    label: "Mobile massage",
    shortLabel: "Mobile",
    intro:
      "Browse public profiles that list mobile or outcall service. Confirm the exact travel area and current availability directly with the provider.",
    search: {
      session: "home-visit",
    },
  },
  {
    slug: "hotel-massage",
    label: "Hotel massage",
    shortLabel: "Hotel",
    intro:
      "Browse public profiles that list outcall or mobile service relevant to hotel locations. Confirm hotel coverage and access requirements directly with the provider.",
    search: {
      session: "home-visit",
    },
  },
  {
    slug: "outcall",
    label: "Outcall massage",
    shortLabel: "Outcall",
    intro:
      "Browse public profiles that list outcall or mobile service. Confirm the exact travel area, current rate, and availability directly with the provider.",
    search: {
      session: "home-visit",
    },
  },
  {
    slug: "incall",
    label: "Incall massage",
    shortLabel: "Incall",
    intro:
      "Browse public profiles that list incall service. Confirm the provider's current location details, rate, and availability directly before scheduling.",
    search: {
      session: "incall",
    },
  },
];

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
      lgbtqAffirming: accumulator.lgbtqAffirming || Boolean(config.lgbtqAffirming),
    }),
    {},
  );
}
