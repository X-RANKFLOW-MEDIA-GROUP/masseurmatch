import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

const ROUTES = ["/", "/free?city=Dallas", "/therapists"] as const;
const HYDRATION_ERROR = /(?:minified react error\s*#418|hydration|hydrating|server rendered html|did(?: not|n't) match)/i;

function collectHydrationErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on("console", (message: ConsoleMessage) => {
    if (message.type() !== "error") return;

    const text = message.text();
    if (HYDRATION_ERROR.test(text)) {
      errors.push(text);
    }
  });

  page.on("pageerror", (error) => {
    const text = String(error?.message ?? error);
    if (HYDRATION_ERROR.test(text)) {
      errors.push(`pageerror: ${text}`);
    }
  });

  return errors;
}

test.describe("React hydration", () => {
  for (const route of ROUTES) {
    test(`${route} hydrates without React mismatch errors`, async ({ page }) => {
      const hydrationErrors = collectHydrationErrors(page);
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });

      expect(response?.status() ?? 0, `HTTP status for ${route}`).toBeLessThan(400);
      await expect(page.locator("body")).toBeVisible();
      await page.waitForTimeout(1_000);

      expect(
        hydrationErrors,
        `Hydration errors on ${route}: ${hydrationErrors.join(" | ")}`,
      ).toEqual([]);
    });
  }
});
