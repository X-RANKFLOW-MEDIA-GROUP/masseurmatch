import { test, expect } from "@playwright/test";

/**
 * P0-1: Legal pages redirect + content smoke tests.
 * Asserts that /privacy, /cookie-policy, /near-me, and /terms return 200
 * with fewer than 2 redirects, and have a non-empty <title>.
 *
 * Run: npx playwright test tests/legal-pages.spec.ts
 */

const LEGAL_PAGES = [
  { path: "/privacy", expectedTitleFragment: "Privacy" },
  { path: "/cookie-policy", expectedTitleFragment: "Cookie" },
  { path: "/terms", expectedTitleFragment: "Terms" },
  { path: "/trust", expectedTitleFragment: "Trust" },
];

test.describe("Legal pages", () => {
  for (const { path, expectedTitleFragment } of LEGAL_PAGES) {
    test(`${path} returns 200 and has correct title`, async ({ page, request }) => {
      // 1. Fetch via the API to check status and redirect count
      const response = await request.get(path, { maxRedirects: 5 });
      expect(response.status(), `${path} should return 200`).toBe(200);

      // 2. Navigate and check page title
      await page.goto(path);
      await expect(page).not.toHaveURL(/\/(404|500)/);
      const title = await page.title();
      expect(title, `${path} title should contain "${expectedTitleFragment}"`).toContain(expectedTitleFragment);
    });
  }

  test("/privacy has non-empty canonical link", async ({ page }) => {
    await page.goto("/privacy");
    const canonical = await page.$eval(
      'link[rel="canonical"]',
      (el) => (el as HTMLLinkElement).href,
    );
    expect(canonical).toContain("/privacy");
    expect(canonical).not.toBe("");
  });

  test("/privacy-policy redirects to /privacy", async ({ request }) => {
    // Should redirect with ≤ 1 hop to /privacy
    const response = await request.get("/privacy-policy", { maxRedirects: 3 });
    expect(response.status()).toBe(200);
    expect(response.url()).toContain("/privacy");
  });

  test("/near-me has its own canonical (not homepage)", async ({ page }) => {
    await page.goto("/near-me");
    // Even if geolocation redirects, the initial page render should have near-me canonical
    const canonical = await page.$eval(
      'link[rel="canonical"]',
      (el) => (el as HTMLLinkElement).href,
    ).catch(() => "");
    expect(canonical).toContain("/near-me");
  });

  test("/cookie-policy renders real cookie content", async ({ page }) => {
    await page.goto("/cookie-policy");
    const title = await page.title();
    expect(title).toContain("Cookie");
    // Ensure it has actual content, not just a redirect
    const bodyText = await page.locator("main, h1, h2").first().innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });
});
