import { test, expect, type APIRequestContext } from "@playwright/test";

/**
 * CI gate: validates every redirect entry and confirms its destination renders.
 * This prevents the SEO-damaging chain: indexed URL -> permanent redirect -> 404.
 */

type RedirectCase = [source: string, destination: string];

/**
 * Follow Vercel's infrastructure-level domain redirect (apex -> www)
 * transparently so the test sees the application-level redirect (301/308).
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
      const locUrl = new URL(loc, srcUrl);
      if (locUrl.pathname === srcUrl.pathname && locUrl.hostname !== srcUrl.hostname) {
        return request.get(locUrl.origin + locUrl.pathname, { maxRedirects: 0 });
      }
    }
  }
  return res;
}

const REDIRECT_CASES: RedirectCase[] = [
  ["/city/dallas", "/dallas"],
  ["/city/plano", "/plano"],
  ["/city/irving", "/irving"],
  ["/city/highland-park", "/highland-park"],
  ["/city/fort-worth", "/fort-worth"],
  ["/city/houston", "/houston"],
  ["/city/austin", "/austin"],
  ["/city/los-angeles", "/los-angeles"],
  ["/city/miami", "/miami"],
  ["/city/chicago", "/chicago"],
  ["/city/san-diego", "/san-diego"],
  ["/cities/dallas-tx", "/dallas"],
  ["/cities/plano-tx", "/plano"],
  ["/cities/irving-tx", "/irving"],
  ["/cities/houston-tx", "/houston"],
  ["/cities/austin-tx", "/austin"],
  ["/cities/los-angeles-ca", "/los-angeles"],
  ["/cities/miami-fl", "/miami"],
  ["/cities/chicago-il", "/chicago"],
  ["/cities/san-diego-ca", "/san-diego"],
  ["/cities/atlanta-ga", "/atlanta"],
  ["/cities/denver-co", "/denver"],
  ["/cities/phoenix-az", "/phoenix"],
  ["/cities/dallas-tx/gay-massage", "/dallas/lgbtq-friendly"],
  ["/cities/dallas-tx/male-massage", "/dallas/male-therapists"],
  ["/cities/dallas-tx/deep-tissue", "/dallas/wellness/deep-tissue"],
  ["/cities/dallas-tx/outcall", "/dallas/wellness/outcall"],
  ["/cities/dallas-tx/incall", "/dallas/wellness/incall"],
  ["/cities/dallas-tx/swedish", "/dallas/wellness/swedish"],
  ["/cities/dallas-tx/sports-massage", "/dallas/wellness/sports-recovery"],
  ["/cities/dallas-tx/mobile", "/dallas/wellness/mobile-massage"],
  ["/cities/dallas-tx/hotel", "/dallas/wellness/hotel-massage"],
  // Regression cases observed in Vercel production logs.
  ["/cities/frisco-tx/male-massage", "/frisco/male-therapists"],
  ["/cities/sarasota-fl/gay-massage", "/sarasota/lgbtq-friendly"],
  ["/cities/cambridge-ma/hotel", "/cambridge/wellness/hotel-massage"],
  ["/cities/greensboro-nc/hotel", "/greensboro/wellness/hotel-massage"],
  ["/cities/fire-island-ny/deep-tissue", "/fire-island/wellness/deep-tissue"],
  ["/massage-therapists", "/therapists"],
];

for (const [source, destination] of REDIRECT_CASES) {
  test(`redirect ${source} -> ${destination} and destination is live`, async ({ request, baseURL }) => {
    const res = await fetchCanonical(request, `${baseURL}${source}`);

    expect(
      [301, 308],
      `Expected 301 or 308 for ${source} but got ${res.status()}`,
    ).toContain(res.status());

    const location = res.headers()["location"];
    const normalizedLocation = location?.startsWith("http")
      ? new URL(location).pathname
      : location?.split("?")[0];
    expect(
      normalizedLocation,
      `Expected Location: ${destination} but got ${location} for ${source}`,
    ).toBe(destination);

    const destinationResponse = await request.get(`${baseURL}${destination}`, {
      maxRedirects: 5,
    });
    expect(
      destinationResponse.status(),
      `Redirect destination ${destination} returned ${destinationResponse.status()} for ${source}`,
    ).toBe(200);
  });
}
