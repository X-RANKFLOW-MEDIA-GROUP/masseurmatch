import { RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  createSupabasePublicClient,
  getUserRole,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

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
  current_status, service_radius_km, travel_destination,
  promotions, seo_title, seo_description, seo_keywords,
  travel_schedule,
  updated_at, created_at
`;

const AVAILABLE_NOW_SELECT = "id, subscription_tier, available_now, available_now_expires";

export type AvailableNowProfile = {
  id: string;
  subscription_tier: string | null;
  available_now: boolean | null;
  available_now_expires: string | null;
};

export { createSupabaseAdminClient, createSupabasePublicClient, getUserRole, recordAuditLog };

async function syncTherapistProfileRuntime(userId: string) {
  try {
    const adminClient = createSupabaseAdminClient();

    const { data: profile } = await adminClient
      .from("profiles")
      .select("id,user_id,slug,display_name,full_name,headline,bio,city,state,phone,email_address,visibility_status,profile_status")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile?.id) {
      return;
    }

    const payload = {
      profile_id: profile.id,
      user_id: profile.user_id,
      slug: profile.slug || profile.id,
      display_name: profile.display_name || profile.full_name || "Therapist",
      headline: profile.headline || null,
      bio: profile.bio || null,
      city: profile.city || "Unlisted",
      state: profile.state || null,
      contact_email: profile.email_address || null,
      phone: profile.phone || null,
      is_published:
        profile.visibility_status === "public" && profile.profile_status === "approved",
      moderation_status:
        profile.profile_status === "approved" ? "approved" : "draft",
      updated_at: new Date().toISOString(),
    };

    await adminClient
      .from("therapist_profiles")
      .upsert(payload, { onConflict: "profile_id" });
  } catch {
    // best effort runtime sync
  }
}

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

  await syncTherapistProfileRuntime(userId);
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

  await syncTherapistProfileRuntime(userId);

  return data;
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
