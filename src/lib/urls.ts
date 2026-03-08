/**
 * URL helper utilities for the new SEO-friendly URL structure.
 *
 * New routes:
 *   /:city                     → City landing page
 *   /:city/massage-therapists  → City listing page
 *   /:city/therapist/:slug     → Therapist profile page
 */

export function cityNameToSlug(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Build the URL for a city landing page */
export function buildCityUrl(citySlug: string): string {
  return `/${citySlug}`;
}

/** Build the URL for a city listing page */
export function buildCityListingUrl(citySlug: string): string {
  return `/${citySlug}/massage-therapists`;
}

/** Build the URL for a therapist profile page */
export function buildProfileUrl(citySlug: string, profileSlug: string): string {
  return `/${citySlug}/therapist/${profileSlug}`;
}

/** Build profile URL from raw city name and profile slug */
export function buildProfileUrlFromCity(cityName: string | null, profileSlug: string): string {
  const citySlug = cityName ? cityNameToSlug(cityName) : "us";
  return buildProfileUrl(citySlug, profileSlug);
}

const BASE_URL = "https://masseurmatch.com";

/** Build absolute URL for a city page */
export function absoluteCityUrl(citySlug: string): string {
  return `${BASE_URL}/${citySlug}`;
}

/** Build absolute URL for a city listing page */
export function absoluteCityListingUrl(citySlug: string): string {
  return `${BASE_URL}/${citySlug}/massage-therapists`;
}

/** Build absolute URL for a therapist profile */
export function absoluteProfileUrl(citySlug: string, profileSlug: string): string {
  return `${BASE_URL}/${citySlug}/therapist/${profileSlug}`;
}
