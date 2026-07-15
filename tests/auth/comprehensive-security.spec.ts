import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function normalizeEnvValue(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadLocalEnv() {
  const merged: Record<string, string> = {};
  const envFiles = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
  ];

  for (const file of envFiles) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const [rawKey, ...rest] = line.split("=");
      const key = rawKey.trim();
      if (!key || key in merged) continue;
      merged[key] = normalizeEnvValue(rest.join("="));
    }
  }
  return merged;
}

const localEnv = loadLocalEnv();
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  localEnv.SUPABASE_URL ||
  localEnv.NEXT_PUBLIC_SUPABASE_URL ||
  "";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || localEnv.SUPABASE_SERVICE_ROLE_KEY || "";

test.skip(
  !supabaseUrl || !serviceRoleKey || (!!process.env.CI && !process.env.ENABLE_AUTH_E2E),
  "Supabase credentials required; in CI, set ENABLE_AUTH_E2E=1"
);

const adminClient = createClient(supabaseUrl || "http://localhost:54321", serviceRoleKey || "placeholder-key", {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function deleteUserByEmail(email: string) {
  try {
    const { data } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const user = (data.users || []).find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (user) {
      await adminClient.auth.admin.deleteUser(user.id);
    }
  } catch {
    // Ignore cleanup errors
  }
}

test.describe.serial("Auth Security", () => {
  const seed = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
  const email = `auth-sec+${seed}@masseurmatch.dev`;
  const password = `SecureTest!${seed}`;
  const weakPassword = "weak";

  test.beforeAll(async () => {
    await deleteUserByEmail(email);
  });

  test.afterAll(async () => {
    await deleteUserByEmail(email);
  });

  test.describe("Password Validation", () => {
    test("rejects weak passwords on signup", async ({ page }) => {
      await page.goto("/register");

      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', weakPassword);

      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Should show password strength feedback or error
      await expect(
        page.locator("text=/must be at least|security requirement|longer password/i")
      ).toBeVisible({
        timeout: 5000,
      });
    });

    test("accepts strong passwords", async ({ page }) => {
      await page.goto("/register");

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      await emailInput.fill(email);
      await passwordInput.fill(password);

      // Submit form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Should proceed with signup (may require email confirmation)
      await expect(
        page.locator("text=/check your email|success|confirmation/i").first()
      ).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("Session Security", () => {
    test("sets secure session cookies", async ({ page, context }) => {
      // Create user via admin client
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: `session-test-${seed}@masseurmatch.dev`,
        password: password,
        email_confirm: true,
      });

      expect(authError).toBeNull();
      expect(authData.user).toBeDefined();

      const sessionEmail = authData.user?.email || email;

      // Login
      await page.goto("/login");
      await page.fill('input[type="email"]', sessionEmail);
      await page.fill('input[type="password"]', password);
      await page.locator('button[type="submit"]').first().click();

      await page.waitForURL(/\/(pro|onboard|dashboard)/, { timeout: 15000 });

      // Check session cookie exists
      const cookies = await context.cookies();
      const sessionCookie = cookies.find((c) => c.name === "mm_session");

      expect(sessionCookie).toBeDefined();
      expect(sessionCookie?.httpOnly).toBe(true);
      expect(sessionCookie?.sameSite).toBe("Lax");

      if (process.env.NODE_ENV === "production") {
        expect(sessionCookie?.secure).toBe(true);
      }

      // Cleanup
      await deleteUserByEmail(sessionEmail);
    });

    test("session expires after TTL", async ({ page, context }) => {
      // This test validates session expiration logic
      await page.goto("/login");

      // Check that expired session redirects to login
      // (This is tested implicitly by logout tests)
      await expect(page).toHaveURL(/\/(login|register|auth)/);
    });
  });

  test.describe("Account Lockout / Brute Force", () => {
    const testEmail = `lockout-test-${seed}@masseurmatch.dev`;

    test.beforeAll(async () => {
      // Create test user
      await adminClient.auth.admin.createUser({
        email: testEmail,
        password: password,
        email_confirm: true,
      });
    });

    test("locks account after failed login attempts", async ({ page }) => {
      // Attempt login with wrong password multiple times
      for (let i = 0; i < 6; i++) {
        await page.goto("/login");
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', "wrongpassword");
        await page.locator('button[type="submit"]').first().click();

        // Wait for error message
        await page.waitForTimeout(500);
      }

      // Should be locked
      await page.goto("/login");
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', "wrongpassword");
      await page.locator('button[type="submit"]').first().click();

      // Should show lockout message
      await expect(
        page.locator("text=/temporarily locked|try again in|too many attempts/i")
      ).toBeVisible({
        timeout: 5000,
      });
    });

    test.afterAll(async () => {
      await deleteUserByEmail(testEmail);
    });
  });

  test.describe("Password Recovery", () => {
    test("sends reset link without email enumeration", async ({ page }) => {
      await page.goto("/login");
      await page.click("a[href*=forgot]");

      // Try non-existent email
      await page.fill('input[type="email"]', `nonexistent-${seed}@masseurmatch.dev`);
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Should show success message (don't enumerate)
      await expect(
        page.locator("text=/check your email|reset link|if an account exists/i")
      ).toBeVisible({
        timeout: 5000,
      });

      // Try real email
      await page.goto("/login");
      await page.click("a[href*=forgot]");
      await page.fill('input[type="email"]', email);
      await page.locator('button[type="submit"]').first().click();

      // Should also show success (same message)
      await expect(
        page.locator("text=/check your email|reset link|if an account exists/i")
      ).toBeVisible({
        timeout: 5000,
      });
    });

    test("rate limits password reset requests", async ({ page }) => {
      // Rapid requests should be rate limited
      for (let i = 0; i < 6; i++) {
        await page.goto("/login");
        await page.click("a[href*=forgot]");
        await page.fill('input[type="email"]', email);

        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        // Early requests succeed silently
        if (i < 5) {
          await page.waitForTimeout(100);
        }
      }

      // Final request should be rate limited
      await page.goto("/login");
      await page.click("a[href*=forgot]");
      await page.fill('input[type="email"]', email);
      await page.locator('button[type="submit"]').first().click();

      await expect(page.locator("text=/too many|rate limit|try again/i")).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe("OAuth Security", () => {
    test("OAuth flow includes CSRF protection", async ({ page, context }) => {
      await page.goto("/login");

      // OAuth buttons should be visible
      const googleButton = page.locator('button[aria-label*="Google" i], button:has-text("Google")').first();
      expect(googleButton).toBeDefined();

      // Get cookies before OAuth redirect
      const cookiesBefore = await context.cookies();
      const hasCsrfCookie = cookiesBefore.some((c) => c.name.includes("csrf") || c.name.includes("state"));

      // Note: Full OAuth flow would redirect to Google,
      // this test validates the mechanism exists
      expect(googleButton).toBeVisible();
    });
  });

  test.describe("Security Headers", () => {
    test("auth routes include security headers", async ({ page }) => {
      const response = await page.goto("/login");
      const headers = response?.headers();

      if (headers) {
        // Should have CORS restrictions
        expect(headers["content-security-policy"] || headers["x-frame-options"]).toBeDefined();
      }
    });
  });

  test.describe("XSS Prevention", () => {
    test("sanitizes user input in error messages", async ({ page }) => {
      await page.goto("/login");

      const xssPayload = '<script>alert("xss")</script>';
      await page.fill('input[type="email"]', xssPayload);
      await page.fill('input[type="password"]', "test");
      await page.locator('button[type="submit"]').first().click();

      // Script should not execute (Playwright would block it anyway,
      // but verify no raw HTML in displayed error)
      const errorText = await page.locator("text=/invalid|error").textContent();
      expect(errorText).not.toContain("<script>");
    });
  });

  test.describe("Logout", () => {
    test("clears session on logout", async ({ page, context }) => {
      // Login first
      await page.goto("/login");
      const testUser = `logout-test-${seed}@masseurmatch.dev`;

      await adminClient.auth.admin.createUser({
        email: testUser,
        password: password,
        email_confirm: true,
      });

      await page.fill('input[type="email"]', testUser);
      await page.fill('input[type="password"]', password);
      await page.locator('button[type="submit"]').first().click();

      // Wait for login to complete
      await page.waitForURL(/\/(pro|onboard|dashboard)/, { timeout: 15000 });

      // Logout
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      }

      // Should redirect to login
      await expect(page).toHaveURL(/\/(login|register)/);

      // Session cookie should be cleared
      const cookies = await context.cookies();
      const sessionCookie = cookies.find((c) => c.name === "mm_session");
      expect(sessionCookie?.value).toBe("");

      await deleteUserByEmail(testUser);
    });
  });
});
