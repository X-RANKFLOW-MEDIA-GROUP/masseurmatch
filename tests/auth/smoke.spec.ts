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

  test("/login shows forgot password link", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
  });

  test("/login links to /register", async ({ page }) => {
    await page.goto("/login");

    const signUpLink = page.getByRole("link", { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", "/register");
  });

  test("/register links to /login", async ({ page }) => {
    await page.goto("/register");

    const signInLink = page.getByRole("link", { name: /sign in/i });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute("href", "/login");
  });
});
