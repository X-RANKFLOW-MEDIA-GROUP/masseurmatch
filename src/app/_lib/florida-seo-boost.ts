export const FLORIDA_PRIORITY_CITIES = [
  "miami",
  "fort-lauderdale",
  "orlando",
  "tampa",
  "st-petersburg",
  "miami-beach",
  "wilton-manors",
  "jacksonville"
] as const;

export const FLORIDA_SEO_SEGMENT_SLUGS = [
  "gay-massage",
  "male-massage",
  "lgbtq-friendly"
] as const;

export const FLORIDA_SEO_SPECIALTY_SLUGS = [
  "outcall",
  "incall"
] as const;

export function buildFloridaSeoPaths() {
  const paths: string[] = [];
  const seoSlugs = [
    ...FLORIDA_SEO_SEGMENT_SLUGS,
    ...FLORIDA_SEO_SPECIALTY_SLUGS
  ] as const;

  for (const city of FLORIDA_PRIORITY_CITIES) {
    for (const slug of seoSlugs) {
      paths.push(`/${city}/${slug}`);
    }
  }

  return paths;
}
