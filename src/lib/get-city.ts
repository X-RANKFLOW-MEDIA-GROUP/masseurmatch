import { cities, type City } from "@/data/provider-cities";

/**
 * Resolve a city by its URL slug from the provider landing-page config.
 * Returns the fully-resolved {@link City} (config + slug) or `null` when the
 * slug is not registered, so callers can trigger `notFound()`.
 */
export function getCity(slug: string): City | null {
  const config = cities[slug];
  if (!config) return null;
  return { ...config, slug };
}

/** Every registered city slug — used by `generateStaticParams()`. */
export function getCitySlugs(): string[] {
  return Object.keys(cities);
}

/** Every registered city, resolved. */
export function getAllCities(): City[] {
  return getCitySlugs().map((slug) => ({ ...cities[slug], slug }));
}
