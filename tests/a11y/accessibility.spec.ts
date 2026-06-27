import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Pages that must pass WCAG 2.1 AA on every CI run.
// Keep this list focused on high-traffic, user-facing surfaces.
const PUBLIC_PAGES = [
  { name: "Homepage",       path: "/" },
  { name: "Explore",        path: "/explore" },
  { name: "Terms",          path: "/terms" },
  { name: "Privacy",        path: "/privacy" },
  { name: "About",          path: "/about" },
];

for (const { name, path } of PUBLIC_PAGES) {
  test(`${name} (${path}) has no automatically-detectable WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(path);
    // Wait for the page to settle before scanning.
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Exclude third-party iframes (Stripe, Google Maps) from scope.
      .exclude("iframe")
      .analyze();

    // Surface readable summaries for each violation in the assertion message.
    const violationSummary = results.violations
      .map((v) => `[${v.impact ?? "unknown"}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`)
      .join("\n");

    expect(results.violations, violationSummary).toHaveLength(0);
  });
}

test("Profile page has no automatically-detectable WCAG 2.1 AA violations", async ({ page }) => {
  // Use the canonical demo/test profile slug so the test is deterministic.
  const profileSlug = process.env.A11Y_TEST_PROFILE_SLUG ?? "ethan-cole";
  await page.goto(`/therapists/${profileSlug}`);
  await page.waitForLoadState("networkidle");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("iframe")
    .analyze();

  const violationSummary = results.violations
    .map((v) => `[${v.impact ?? "unknown"}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`)
    .join("\n");

  expect(results.violations, violationSummary).toHaveLength(0);
});
