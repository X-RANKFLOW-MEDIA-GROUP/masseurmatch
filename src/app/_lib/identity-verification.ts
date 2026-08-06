import "server-only";

import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export type CanonicalIdentityStatus =
  | "not_started"
  | "pending"
  | "processing"
  | "requires_input"
  | "failed"
  | "canceled"
  | "verified";

export function normalizeIdentityStatus(value: unknown): CanonicalIdentityStatus {
  const status = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (status === "verified") return "verified";
  if (status === "pending") return "pending";
  if (status === "processing") return "processing";
  if (status === "requires_input") return "requires_input";
  if (status === "failed") return "failed";
  if (status === "canceled" || status === "cancelled") return "canceled";
  return "not_started";
}

export function isIdentityVerified(status: unknown): boolean {
  return normalizeIdentityStatus(status) === "verified";
}

export async function getCanonicalIdentityStatusForUser(
  userId: string | null | undefined,
): Promise<CanonicalIdentityStatus> {
  if (!userId) return "not_started";

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("identity_verifications")
      .select("status,created_at,updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[identity-verification] Failed to read latest verification status.");
      return "not_started";
    }

    return normalizeIdentityStatus(data?.status);
  } catch {
    console.error("[identity-verification] Verification lookup unavailable.");
    return "not_started";
  }
}

export async function getCanonicalIdentityStatusForProfile(
  profileId: string | null | undefined,
): Promise<CanonicalIdentityStatus> {
  if (!profileId) return "not_started";

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("user_id")
      .eq("id", profileId)
      .maybeSingle();

    if (error || !data?.user_id) {
      if (error) console.error("[identity-verification] Failed to resolve profile owner.");
      return "not_started";
    }

    return getCanonicalIdentityStatusForUser(data.user_id);
  } catch {
    console.error("[identity-verification] Profile verification lookup unavailable.");
    return "not_started";
  }
}
