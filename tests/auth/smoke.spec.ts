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

    const signUpLink = page.locator('a[href="/register"]').filter({ hasText: /sign up/i }).first();
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", "/register");
  });

  test("/register links to /login", async ({ page }) => {
    await page.goto("/register");

    const signInLink = page.locator('a[href="/login"]').filter({ hasText: /sign in/i }).first();
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute("href", "/login");
  });

  // --- NOVOS TESTES DE REGRESSÃO: RESET E PRO ONBOARDING ---

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
    // Garante que a tag main renderizou corretamente sem quebrar
    await expect(page.locator('main')).toBeVisible();
  });

  test("/pro/dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/pro/dashboard");
    
    // Verifica o client auth gate (deve redirecionar para o login passando a rota de origem no query param)
    await expect(page).toHaveURL(/.*\/login\?redirect=.*pro.*dashboard/i);
  });
});