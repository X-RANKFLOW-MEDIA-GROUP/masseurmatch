import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — focused on redirect CI validation.
 * Run: npx playwright test tests/redirects.spec.ts
 *
 * In CI, set PLAYWRIGHT_BASE_URL to the deployed preview URL.
 * Locally, start `npm run dev` then run the tests with DEFAULT_BASE_URL.
 */

const DEFAULT_BASE_URL = "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  timeout: 20_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? DEFAULT_BASE_URL,
    extraHTTPHeaders: {
      // Tell the server it's a CI request so it can skip rate-limiting if needed.
      "x-playwright-ci": "1",
    },
  },
  projects: [
    {
      name: "redirect-validation",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
