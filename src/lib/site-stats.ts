/**
 * Canonical site statistics.
 *
 * FLAG: These are conservative estimates. Replace with real DB queries
 * via getPlatformStats() once Supabase is confirmed stable. Never show
 * "500+" while the DB has fewer profiles.
 */

/** Total city pages generated (full SEO footprint) */
export const TOTAL_CITY_PAGES = 278;

/** Cities with live, active therapist coverage */
export const LIVE_COVERAGE_CITIES = 80;

/**
 * FLAG: This must reflect real active profile count.
 * Use getPlatformStats() for runtime accuracy.
 */
export const TOTAL_PROFILES = 50;

/** Total service routes (city × modality combinations) */
export const TOTAL_SERVICES = 1200;
