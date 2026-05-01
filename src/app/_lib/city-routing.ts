import { US_CITIES } from "@/data/cities";

const LEGACY_TO_CANONICAL: Record<string, string> = {
  "lgbtq-friendly": "gay-massage",
  "male-therapists": "male-massage",
  "sports-recovery": "sports-massage",
  "verified-profiles": "male-massage",
};

const KEYWORD_TO_CANONICAL: Record<string, string> = {
  "deep-tissue": "deep-tissue",
  swedish: "swedish",
  incall: "incall",
  outcall: "outcall",
};

const CANONICAL_CATEGORY_SLUGS = new Set([
  "gay-massage",
  "male-massage",
  "deep-tissue",
  "swedish",
  "sports-massage",
  "incall",
  "outcall",
  "mobile",
  "hotel",
  "oak-lawn",
  "turtle-creek",
  "uptown",
  "medical-district",
  "university-park",
  "highland-park",
  "dfw-airport",
  "love-field",
]);

export function getCanonicalCitySlug(citySlug: string): string {
  const city = US_CITIES.find((entry) => entry.slug === citySlug);
  if (!city) {
    return citySlug;
  }

  return `${city.slug}-${city.stateCode.toLowerCase()}`;
}

export function resolveCitySlug(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const direct = US_CITIES.find((entry) => entry.slug === normalized);
  if (direct) {
    return direct.slug;
  }

  const canonical = US_CITIES.find(
    (entry) => `${entry.slug}-${entry.stateCode.toLowerCase()}` === normalized,
  );

  return canonical ? canonical.slug : null;
}

export function canonicalCategoryToLegacyParts(category: string): string[] | null {
  const legacyPair = {
    "gay-massage": ["lgbtq-friendly"],
    "male-massage": ["male-therapists"],
    "sports-massage": ["sports-recovery"],
    "deep-tissue": ["wellness", "deep-tissue"],
    swedish: ["wellness", "swedish"],
    incall: ["wellness", "incall"],
    outcall: ["wellness", "outcall"],
    mobile: ["wellness", "outcall"],
    hotel: ["wellness", "outcall"],
  } as Record<string, string[]>;

  return legacyPair[category] || null;
}

export function normalizeCanonicalCategory(category: string): string {
  if (!category) {
    return category;
  }

  if (LEGACY_TO_CANONICAL[category]) {
    return LEGACY_TO_CANONICAL[category];
  }

  return category;
}

export function buildCanonicalCityPath(citySlug: string, canonicalParts: string[] = []): string {
  const canonicalCity = getCanonicalCitySlug(citySlug);
  if (!canonicalParts.length) {
    return `/cities/${canonicalCity}`;
  }

  return `/cities/${canonicalCity}/${canonicalParts.join("/")}`;
}

export function legacyPartsToCanonical(legacyParts: string[]): string[] {
  if (!legacyParts.length) {
    return [];
  }

  const [segment, keyword] = legacyParts;

  if (CANONICAL_CATEGORY_SLUGS.has(segment)) {
    return [segment];
  }

  if (segment === "wellness" && keyword && KEYWORD_TO_CANONICAL[keyword]) {
    return [KEYWORD_TO_CANONICAL[keyword]];
  }

  const mappedSegment = LEGACY_TO_CANONICAL[segment];
  if (mappedSegment) {
    return [mappedSegment];
  }

  return [];
}
