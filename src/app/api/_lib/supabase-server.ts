import {
  createClient,
  type User,
} from "@supabase/supabase-js";

import { envAny } from "@/app/api/_lib/env";
import { RouteError } from "@/app/api/_lib/http";
import { getRequestSession, type RequestSession } from "@/app/api/_lib/session";
import { notifyAdmin } from "@/app/api/_lib/admin-notify";
import type { Database, Json } from "@/integrations/supabase/types";

export type AppRole = "admin" | "provider" | "client";

function normalizeAppRole(role: unknown): AppRole | null {
  if (role === "admin") return "admin";
  if (role === "provider" || role === "therapist" || role === "masseur") return "provider";
  if (role === "client") return "client";
  return null;
}

function getSupabaseUrl() {
  return envAny(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"]);
}

function getAnonKey() {
  return envAny(["SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"]);
}

function getServiceRoleKey() {
  return envAny(["SUPABASE_SERVICE_ROLE_KEY"]);
}

function assertConfig(value: string, label: string) {
  if (!value) {
    throw new RouteError(500, `${label} is not configured.`);
  }
}

function baseOptions() {
  return {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  };
}

// Scoped alias for webhook handlers — service-role but clearly labelled so it
// is never accidentally used in user-facing request paths.
export function createSupabaseWebhookClient() {
  return createSupabaseAdminClient();
}

// Validates the incoming request has an active admin session, then returns both
// the service-role client and the verified session together so callers cannot
// accidentally skip the auth gate.
export async function requireAdminClient(
  request: Request | { headers: { get: (name: string) => string | null } },
): Promise<{ client: ReturnType<typeof createSupabaseAdminClient>; session: RequestSession }> {
  const session = await requireAdminSession(request);
  return { client: createSupabaseAdminClient(), session };
}

export function createSupabasePublicClient() {
  const url = getSupabaseUrl();
  const anonKey = getAnonKey();
  assertConfig(url, "SUPABASE_URL");
  assertConfig(anonKey, "SUPABASE_ANON_KEY");

  return createClient<Database>(url, anonKey, baseOptions());
}

export function createSupabaseWebhookAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();
  assertConfig(url, "SUPABASE_URL");
  assertConfig(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");

  return createClient<Database>(url, serviceRoleKey, baseOptions());
}

export function createSupabaseAdminDashboardClient(session: RequestSession) {
  if (session.role !== "admin") {
    throw new RouteError(403, "Admin access required.");
  }

  const url = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();
  assertConfig(url, "SUPABASE_URL");
  assertConfig(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");

  return createClient<Database>(url, serviceRoleKey, {
    ...baseOptions(),
    global: {
      headers: {
        "x-admin-user-id": session.userId,
      },
    },
  });
}

/**
 * @deprecated Prefer createSupabaseWebhookAdminClient for webhooks/background
 * jobs and createSupabaseAdminDashboardClient(session) for admin routes.
 */
export function createSupabaseAdminClient() {
  return createSupabaseWebhookAdminClient();
}

export async function getUserRole(userId: string): Promise<AppRole | null> {
  const adminClient = createSupabaseWebhookAdminClient();
  const { data, error } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new RouteError(500, error.message);
  }

  return normalizeAppRole(data?.role);
}

export async function requireSession(request: Request | { headers: { get: (name: string) => string | null } }): Promise<RequestSession> {
  const session = await getRequestSession(request as Request);

  if (!session) {
    throw new RouteError(401, "Authentication required.");
  }

  return session;
}

export async function requireAdminSession(request: Request | { headers: { get: (name: string) => string | null } }): Promise<RequestSession> {
  const session = await requireSession(request);
  const role = await getUserRole(session.userId);

  if (role !== "admin") {
    throw new RouteError(403, "Admin access required.");
  }

  return {
    ...session,
    role,
  };
}

export async function recordAuditLog(
  adminUserId: string,
  action: string,
  targetType: string,
  targetId?: string,
  details?: Json,
) {
  try {
    const adminClient = createSupabaseWebhookAdminClient();
    await adminClient.from("audit_log").insert({
      admin_user_id: adminUserId,
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      details: details ?? null,
    });
  } catch {
    // Best-effort logging for local and partially configured environments.
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const adminClient = createSupabaseWebhookAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;

  while (page > 0) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 20,
    });

    if (error) {
      throw new RouteError(500, error.message);
    }

    const users = Array.isArray(data.users) ? (data.users as User[]) : [];
    const match = users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail) ?? null;

    if (match) {
      return match;
    }

    page = "nextPage" in data ? data.nextPage ?? 0 : 0;
  }

  return null;
}

export async function verifyPassword(email: string, password: string) {
  const publicClient = createSupabasePublicClient();
  const { data, error } = await publicClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    const authError = error?.message?.toLowerCase() ?? "";
    if (authError.includes("email not confirmed")) {
      throw new RouteError(401, "Check your email to confirm your account before continuing.", "EMAIL_NOT_CONFIRMED");
    }
    throw new RouteError(401, "Invalid email or password.");
  }

  return data;
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function verifyPasswordWithRetry(email: string, password: string, attempts = 1) {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await verifyPassword(email, password);
    } catch (error) {
      lastError = error;

      if (attempt < attempts - 1) {
        await wait(500 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function deriveUserDisplayName(user: User, fallbackName?: string) {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const candidates = [
    fallbackName,
    typeof metadata?.full_name === "string" ? metadata.full_name : null,
    typeof metadata?.name === "string" ? metadata.name : null,
    user.email?.split("@")[0],
    user.phone,
    "User",
  ];

  for (const candidate of candidates) {
    const normalized = candidate?.trim();
    if (normalized) {
      return normalized;
    }
  }

  return "User";
}

export async function ensureUserProfileAndRole(
  user: User,
  options: {
    defaultRole?: AppRole;
    fallbackName?: string;
  } = {},
) {
  const adminClient = createSupabaseWebhookAdminClient();
  const defaultRole = options.defaultRole ?? "provider";
  const fullName = deriveUserDisplayName(user, options.fallbackName);

  const { data: existingProfile, error: existingProfileError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw new RouteError(500, existingProfileError.message);
  }

  let profileCreated = false;
  if (!existingProfile) {
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: user.id,
      user_id: user.id,
      email: user.email ?? null,
      email_address: user.email ?? null,
      full_name: fullName,
      display_name: fullName,
      role: defaultRole,
      status: "pending",
      profile_status: "draft",
      visibility_status: "hidden",
      subscription_tier: "free",
      _tier: "free",
    });

    if (profileError) {
      throw new RouteError(500, profileError.message);
    }

    profileCreated = true;
  }

  let role = await getUserRole(user.id);
  if (!role) {
    const { error: roleError } = await adminClient.from("user_roles").insert({
      user_id: user.id,
      role: defaultRole,
    });

    if (roleError) {
      throw new RouteError(500, roleError.message);
    }

    role = defaultRole;
  }

  // Mirror the role into app_metadata (server-writable only) so the middleware
  // and route handlers can trust it for authorization without a DB round-trip.
  const currentMetaRole = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (currentMetaRole !== role) {
    try {
      await adminClient.auth.admin.updateUserById(user.id, {
        app_metadata: { ...(user.app_metadata ?? {}), role },
      });
    } catch {
      // Best-effort — user_roles remains the source of truth.
    }
  }

  if (user.email) {
    try {
      await adminClient.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: fullName,
          role,
        },
        { onConflict: "id" },
      );
    } catch {
      // Legacy public.users sync is best-effort only.
    }
  }

  // Notify the admin team the first time a profile is created for a user, so a
  // brand-new signup (email/password, social login, or admin-created) surfaces
  // in the admin inbox. Best-effort — never blocks account creation.
  if (profileCreated) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://masseurmatch.com";
    await notifyAdmin({
      subject: `New ${role} account: ${fullName}`,
      heading: "New account created",
      intro: `A new ${role} account was just created on MasseurMatch.`,
      fields: [
        { label: "Name", value: fullName },
        { label: "Email", value: user.email },
        { label: "Role", value: role },
        { label: "User ID", value: user.id },
      ],
      action: { label: "View in admin", url: `${appUrl}/admin/users` },
      replyTo: user.email ?? null,
    });
  }

  return {
    role,
    profileCreated,
    fullName,
  };
}

export async function createTherapistUser(input: {
  fullName: string;
  email: string;
  password: string;
  emailRedirectTo: string;
}) {
  const publicClient = createSupabasePublicClient();

  const signUpPayload: Parameters<typeof publicClient.auth.signUp>[0] = {
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: input.emailRedirectTo,
      data: {
        full_name: input.fullName,
        role: "provider",
      },
    },
  };

  const { data, error } = await publicClient.auth.signUp(signUpPayload);

  if (!error && data.user) {
    return {
      user: data.user,
      role: null,
      session: data.session ?? null,
    };
  }

  const canFallbackToAdminCreate =
    error?.message?.toLowerCase().includes("sending confirmation email") ||
    error?.message?.toLowerCase().includes("email");

  if (!canFallbackToAdminCreate) {
    throw new RouteError(400, error?.message || "Could not create account.");
  }

  const adminClient = createSupabaseAdminClient();
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
      role: "provider",
    },
  });

  if (createError || !created.user) {
    throw new RouteError(400, createError?.message || "Could not create account.");
  }

  await ensureUserProfileAndRole(created.user, {
    defaultRole: "provider",
    fallbackName: input.fullName,
  });

  const { data: sessionData, error: signInError } = await publicClient.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (signInError || !sessionData.session) {
    throw new RouteError(400, signInError?.message || "Could not create account session.");
  }

  return {
    user: created.user,
    role: null,
    session: sessionData.session,
  };
}
