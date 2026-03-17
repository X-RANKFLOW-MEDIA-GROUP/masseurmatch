export const DIRECTORY_SEGMENTS = [
  {
    slug: "lgbtq-friendly",
    label: "LGBTQ-friendly massage therapists",
    shortLabel: "LGBTQ-friendly",
    intro:
      "Browse therapists who market themselves to LGBTQ+ clients and want a welcoming, low-friction discovery experience.",
  },
  {
    slug: "male-therapists",
    label: "Male massage therapists",
    shortLabel: "Male therapists",
    intro:
      "Compare male massage therapist listings, specialties, and direct contact options in one place.",
  },
  {
    slug: "sports-recovery",
    label: "Sports recovery massage",
    shortLabel: "Sports recovery",
    intro:
      "Find therapists focused on recovery, mobility, training support, and bodywork for active clients.",
  },
  {
    slug: "wellness",
    label: "Wellness massage",
    shortLabel: "Wellness",
    intro:
      "Explore restorative massage listings built around stress relief, body maintenance, and general wellness goals.",
  },
  {
    slug: "featured",
    label: "Featured massage therapists",
    shortLabel: "Featured",
    intro:
      "See highlighted therapist listings with stronger profile presentation, pricing context, and contact clarity.",
  },
] as const;

export const SPECIALTY_KEYWORDS = [
  {
    slug: "deep-tissue",
    label: "Deep tissue massage",
    shortLabel: "Deep tissue",
    intro:
      "Compare deep tissue massage listings, pricing, and profile details for clients seeking focused pressure and recovery support.",
  },
  {
    slug: "swedish",
    label: "Swedish massage",
    shortLabel: "Swedish",
    intro:
      "Browse Swedish massage listings built around relaxation, circulation, and full-body maintenance.",
  },
  {
    slug: "thai",
    label: "Thai massage",
    shortLabel: "Thai",
    intro:
      "Find Thai massage listings that emphasize mobility, stretching, and assisted movement work.",
  },
  {
    slug: "outcall",
    label: "Outcall massage",
    shortLabel: "Outcall",
    intro:
      "Explore outcall massage listings for clients who want therapists to travel to a home, hotel, or requested location.",
  },
  {
    slug: "incall",
    label: "Incall massage",
    shortLabel: "Incall",
    intro:
      "Browse incall massage listings for sessions hosted in a therapist studio, office, or treatment space.",
  },
] as const;

export const IDENTITY_SEGMENT_SLUGS = new Set([
  "lgbtq-friendly",
  "male-therapists",
  "sports-recovery",
]);

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
