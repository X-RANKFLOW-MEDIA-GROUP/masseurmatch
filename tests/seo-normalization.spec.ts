import { expect, test } from "@playwright/test";

const CASES: Array<{ source: string; destination: string }> = [
  { source: "/atlanta?lang=en", destination: "/atlanta" },
  { source: "/washington-dc/massage-therapists", destination: "/washington-dc" },
  { source: "/city/atlanta/massage-therapists?lang=fr", destination: "/atlanta" },
  { source: "/cities/washington-dc/massage-therapists?lang=es", destination: "/washington-dc" },
];

for (const { source, destination } of CASES) {
  test(`SEO normalization redirect ${source} -> ${destination}`, async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${source}`, { maxRedirects: 0 });

    expect([301, 308], `Expected permanent redirect for ${source}`).toContain(response.status());
    expect(response.headers()["location"]).toBe(destination);
  });
}
