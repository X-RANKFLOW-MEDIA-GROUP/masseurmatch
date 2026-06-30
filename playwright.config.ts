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

const DEFAULT_BASE_URL = "http://127.0.0.1:5000";
const shouldManageWebServer = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**"],
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  webServer: shouldManageWebServer
    ? {
        command: "pnpm dev",
        url: DEFAULT_BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? DEFAULT_BASE_URL,
    // Evidence on failures (TAREFA 8): screenshots, traces, and video are
    // retained only when a test fails so reviewers can inspect what broke.
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    extraHTTPHeaders: {
      // Tell the server it's a CI request so it can skip rate-limiting if needed.
      "x-playwright-ci": "1",
      // Bypass Vercel Deployment Protection on preview deployments.
      // Set VERCEL_PROTECTION_BYPASS as a GitHub Actions secret when using a
      // protection-enabled preview URL as PLAYWRIGHT_BASE_URL.
      ...(process.env.VERCEL_PROTECTION_BYPASS
        ? { "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS }
        : {}),
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Allow pointing at a pre-installed Chromium when the managed browser
        // download is unavailable (e.g. sandboxed CI). No-op when unset.
        ...(process.env.PW_CHROMIUM_PATH
          ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } }
          : {}),
      },
    },
  ],
});
