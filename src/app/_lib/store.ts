import { RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  createSupabasePublicClient,
  getUserRole,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Full list of fields aligned with the new schema and directory requirements
const PROFILE_SELECT = `
  id, user_id, slug, display_name, full_name, headline, bio, city, state, neighborhood, 
  phone, whatsapp_number, email_address, website,
  service_categories, massage_techniques, specialties,
  incall_price, outcall_price, starting_price,
  height_inches, weight_lb, body_type,
  offers_incall, offers_outcall, outcall_radius,
  years_experience, languages,
  profile_status, visibility_status, verification_status,
  subscription_tier, is_featured, is_suspended, is_banned,
  stripe_customer_id, stripe_subscription_id, current_period_end,
  photo_limit, visibility_level, featured_until,
  promotions, seo_title, seo_description, seo_keywords,
  updated_at, created_at
`;

const AVAILABLE_NOW_SELECT = "id, subscription_tier, _tier, available_now, available_now_expires";


const LEGACY_PROFILE_SELECT = `
  id, user_id, slug, display_name, full_name, headline, bio, city, state, neighborhood, 
  phone, whatsapp_number, email_address, website,
  service_categories, massage_techniques, specialties,
  incall_price, outcall_price, starting_price,
  height_inches, weight_lb, body_type,
  offers_incall, offers_outcall, outcall_radius,
  years_experience, languages,
  subscription_tier, is_featured, is_suspended, is_banned,
  stripe_customer_id, stripe_subscription_id, current_period_end,
  photo_limit, visibility_level, featured_until,
  promotions, seo_title, seo_description, seo_keywords,
  updated_at, created_at
`;

function isMissingProfileStatus(errorMessage: string): boolean {
  return /column\s+profiles\.profile_status\s+does not exist/i.test(errorMessage);
}

export type AvailableNowProfile = {
  id: string;
  subscription_tier: string | null;
  _tier: string | null;
  available_now: boolean | null;
  available_now_expires: string | null;
};

export { createSupabaseAdminClient, createSupabasePublicClient, getUserRole, recordAuditLog };

export async function getProfileByUserId(userId: string) {
  const adminClient = createSupabaseAdminClient();
  let query = await adminClient
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (query.error && isMissingProfileStatus(query.error.message)) {
    query = await adminClient
      .from("profiles")
      .select(LEGACY_PROFILE_SELECT)
      .eq("user_id", userId)
      .maybeSingle();
  }

  if (query.error) {
    throw new RouteError(500, query.error.message);
  }

  return query.data;
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
  let query = await adminClient
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (query.error && isMissingProfileStatus(query.error.message)) {
    query = await adminClient
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select(LEGACY_PROFILE_SELECT)
      .maybeSingle();
  }

  if (query.error) {
    throw new RouteError(500, query.error.message);
  }

  return query.data;
}

export async function getSiteSettings() {
  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("site_settings")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();

  if (error) {
    throw new RouteError(500, error.message);
  }

  return data;
}
