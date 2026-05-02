import { test, expect } from "@playwright/test";

/**
 * Auth page smoke tests — validates that auth pages render their key UI elements.
 * These tests do NOT perform actual login/signup (no test credentials required).
 * Run: npx playwright test tests/auth/smoke.spec.ts
 */

test.describe("Auth pages smoke", () => {
  test("/login renders sign-in form", async ({ page }) => {
    await page.goto("/login");

    // Page should load without 4xx/5xx
    await expect(page).not.toHaveURL(/\/(404|500)/);

    // Email field
    await expect(
      page.locator('input[type="email"], input[aria-label*="email" i]').first(),
    ).toBeVisible();

    // Password field
    await expect(
      page.locator('input[type="password"]').first(),
    ).toBeVisible();

    // Submit button
    await expect(
      page.locator('button[type="submit"]').first(),
    ).toBeVisible();
  });

  test("/register renders sign-up form", async ({ page }) => {
    await page.goto("/register");

    await expect(page).not.toHaveURL(/\/(404|500)/);

    // Email field
    await expect(
      page.locator('input[type="email"], input[aria-label*="email" i]').first(),
    ).toBeVisible();

    // Password field
    await expect(
      page.locator('input[type="password"]').first(),
    ).toBeVisible();

    // Submit button
    await expect(
      page.locator('button[type="submit"]').first(),
    ).toBeVisible();
  });

  test("auth pages do not expose legacy email OTP UI", async ({ page }) => {
    for (const route of ["/login", "/register"]) {
      await page.goto(route);

      await expect(page.getByText(/send otp|one-time password|verify & continue/i)).toHaveCount(0);
      await expect(page.locator('input[autocomplete="one-time-code"]')).toHaveCount(0);
      await expect(page.locator('button', { hasText: /otp/i })).toHaveCount(0);
    }
  });

  test("/login shows forgot password link", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
  });

  test("/login links to /register", async ({ page }) => {
    await page.goto("/login");

    const signUpLink = page.locator('a[href^="/register"]').filter({ hasText: /sign up/i }).first();
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", /\/register/);
  });

  test("/register links to /login", async ({ page }) => {
    await page.goto("/register");

    await expect(page).toHaveURL(/\/signup\/account/);
    const loginLink = page.locator('a[href="/login"]').filter({ hasText: /log in/i }).first();
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("/forgot-password renders reset form", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page).not.toHaveURL(/\/(404|500)/);

    // Email field
    await expect(
      page.locator('input[type="email"], input[aria-label*="email" i]').first(),
    ).toBeVisible();

    // Submit button
    await expect(
      page.locator('button[type="submit"]').first(),
    ).toBeVisible();
  });

  test("/pro/join renders marketing/join page for signed out users", async ({ page }) => {
    await page.goto("/pro/join");

    await expect(page).not.toHaveURL(/\/(404|500)/);
    // Ensures the main tag rendered correctly without breaking.
    await expect(page.locator("main")).toBeVisible();
  });

  test("/pro/dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/pro/dashboard");

    // Verifies the client auth gate redirects to login with the source route in the query string.
    await expect(page).toHaveURL(/.*\/login\?redirect=.*pro.*dashboard/i);
  });
});
