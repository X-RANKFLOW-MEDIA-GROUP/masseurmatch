/**
 * Provider landing-page city configuration.
 *
 * This is the single source of truth for the reusable `/providers/[citySlug]`
 * marketing landing pages. Every city that should have a landing page must be
 * registered here — the page component reads from this map and never hard-codes
 * a city name.
 *
 * NOTE: This is intentionally separate from `src/data/cities.ts` (the large
 * directory dataset consumed by the public `[city]` browse routes). Keeping the
 * landing-page config isolated lets us grow the marketing template independently
 * without touching directory data.
 *
 * ── How to add a new city ──────────────────────────────────────────────────
 *   Add one entry to the `cities` object below, keyed by its URL slug:
 *
 *     "sarasota": {
 *       name: "Sarasota",
 *       state: "Florida",
 *       stateCode: "FL",
 *     },
 *
 *   The slug (the object key) becomes the URL: /providers/sarasota
 *   Rules for a good slug: lowercase, ASCII, words separated by single hyphens,
 *   no spaces or punctuation (e.g. "St. Petersburg" -> "st-petersburg").
 *   That's it — `generateStaticParams()` will pre-render the new page on the
 *   next build, and metadata/SEO are generated automatically.
 */

/** Raw config shape authored by hand in the `cities` map below. */
export type CityConfig = {
  /** Display name, e.g. "St. Petersburg". */
  name: string;
  /** Full state name, e.g. "Florida". */
  state: string;
  /** Two-letter USPS state code, e.g. "FL". */
  stateCode: string;
};

/**
 * Resolved city passed to page components. Adds the URL `slug` (the map key)
 * so components never have to know where the data came from.
 */
export type City = CityConfig & {
  /** URL slug, e.g. "st-petersburg". Matches the key in the `cities` map. */
  slug: string;
};

/**
 * Registered cities, keyed by URL slug. Add new cities here — see the
 * "How to add a new city" note at the top of this file.
 */
export const cities: Record<string, CityConfig> = {
  "st-petersburg": {
    name: "St. Petersburg",
    state: "Florida",
    stateCode: "FL",
  },
  miami: {
    name: "Miami",
    state: "Florida",
    stateCode: "FL",
  },
  orlando: {
    name: "Orlando",
    state: "Florida",
    stateCode: "FL",
  },
  tampa: {
    name: "Tampa",
    state: "Florida",
    stateCode: "FL",
  },
};
