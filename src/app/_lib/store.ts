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
  "id, user_id, slug, display_name, full_name, bio, city, state, phone, specialties, incall_price, outcall_price, height_inches, weight_lb, body_type, status, is_active, updated_at";

const AVAILABLE_NOW_SELECT =
  "id, _tier, available_now, available_now_expires, available_now_activations_today, available_now_last_activation, available_now_day_start";

export type AvailableNowProfile = {
  id: string;
  _tier: string | null;
  available_now: boolean | null;
  available_now_expires: string | null;
  available_now_activations_today: number | null;
  available_now_last_activation: string | null;
  available_now_day_start: string | null;
};

export { createSupabaseAdminClient, createSupabasePublicClient, getUserRole, recordAuditLog };

export async function getProfileByUserId(userId: string) {
  const adminClient = createSupabaseAdminClient();
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

export async function getAvailableNowProfile(userId: string): Promise<AvailableNowProfile | null> {
  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("profiles")
    .select(AVAILABLE_NOW_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new RouteError(500, error.message);
  }

  return data as AvailableNowProfile | null;
}

export async function setAvailableNow(
  userId: string,
  fields: Partial<{
    available_now: boolean;
    available_now_expires: string | null;
    available_now_activations_today: number;
    available_now_last_activation: string;
    available_now_day_start: string;
  }>,
): Promise<void> {
  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) {
    throw new RouteError(500, error.message);
  }
}

export async function updateProfileByUserId(userId: string, updates: ProfileUpdate) {
  const adminClient = createSupabaseAdminClient();
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
