import { test, expect, type APIRequestContext } from "@playwright/test";

/**
 * CI gate: validates every entry in the redirects manifest.
 * Fails the build if status or destination drifts from the expected value.
 *
 * Each entry asserts:
 * 1. The response is 301 or 308 (permanent redirect).
 * 2. The Location header exactly matches the expected destination.
 */

type RedirectCase = [source: string, destination: string];

const REDIRECT_STATUSES = new Set([301, 302, 307, 308]);
const MAX_INFRASTRUCTURE_REDIRECTS = 3;

/**
 * Follow infrastructure-level host canonicalization transparently so the test
 * sees the application-level redirect. Vercel may use 301, 302, 307, or 308
 * for a same-path cross-origin hop, and that status may change independently
 * of the application redirect configuration.
 */
async function fetchCanonical(
  request: APIRequestContext,
  url: string,
): Promise<Awaited<ReturnType<APIRequestContext["get"]>>> {
  let currentUrl = url;

  for (let hop = 0; hop < MAX_INFRASTRUCTURE_REDIRECTS; hop += 1) {
    const res = await request.get(currentUrl, { maxRedirects: 0 });
    const location = res.headers()["location"];

    if (!REDIRECT_STATUSES.has(res.status()) || !location) {
      return res;
    }

    const sourceUrl = new URL(currentUrl);
    const locationUrl = new URL(location, currentUrl);
    const samePathAndQuery =
      locationUrl.pathname === sourceUrl.pathname &&
      locationUrl.search === sourceUrl.search;
    const differentOrigin = locationUrl.origin !== sourceUrl.origin;

    if (!samePathAndQuery || !differentOrigin) {
      return res;
    }

    currentUrl = locationUrl.toString();
  }

  throw new Error(
    `Exceeded ${MAX_INFRASTRUCTURE_REDIRECTS} same-path host redirects for ${url}`,
  );
}

// Mirror of src/app/_lib/redirects-manifest.ts — update both together.
// The source of truth for intent is the TS file; these cases validate HTTP behaviour.
const REDIRECT_CASES: RedirectCase[] = [
  // /city/* → /{city}
  ["/city/dallas",         "/dallas"],
  ["/city/plano",          "/plano"],
  ["/city/irving",         "/irving"],
  ["/city/highland-park",  "/highland-park"],
  ["/city/fort-worth",     "/fort-worth"],
  ["/city/houston",        "/houston"],
  ["/city/austin",         "/austin"],
  ["/city/los-angeles",    "/los-angeles"],
  ["/city/miami",          "/miami"],
  ["/city/chicago",        "/chicago"],
  ["/city/san-diego",      "/san-diego"],
  // /cities/{city-state} → /{city}
  ["/cities/dallas-tx",       "/dallas"],
  ["/cities/plano-tx",        "/plano"],
  ["/cities/irving-tx",       "/irving"],
  ["/cities/houston-tx",      "/houston"],
  ["/cities/austin-tx",       "/austin"],
  ["/cities/los-angeles-ca",  "/los-angeles"],
  ["/cities/miami-fl",        "/miami"],
  ["/cities/chicago-il",      "/chicago"],
  ["/cities/san-diego-ca",    "/san-diego"],
  ["/cities/atlanta-ga",      "/atlanta"],
  ["/cities/denver-co",       "/denver"],
  ["/cities/phoenix-az",      "/phoenix"],
  // Service pages under /cities/dallas-tx/*
  ["/cities/dallas-tx/gay-massage",    "/dallas/lgbtq-friendly"],
  ["/cities/dallas-tx/male-massage",   "/dallas/male-therapists"],
  ["/cities/dallas-tx/deep-tissue",    "/dallas/wellness/deep-tissue"],
  ["/cities/dallas-tx/outcall",        "/dallas/wellness/outcall"],
  ["/cities/dallas-tx/incall",         "/dallas/wellness/incall"],
  ["/cities/dallas-tx/swedish",        "/dallas/wellness/swedish"],
  ["/cities/dallas-tx/sports-massage", "/dallas/wellness/sports-recovery"],
  ["/cities/dallas-tx/mobile",         "/dallas/wellness/mobile-massage"],
  ["/cities/dallas-tx/hotel",          "/dallas/wellness/hotel-massage"],
  // Global legacy aliases
  ["/massage-therapists", "/therapists"],
];

for (const [source, destination] of REDIRECT_CASES) {
  test(`redirect ${source} → ${destination}`, async ({ request, baseURL }) => {
    const res = await fetchCanonical(request, `${baseURL}${source}`);

    // Accept both 301 (edge/host-level) and 308 (Next.js permanent: true).
    expect(
      [301, 308],
      `Expected 301 or 308 for ${source} but got ${res.status()}`,
    ).toContain(res.status());

    const location = res.headers()["location"];
    // Middleware returns absolute URLs; next.config redirects return relative paths.
    // Normalize to path-only so both forms pass the assertion.
    const normalizedLocation = location?.startsWith("http")
      ? new URL(location).pathname
      : location?.split("?")[0];
    expect(
      normalizedLocation,
      `Expected Location: ${destination} but got ${location} for ${source}`,
    ).toBe(destination);
  });
}
