import { RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  createSupabasePublicClient,
  getUserRole,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const PROFILE_SELECT =
  "id, user_id, slug, display_name, full_name, bio, city, state, phone, specialties, incall_price, outcall_price, status, is_active, updated_at";

export { createSupabaseAdminClient, createSupabasePublicClient, getUserRole, recordAuditLog };

export async function getProfileByUserId(userId: string) {
  const adminClient = createSupabaseAdminClient() as any;
  const { data, error } = await adminClient
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new RouteError(500, error.message);
  }

  return data;
}

export async function updateProfileByUserId(userId: string, updates: ProfileUpdate) {
  const adminClient = createSupabaseAdminClient() as any;
  const { data, error } = await adminClient
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (error) {
    throw new RouteError(500, error.message);
  }

  return data;
}
