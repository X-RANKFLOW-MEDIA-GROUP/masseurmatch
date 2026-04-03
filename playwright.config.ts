import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — E2E, API, and redirect validation tests.
 *
 * Locally: start `pnpm dev` then run `npx playwright test`
 * In CI: set PLAYWRIGHT_BASE_URL (GitHub secret/var) to the deployed URL.
 *
 * Run specific suites:
 *   npx playwright test tests/redirects.spec.ts
 *   npx playwright test tests/api/
 *   npx playwright test tests/auth/
 */

const DEFAULT_BASE_URL = "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
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
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
