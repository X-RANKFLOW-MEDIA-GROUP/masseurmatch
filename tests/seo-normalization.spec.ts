import { expect, test } from "@playwright/test";

/**
 * SEO normalization redirects — each case must be a single-hop 301/308.
 * Source of truth: LEGACY_REDIRECTS in next.config.mjs.
 */
const CASES: Array<{ source: string; destination: string }> = [
  // /city/:slug → /:slug (legacy prefix removal)
  { source: "/city/atlanta", destination: "/atlanta" },
  { source: "/city/dallas", destination: "/dallas" },

  // /:slug → /cities/:slug-:state (canonical city URLs)
  { source: "/atlanta", destination: "/cities/atlanta-ga" },
  { source: "/dallas", destination: "/cities/dallas-tx" },
  { source: "/miami", destination: "/cities/miami-fl" },

  // Case-insensitive page redirects
  { source: "/Auth", destination: "/auth" },
  { source: "/Privacy", destination: "/privacy" },

  // Legacy keyword redirects
  { source: "/massage-therapists", destination: "/therapists" },
  { source: "/dallas/lgbtq-friendly", destination: "/cities/dallas-tx/gay-massage" },
  { source: "/dallas/wellness/deep-tissue", destination: "/cities/dallas-tx/deep-tissue" },
];

for (const { source, destination } of CASES) {
  test(`SEO normalization redirect ${source} -> ${destination}`, async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${source}`, { maxRedirects: 0 });

    expect([301, 308], `Expected permanent redirect for ${source}`).toContain(response.status());
    expect(response.headers()["location"]).toBe(destination);
  });
}
