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
  "id, user_id, slug, display_name, full_name, headline, bio, city, state, neighborhood, location_description, phone, booking_link, whatsapp_number, telegram_handle, specialties, languages, massage_techniques, incall_price, outcall_price, offers_incall, offers_outcall, outcall_radius, travel_note, travel_cities, seo_title, seo_description, seo_keywords, height_inches, weight_lb, body_type, status, is_active, updated_at";

const AVAILABLE_NOW_SELECT = "id, _tier, available_now, available_now_expires";

export type AvailableNowProfile = {
  id: string;
  _tier: string | null;
  available_now: boolean | null;
  available_now_expires: string | null;
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
