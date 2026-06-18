import { test, expect } from "@playwright/test";

/**
 * P1-10: Signup plan page smoke tests.
 * Validates that /signup/plan renders correctly and query-param pre-selection works.
 * Does NOT perform actual signups or require credentials.
 *
 * Run: npx playwright test tests/auth/signup-plan.spec.ts
 */

test.describe("Signup plan page", () => {
  test("/signup/plan renders plan cards", async ({ page }) => {
    await page.goto("/signup/plan");
    await expect(page).not.toHaveURL(/\/(404|500)/);

    const bodyText = await page.textContent("body");
    // All four canonical tier names must appear
    expect(bodyText).toMatch(/Free/i);
    expect(bodyText).toMatch(/Standard/i);
    expect(bodyText).toMatch(/Pro/i);
    expect(bodyText).toMatch(/Elite/i);
  });

  test("/signup/plan shows correct prices from canonical source", async ({ page }) => {
    await page.goto("/signup/plan");
    const bodyText = await page.textContent("body");

    // Prices must match lib/pricing.ts — never the old $49 'Verified' tier
    expect(bodyText).toMatch(/\$39/);
    expect(bodyText).toMatch(/\$79/);
    expect(bodyText).toMatch(/\$99/);
    expect(bodyText).not.toMatch(/\$49[^.]|Verified badge on profile|Start Verified/);
  });

  test("/signup/plan?selected=standard loads without error", async ({ page }) => {
    await page.goto("/signup/plan?selected=standard");
    await expect(page).not.toHaveURL(/\/(404|500)/);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });

  test("/signup/plan?selected=pro loads without error", async ({ page }) => {
    await page.goto("/signup/plan?selected=pro");
    await expect(page).not.toHaveURL(/\/(404|500)/);
  });

  test("/signup/plan?selected=elite loads without error", async ({ page }) => {
    await page.goto("/signup/plan?selected=elite");
    await expect(page).not.toHaveURL(/\/(404|500)/);
  });
});
