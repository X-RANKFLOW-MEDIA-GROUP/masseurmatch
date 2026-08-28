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
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  localEnv.SUPABASE_SERVICE_ROLE_KEY ||
  "";

// In CI, the global workflow env exposes SUPABASE_SERVICE_ROLE_KEY, which
// would cause these full-registration tests to run against the live database
// without proper test-environment isolation. Require an explicit opt-in flag.
test.skip(
  !supabaseUrl || !serviceRoleKey || (!!process.env.CI && !process.env.ENABLE_AUTH_E2E),
  "Supabase service-role credentials are required. In CI, also set ENABLE_AUTH_E2E=1.",
);

const adminClient = createClient(supabaseUrl || "http://localhost:54321", serviceRoleKey || "placeholder-key", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const { data, error } = await adminClient
    .from("users")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id || !data?.email) {
    return null;
  }

  return {
    id: data.id as string,
    email: data.email as string,
  };
}

async function deleteUserByEmail(email: string) {
  const user = await findUserByEmail(email);
  if (!user) return;

  await adminClient.auth.admin.deleteUser(user.id);
}

test.describe.serial("Auth launch flow", () => {
  const seed = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
  const email = `launch-e2e+${seed}@masseurmatch.dev`;
  const password = `Launch!${seed}`;
  const fullName = "Launch E2E Provider";
  let createdUserId: string | null = null;

  test.afterAll(async () => {
    await deleteUserByEmail(email);
  });

  test("register provisions auth user, profile, and provider role", async ({ page }) => {
    test.slow();

    await page.goto("/register");

    // Labels are "Full name *", "Email *", "Phone *", "Password *" and
    // "Confirm password *". /^password/i must stay anchored so it does not
    // also match "Confirm password".
    await page.getByLabel(/full name/i).fill(fullName);
    await page.getByLabel(/^email/i).fill(email);
    await page.getByLabel(/^phone/i).fill("5551112222");
    await page.getByLabel(/^password/i).fill(password);
    await page.getByLabel(/confirm password/i).fill(password);
    await page.getByRole("checkbox", { name: /i agree to the terms of service/i }).check();
    await page.getByRole("checkbox", { name: /i acknowledge the therapist agreement/i }).check();
    // All three attestations are required; without this one the form refuses to
    // submit with "Accept the required account terms to continue."
    await page.getByRole("checkbox", { name: /i confirm i am at least 18/i }).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/signup\/verify$/, { timeout: 30_000 });

    await expect
      .poll(async () => {
        const match = await findUserByEmail(email);
        return match ? { id: match.id, email: match.email ?? null } : null;
      })
      .toEqual(
        expect.objectContaining({
          email,
        }),
      );

    createdUserId = (await findUserByEmail(email))?.id ?? null;
    expect(createdUserId).toBeTruthy();

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("user_id, full_name, status, profile_status, visibility_status")
      .eq("user_id", createdUserId!)
      .maybeSingle();

    expect(profileError).toBeNull();
    // These are the values ensureUserProfileAndRole actually writes. The
    // profile must not be publicly visible before moderation.
    expect(profile).toEqual(
      expect.objectContaining({
        user_id: createdUserId,
        full_name: fullName,
        status: "pending",
        profile_status: "draft",
        visibility_status: "hidden",
      }),
    );

    const { data: roles, error: rolesError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", createdUserId!);

    expect(rolesError).toBeNull();
    expect(roles?.some((entry) => entry.role === "provider")).toBeTruthy();

    // Email confirmation is mandatory on this project (mailer_autoconfirm is
    // false), so registration deliberately ends WITHOUT a session — asserting a
    // session cookie here would assert the wrong product behaviour. What must
    // hold is that /signup/verify explains the wait instead of bouncing the new
    // account back to the account form, where re-submitting only fails with
    // "an account with this email already exists".
    await expect(
      page.getByRole("heading", { name: /confirm your email to continue/i }),
    ).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    // Confirm the address the way clicking the emailed link would. Without
    // this the account stays unconfirmed and every later test in this serial
    // suite fails at sign-in with "Email not confirmed" — there is no inbox
    // here to click through.
    const { error: confirmError } = await adminClient.auth.admin.updateUserById(
      createdUserId!,
      { email_confirm: true },
    );
    expect(confirmError).toBeNull();
  });

  test("login succeeds but signup submit still rejects fake verification claims", async ({ page }) => {
    test.slow();

    await page.goto("/pro/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fpro%2Fdashboard/);

    await page.getByLabel(/email address/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await expect(page).toHaveURL(/\/pro\/dashboard$/, { timeout: 30_000 });

    const submitAttempt = await page.evaluate(async () => {
      const response = await fetch("/api/signup/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planTier: "pro",
          profile: {
            fullName: "Launch E2E Provider",
            displayName: "Launch E2E Provider",
            phone: "+1 555 111 2222",
            city: "Dallas",
            state: "TX",
            neighborhood: "Oak Lawn",
            bio: "Testing the launch signup flow with a long enough professional bio for validation.",
            serviceCategories: ["Deep Tissue"],
            sessionLengths: ["60 min"],
            startingPrice: "180",
            yearsExperience: "5",
          },
          verification: {
            emailVerified: true,
            identityVerificationStatus: "verified",
          },
          termsAccepted: true,
          complianceAcknowledged: true,
        }),
      });

      return {
        status: response.status,
        body: await response.json().catch(() => ({})),
      };
    });

    expect(submitAttempt.status).toBe(400);
    expect(String(submitAttempt.body.error || "")).toMatch(/identity verification/i);
  });

  test("authenticated provider can start identity verification", async ({ page }) => {
    test.slow();

    await page.goto("/login");

    await page.getByLabel(/email address/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await expect(page).toHaveURL(/\/pro\/dashboard$/, { timeout: 30_000 });

    const createSessionResult = await page.evaluate(async () => {
      const response = await fetch("/api/stripe/identity/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      return {
        status: response.status,
        body: await response.json().catch(() => ({})),
      };
    });

    test.skip(
      createSessionResult.status === 503 &&
        String(createSessionResult.body.error || "").includes("Stripe Identity is not configured"),
      "Stripe Identity E2E requires a valid STRIPE_SECRET_KEY.",
    );

    expect(createSessionResult.status).toBe(200);
    expect(createSessionResult.body.sessionId).toBeTruthy();
    expect(createSessionResult.body.url).toContain("stripe");

    const { data: identityRow, error: identityError } = await adminClient
      .from("identity_verifications")
      .select("user_id, stripe_session_id, status")
      .eq("user_id", createdUserId!)
      .maybeSingle();

    expect(identityError).toBeNull();
    expect(identityRow).toEqual(
      expect.objectContaining({
        user_id: createdUserId,
        stripe_session_id: createSessionResult.body.sessionId,
        status: "pending",
      }),
    );
  });
});
