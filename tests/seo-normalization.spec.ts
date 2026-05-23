import { expect, test } from "@playwright/test";

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
  { source: "/Auth", destination: "/auth" },
  { source: "/Privacy", destination: "/privacy" },

  // Global legacy aliases
  { source: "/massage-therapists", destination: "/therapists" },

  // /cities/dallas-tx/{category} → /dallas/{segment}
  { source: "/cities/dallas-tx/gay-massage", destination: "/dallas/lgbtq-friendly" },
  { source: "/cities/dallas-tx/deep-tissue", destination: "/dallas/wellness/deep-tissue" },
];

for (const { source, destination } of CASES) {
  test(`SEO normalization redirect ${source} -> ${destination}`, async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${source}`, { maxRedirects: 0 });

    expect([301, 308], `Expected permanent redirect for ${source}`).toContain(response.status());

    const location = response.headers()["location"];
    // Normalize absolute URLs (middleware) to path-only for consistent assertions.
    const normalizedLocation = location?.startsWith("http")
      ? new URL(location).pathname
      : location;
    expect(normalizedLocation).toBe(destination);
  });
}
