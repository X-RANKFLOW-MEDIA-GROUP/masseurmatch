import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

/**
 * Profile fields accepted during signup submission and resubmission.
 * All fields are optional — only provided values are written to the database.
 */
export interface SubmittedProfile {
  displayName?: string;
  fullName?: string;
  bio?: string;
  city?: string;
  state?: string;
  phone?: string;
  specialties?: string[];
  incallPrice?: number | string | null;
  outcallPrice?: number | string | null;
}

/**
 * Persists the submitted therapist profile data to Supabase and sets the
 * profile status to `pending_approval` so it enters the moderation queue.
 *
 * @param userId  The authenticated user's ID from the session cookie.
 * @param profile The profile data submitted by the therapist.
 * @param planTier Optional plan tier selected during sign-up (maps to the `_tier` column).
 * @returns An error message string if the update failed, or `null` on success.
 */
export async function persistSubmittedProfile(
  userId: string,
  profile: SubmittedProfile,
  planTier?: string,
): Promise<string | null> {
  const adminClient = createSupabaseAdminClient();

  const profileUpdate: Record<string, unknown> = {
    status: "pending_approval",
    is_active: false,
    updated_at: new Date().toISOString(),
  };

  if (profile.displayName || profile.fullName) {
    profileUpdate.display_name = profile.displayName || profile.fullName;
  }
  if (profile.fullName) {
    profileUpdate.full_name = profile.fullName;
  }
  if (profile.bio) {
    profileUpdate.bio = profile.bio;
  }
  if (profile.city) {
    profileUpdate.city = profile.city;
  }
  if (profile.state) {
    profileUpdate.state = profile.state;
  }
  if (profile.phone) {
    profileUpdate.phone = profile.phone;
  }
  if (Array.isArray(profile.specialties)) {
    profileUpdate.specialties = profile.specialties;
  }
  if (profile.incallPrice != null) {
    profileUpdate.incall_price = Number(profile.incallPrice);
  }
  if (profile.outcallPrice != null) {
    profileUpdate.outcall_price = Number(profile.outcallPrice);
  }
  // _tier is the actual column name in the profiles table
  if (planTier) {
    profileUpdate._tier = planTier;
  }

  const { error } = await adminClient
    .from("profiles")
    .update(profileUpdate)
    .eq("user_id", userId);

  if (error) {
    return error.message;
  }

  return null;
}
