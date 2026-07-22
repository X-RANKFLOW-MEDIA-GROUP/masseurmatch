import { expect, test, type APIRequestContext } from "@playwright/test";

/**
 * SEO normalization redirects — each case must be a single-hop 301/308.
 * Source of truth: LEGACY_REDIRECTS in next.config.mjs.
 *
 * Canonical URL format: /{city-slug}  (e.g. /dallas)
 * Legacy formats redirect to canonical — never the other way around.
 */

/**
 * Follow Vercel's infrastructure-level domain redirect (apex → www)
 * transparently so the test sees the application-level redirect (301/308).
 * The apex domain `masseurmatch.com` redirects to `www.masseurmatch.com`
 * before Next.js runs. Its status code has changed over time (307, then 308),
 * so identify the hop by shape — same path, different host — rather than by
 * status: application redirects always rewrite the path, the domain hop never
 * does.
 */
async function fetchCanonical(
  request: APIRequestContext,
  url: string,
): Promise<Awaited<ReturnType<APIRequestContext["get"]>>> {
  const res = await request.get(url, { maxRedirects: 0 });
  if (res.status() >= 300 && res.status() < 400) {
    const loc = res.headers()["location"];
    if (loc) {
      const srcUrl = new URL(url);
      // Resolve against the request URL: app-level redirects may send a
      // relative Location, which resolves to the same host and is never
      // treated as the domain hop.
      const locUrl = new URL(loc, srcUrl);
      // Same path, different host → domain-level redirect; follow it once.
      if (locUrl.pathname === srcUrl.pathname && locUrl.hostname !== srcUrl.hostname) {
        return request.get(locUrl.origin + locUrl.pathname, { maxRedirects: 0 });
      }
    }
  }
  return res;
}

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
