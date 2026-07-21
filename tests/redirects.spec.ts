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
