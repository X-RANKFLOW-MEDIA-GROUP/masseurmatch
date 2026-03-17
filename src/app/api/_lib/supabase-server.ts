import {
  createClient,
  type User,
} from "@supabase/supabase-js";

import { envAny } from "@/app/api/_lib/env";
import { RouteError } from "@/app/api/_lib/http";
import { getRequestSession, type RequestSession } from "@/app/api/_lib/session";
import type { Database, Json } from "@/integrations/supabase/types";

type AppRole = "admin" | "provider";

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

export function createSupabasePublicClient(): any {
  const url = getSupabaseUrl();
  const anonKey = getAnonKey();
  assertConfig(url, "SUPABASE_URL");
  assertConfig(anonKey, "SUPABASE_ANON_KEY");

  return createClient<Database>(url, anonKey, baseOptions());
}

export function createSupabaseAdminClient(): any {
  const url = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();
  assertConfig(url, "SUPABASE_URL");
  assertConfig(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");

  return createClient<Database>(url, serviceRoleKey, baseOptions());
}

export async function getUserRole(userId: string): Promise<AppRole | null> {
  const adminClient = createSupabaseAdminClient();
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

  const roleRow = data as { role: AppRole } | null;
  return roleRow?.role ?? null;
}

export async function requireSession(request: Request): Promise<RequestSession> {
  const session = getRequestSession(request);

  if (!session) {
    throw new RouteError(401, "Authentication required.");
  }

  return session;
}

export async function requireAdminSession(request: Request): Promise<RequestSession> {
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
    const adminClient = createSupabaseAdminClient() as any;
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
  const adminClient = createSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;

  while (page > 0) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 200,
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
    throw new RouteError(401, "Invalid email or password.");
  }

  return data;
}

export async function createTherapistUser(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const adminClient = createSupabaseAdminClient();

  const { data, error } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
    },
  });

  if (error || !data.user) {
    throw new RouteError(400, error?.message ?? "Could not create user.");
  }

  const serviceClient = adminClient as any;

  const existingProfile = await serviceClient
    .from("profiles")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!existingProfile.data) {
    const { error: profileError } = await serviceClient.from("profiles").insert({
      user_id: data.user.id,
      full_name: input.fullName,
      display_name: input.fullName,
      status: "draft",
      is_active: false,
      contact_methods: [],
      share_email: false,
    });

    if (profileError) {
      throw new RouteError(500, profileError.message);
    }
  }

  const currentRole = await getUserRole(data.user.id);
  if (!currentRole) {
    const { error: roleError } = await serviceClient.from("user_roles").insert({
      user_id: data.user.id,
      role: "provider",
    });

    if (roleError) {
      throw new RouteError(500, roleError.message);
    }
  }

  return {
    user: data.user,
    role: "provider" as const,
  };
}

export async function updateSubscriptionTier(
  userId: string,
  tier: "free" | "standard" | "pro" | "elite",
) {
  const adminClient = createSupabaseAdminClient() as any;

  const { error } = await adminClient
    .from("profiles")
    .update({ _tier: tier })
    .eq("user_id", userId);

  if (error) {
    throw new RouteError(500, error.message);
  }

  return {
    userId,
    tier,
  };
}
