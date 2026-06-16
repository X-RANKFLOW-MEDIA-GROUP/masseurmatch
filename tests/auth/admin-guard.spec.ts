import { test, expect } from "@playwright/test";

/**
 * Admin route protection tests — verifies that admin pages and API endpoints
 * reject unauthenticated access. The /admin page should redirect to login,
 * and all /api/admin/* endpoints should return 401.
 *
 * No test credentials are required; these run as an anonymous visitor.
 * Run: npx playwright test tests/auth/admin-guard.spec.ts
 */

test.describe("Admin route protection", () => {
  test("/admin redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin");

    // Verifies the auth gate redirects to login with the admin route in the query string.
    await expect(page).toHaveURL(/.*\/login\?redirect=.*admin/i);
  });

  test("/api/admin/stats returns 401 for unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.get("/api/admin/stats");

    expect(response.status()).toBe(401);
  });

  test("/api/admin/verification returns 401 for unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.get("/api/admin/verification");

    expect(response.status()).toBe(401);
  });

  test("/api/admin/approvals returns 401 for unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.get("/api/admin/approvals");

    expect(response.status()).toBe(401);
  });
});
