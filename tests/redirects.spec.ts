import { test, expect } from "@playwright/test";

/**
 * CI gate: validates every entry in the redirects manifest.
 * Fails the build if status or destination drifts from the expected value.
 *
 * Each entry asserts:
 * 1. The response is 301 or 308 (permanent redirect).
 * 2. The Location header exactly matches the expected destination.
 */

type RedirectCase = [source: string, destination: string];

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
    const res = await request.get(`${baseURL}${source}`, {
      maxRedirects: 0,
    });

    // Accept both 301 (edge/host-level) and 308 (Next.js permanent: true).
    expect(
      [301, 308],
      `Expected 301 or 308 for ${source} but got ${res.status()}`,
    ).toContain(res.status());

    const location = res.headers()["location"];
    expect(
      location,
      `Expected Location: ${destination} but got ${location} for ${source}`,
    ).toBe(destination);
  });
}
