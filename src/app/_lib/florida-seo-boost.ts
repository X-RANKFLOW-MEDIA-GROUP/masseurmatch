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

export const FLORIDA_SEO_KEYWORDS = [
  "gay-massage",
  "male-massage",
  "lgbtq-friendly",
  "outcall",
  "incall"
] as const;

export function buildFloridaSeoPaths() {
  const paths: string[] = [];

  for (const city of FLORIDA_PRIORITY_CITIES) {
    for (const keyword of FLORIDA_SEO_KEYWORDS) {
      paths.push(`/${city}/${keyword}`);
    }
  }

  return paths;
}
