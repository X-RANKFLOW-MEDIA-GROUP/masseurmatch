export const dynamic = "force-dynamic";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";
import { getProfileCompletionAudit, normalizePhoneE164 } from "@/lib/messaging/profile-completion";

type DbClient = {
  from: (table: string) => any;
};

type Profile = Record<string, any> & {
  id: string;
  user_id: string | null;
  role: string | null;
  display_name: string | null;
  full_name: string | null;
};

type Preference = {
  user_id: string;
  phone_e164: string | null;
  imessage_profile_assistant_enabled: boolean | null;
  imessage_profile_assistant_consent_at: string | null;
  imessage_profile_assistant_consent_version: string | null;
  imessage_profile_assistant_opted_out_at: string | null;
};

const PROFILE_SELECT = [
  "id",
  "user_id",
  "role",
  "display_name",
  "full_name",
  "slug",
  "city",
  "state",
  "headline",
  "tagline",
  "bio",
  "phone",
  "phone_number",
  "whatsapp_number",
  "whatsapp",
  "languages",
  "languages_spoken",
  "massage_techniques",
  "modalities",
  "service_categories",
  "modality",
  "years_experience",
  "start_year",
  "offers_incall",
  "offers_outcall",
  "incall",
  "outcall",
  "incall_price",
  "outcall_price",
  "starting_price",
  "starting_rate",
  "price_min",
  "price_max",
  "pricing_sessions",
  "rates",
  "avatar_url",
  "photo_url",
  "is_demo",
  "is_active",
  "is_suspended",
  "is_banned",
  "created_at",
  "updated_at",
].join(",");

function profilePhone(profile: Profile) {
  return normalizePhoneE164(
    profile.phone || profile.phone_number || profile.whatsapp_number || profile.whatsapp,
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    // The generated Supabase schema can lag newly applied additive messaging migrations.
    // Keep this admin read endpoint on the runtime client shape so profile_id remains usable
    // without weakening or changing the database contract itself.
    const db = createSupabaseAdminClient() as unknown as DbClient;

    const profilesResult = await db
      .from("profiles")
      .select(PROFILE_SELECT)
      .in("role", ["provider", "admin"])
      .eq("is_demo", false)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (profilesResult.error) throw new RouteError(500, profilesResult.error.message);
    const profiles = (profilesResult.data || []) as Profile[];

    const userIds = profiles.map((profile) => profile.user_id).filter(Boolean) as string[];
    const profileIds = profiles.map((profile) => profile.id);

    const [preferencesResult, photosResult, contactsResult] = await Promise.all([
      userIds.length
        ? db
            .from("user_notification_preferences")
            .select(
              "user_id,phone_e164,imessage_profile_assistant_enabled,imessage_profile_assistant_consent_at,imessage_profile_assistant_consent_version,imessage_profile_assistant_opted_out_at",
            )
            .in("user_id", userIds)
        : Promise.resolve({ data: [], error: null }),
      profileIds.length
        ? db.from("profile_photos").select("profile_id").in("profile_id", profileIds)
        : Promise.resolve({ data: [], error: null }),
      profileIds.length
        ? db
            .from("messaging_contacts")
            .select("id,profile_id,phone_e164,lifecycle_status,knotty_enabled,opted_out,last_activity_at")
            .in("profile_id", profileIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (preferencesResult.error) throw new RouteError(500, preferencesResult.error.message);
    if (photosResult.error) throw new RouteError(500, photosResult.error.message);
    if (contactsResult.error) throw new RouteError(500, contactsResult.error.message);

    const preferences = new Map<string, Preference>(
      ((preferencesResult.data || []) as Preference[]).map((row) => [row.user_id, row]),
    );

    const photoCounts = new Map<string, number>();
    for (const row of photosResult.data || []) {
      if (!row.profile_id) continue;
      photoCounts.set(row.profile_id, (photoCounts.get(row.profile_id) || 0) + 1);
    }

    const contacts = new Map<string, any>();
    for (const row of contactsResult.data || []) {
      if (row.profile_id) contacts.set(row.profile_id, row);
    }

    const masseurs = profiles.map((profile) => {
      const pref = profile.user_id ? preferences.get(profile.user_id) : null;
      const audit = getProfileCompletionAudit(profile, photoCounts.get(profile.id) || 0);
      const contact = contacts.get(profile.id) || null;
      const phone = normalizePhoneE164(pref?.phone_e164) || profilePhone(profile);
      const hasDedicatedConsent = Boolean(
        pref?.imessage_profile_assistant_enabled === true &&
          pref.imessage_profile_assistant_consent_at &&
          pref.imessage_profile_assistant_consent_version &&
          !pref.imessage_profile_assistant_opted_out_at,
      );

      return {
        profileId: profile.id,
        userId: profile.user_id,
        name: String(profile.display_name || profile.full_name || "Unnamed masseur").trim(),
        slug: profile.slug || null,
        role: profile.role,
        city: profile.city || null,
        state: profile.state || null,
        phone,
        active: profile.is_active === true,
        suspended: profile.is_suspended === true,
        banned: profile.is_banned === true,
        profileComplete: audit.complete,
        missing: audit.missing,
        missingCount: audit.missingCount,
        nextField: audit.nextField,
        photoCount: photoCounts.get(profile.id) || 0,
        imessageAssistantEnabled: pref?.imessage_profile_assistant_enabled === true,
        imessageConsent: hasDedicatedConsent,
        imessageOptedOut: Boolean(pref?.imessage_profile_assistant_opted_out_at),
        consentAt: pref?.imessage_profile_assistant_consent_at || null,
        consentVersion: pref?.imessage_profile_assistant_consent_version || null,
        messagingContactId: contact?.id || null,
        messagingLifecycle: contact?.lifecycle_status || null,
        knottyEnabled: contact?.knotty_enabled === true,
        messagingOptedOut: contact?.opted_out === true,
        lastMessagingActivityAt: contact?.last_activity_at || null,
        createdAt: profile.created_at || null,
        updatedAt: profile.updated_at || null,
      };
    });

    return json({
      ok: true,
      masseurs,
      counts: {
        total: masseurs.length,
        active: masseurs.filter((item) => item.active && !item.suspended && !item.banned).length,
        complete: masseurs.filter((item) => item.profileComplete).length,
        incomplete: masseurs.filter((item) => !item.profileComplete).length,
        imessageConsented: masseurs.filter((item) => item.imessageConsent).length,
        messagingContacts: masseurs.filter((item) => Boolean(item.messagingContactId)).length,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
