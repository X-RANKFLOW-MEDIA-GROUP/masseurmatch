import { expect, test } from "@playwright/test";

import { fetchCanonical } from "./helpers/fetch-canonical";

/**
 * SEO normalization redirects — each case must be a single-hop 301/308.
 * Source of truth: LEGACY_REDIRECTS in next.config.mjs.
 *
 * Canonical URL format: /{city-slug}  (e.g. /dallas)
 * Legacy formats redirect to canonical — never the other way around.
 */

const CASES: Array<{ source: string; destination: string }> = [
  // /city/:slug → /:slug (old single-level prefix removal)
  { source: "/city/atlanta", destination: "/atlanta" },
  { source: "/city/dallas", destination: "/dallas" },

  // /cities/:city-state → /:city (legacy state-qualified → canonical short slug)
  { source: "/cities/atlanta-ga", destination: "/atlanta" },
  { source: "/cities/dallas-tx", destination: "/dallas" },
  { source: "/cities/miami-fl", destination: "/miami" },

  // Case-insensitive page redirects
  { source: "/Auth", destination: "/login" },
  { source: "/Privacy", destination: "/privacy" },

  // Global legacy aliases
  { source: "/massage-therapists", destination: "/therapists" },

  // /cities/dallas-tx/{category} → /dallas/{segment}
  { source: "/cities/dallas-tx/gay-massage", destination: "/dallas/lgbtq-friendly" },
  { source: "/cities/dallas-tx/deep-tissue", destination: "/dallas/wellness/deep-tissue" },

  // Duplicate-intent consolidation (middleware) — one canonical URL per intent
  { source: "/dallas/gay-massage", destination: "/dallas/lgbtq-friendly" },
  { source: "/houston/gay-massage", destination: "/houston/lgbtq-friendly" },
  { source: "/dallas/verified-therapists", destination: "/dallas/verified-profiles" },
  { source: "/dallas/services/deep-tissue", destination: "/dallas/wellness/deep-tissue" },
  { source: "/dallas/services/sports", destination: "/dallas/wellness/sports-recovery" },

  // Local discovery uses the canonical city inventory instead of maintaining
  // competing search and Explore result sets.
  { source: "/search?city=Dallas", destination: "/dallas" },
  { source: "/explore/usa/dallas?city=Dallas&radius=25&sort=distance&view=grid", destination: "/dallas" },
];

for (const { source, destination } of CASES) {
  test(`SEO normalization redirect ${source} -> ${destination}`, async ({ request, baseURL }) => {
    const response = await fetchCanonical(request, `${baseURL}${source}`);

    expect([301, 308], `Expected permanent redirect for ${source}`).toContain(response.status());

    const location = response.headers()["location"];
    // Normalize absolute URLs (middleware) to path-only for consistent assertions.
    const normalizedLocation = location?.startsWith("http")
      ? new URL(location).pathname
      : location?.split("?")[0];
    expect(normalizedLocation).toBe(destination);
  });
}
