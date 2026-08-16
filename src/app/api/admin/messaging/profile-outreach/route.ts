import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import {
  getProfileCompletionAudit,
  normalizePhoneE164,
  summarizeMissingFields,
} from "@/lib/messaging/profile-completion";

const previewRequestSchema = z.object({
  action: z.literal("preview"),
  limit: z.number().int().min(1).max(300).optional().default(100),
  profileId: z.string().uuid().optional(),
});

const queueRequestSchema = z.object({
  action: z.literal("queue"),
  limit: z.number().int().min(1).max(1).optional().default(1),
  profileId: z.string().uuid(),
});

const requestSchema = z.discriminatedUnion("action", [previewRequestSchema, queueRequestSchema]);

type Db = { from: (table: string) => any };
type Profile = Record<string, any> & {
  id: string;
  user_id: string | null;
  display_name: string | null;
  full_name: string | null;
  phone: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  whatsapp: string | null;
};
type NotificationPreference = {
  user_id: string;
  imessage_profile_assistant_enabled: boolean | null;
  imessage_profile_assistant_consent_at: string | null;
  imessage_profile_assistant_consent_version: string | null;
  imessage_profile_assistant_opted_out_at: string | null;
  phone_e164: string | null;
  timezone: string | null;
};

const PROFILE_SELECT = [
  "id",
  "user_id",
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
  "role",
].join(",");

function nameFor(profile: Profile) {
  return String(profile.display_name || profile.full_name || "there").trim();
}

function profilePhone(profile: Profile) {
  return normalizePhoneE164(
    profile.phone || profile.phone_number || profile.whatsapp_number || profile.whatsapp,
  );
}

function initialMessage(profile: Profile, missing: string[]) {
  const name = nameFor(profile);
  const summary = summarizeMissingFields(missing as any);
  return `Hi ${name}, this is Knotty from MasseurMatch. You enabled profile assistance by iMessage. Your profile is missing ${summary}. Reply START and I'll guide you one section at a time. Never send your password by text. Reply STOP to opt out.`;
}

async function ensureContact(db: Db, profile: Profile, phone: string, timezone: string | null) {
  const existing = await db
    .from("messaging_contacts")
    .select("id,profile_id,user_id,opted_out,knotty_enabled")
    .eq("phone_e164", phone)
    .maybeSingle();
  if (existing.error) throw new RouteError(500, existing.error.message);

  if (existing.data) {
    if (existing.data.profile_id && existing.data.profile_id !== profile.id) {
      return { contact: null, reason: "phone_linked_to_another_profile" as const };
    }
    if (existing.data.user_id && existing.data.user_id !== profile.user_id) {
      return { contact: null, reason: "phone_linked_to_another_user" as const };
    }
    if (existing.data.opted_out) return { contact: null, reason: "opted_out" as const };

    const updated = await db
      .from("messaging_contacts")
      .update({
        profile_id: profile.id,
        user_id: profile.user_id,
        name: nameFor(profile),
        city: profile.city || null,
        state: profile.state || null,
        timezone: timezone || "America/Chicago",
        profile_url: profile.slug ? `/therapists/${profile.slug}` : null,
        source: "profile_completion_imessage",
        knotty_enabled: true,
      })
      .eq("id", existing.data.id)
      .select("id,profile_id,user_id,opted_out,knotty_enabled")
      .single();
    if (updated.error) throw new RouteError(500, updated.error.message);
    return { contact: updated.data, reason: null };
  }

  const created = await db
    .from("messaging_contacts")
    .insert({
      phone_e164: phone,
      profile_id: profile.id,
      user_id: profile.user_id,
      name: nameFor(profile),
      city: profile.city || null,
      state: profile.state || null,
      timezone: timezone || "America/Chicago",
      profile_url: profile.slug ? `/therapists/${profile.slug}` : null,
      source: "profile_completion_imessage",
      lifecycle_status: "new",
      knotty_enabled: true,
    })
    .select("id,profile_id,user_id,opted_out,knotty_enabled")
    .single();
  if (created.error) throw new RouteError(500, created.error.message);
  return { contact: created.data, reason: null };
}

async function ensureConversation(db: Db, contactId: string, userId: string, receivingNumber: string) {
  const existing = await db
    .from("messaging_conversations")
    .select("id")
    .eq("contact_id", contactId)
    .eq("receiving_number", receivingNumber)
    .maybeSingle();
  if (existing.error) throw new RouteError(500, existing.error.message);
  if (existing.data) return existing.data.id as string;

  const created = await db
    .from("messaging_conversations")
    .insert({
      user_id: userId,
      contact_id: contactId,
      receiving_number: receivingNumber,
      status: "open",
      knotty_enabled: true,
      current_channel: "imessage",
    })
    .select("id")
    .single();
  if (created.error) throw new RouteError(500, created.error.message);
  return created.data.id as string;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "profile-completion-imessage-outreach", { limit: 20, windowMs: 60_000 });
    const body = await parseJsonBody(request, requestSchema);
    const db = createSupabaseAdminClient() as unknown as Db;

    let profilesQuery = db
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("role", "provider")
      .eq("is_demo", false)
      .eq("is_active", true)
      .eq("is_banned", false)
      .eq("is_suspended", false)
      .not("user_id", "is", null);

    if (body.profileId) profilesQuery = profilesQuery.eq("id", body.profileId);

    const profilesResult = await profilesQuery.limit(body.profileId ? 1 : body.limit);
    if (profilesResult.error) throw new RouteError(500, profilesResult.error.message);
    const profiles = (profilesResult.data || []) as Profile[];

    const userIds = profiles.map((profile) => profile.user_id).filter(Boolean) as string[];
    const preferencesResult = userIds.length
      ? await db
          .from("user_notification_preferences")
          .select("user_id,imessage_profile_assistant_enabled,imessage_profile_assistant_consent_at,imessage_profile_assistant_consent_version,imessage_profile_assistant_opted_out_at,phone_e164,timezone")
          .in("user_id", userIds)
      : { data: [], error: null };
    if (preferencesResult.error) throw new RouteError(500, preferencesResult.error.message);
    const preferences = new Map<string, NotificationPreference>(
      ((preferencesResult.data || []) as NotificationPreference[]).map((row) => [row.user_id, row] as const),
    );

    const profileIds = profiles.map((profile) => profile.id);
    const photosResult = profileIds.length
      ? await db.from("profile_photos").select("profile_id").in("profile_id", profileIds)
      : { data: [], error: null };
    if (photosResult.error) throw new RouteError(500, photosResult.error.message);
    const photoCounts = new Map<string, number>();
    for (const row of photosResult.data || []) {
      if (!row.profile_id) continue;
      photoCounts.set(row.profile_id, (photoCounts.get(row.profile_id) || 0) + 1);
    }

    const settingsResult = await db
      .from("messaging_settings")
      .select("receiving_number,global_pause,imessage_outbound_enabled")
      .eq("id", "default")
      .single();
    if (settingsResult.error) throw new RouteError(500, settingsResult.error.message);
    if (body.action === "queue" && settingsResult.data.global_pause) {
      throw new RouteError(409, "Messaging is globally paused.");
    }
    if (body.action === "queue" && settingsResult.data.imessage_outbound_enabled !== true) {
      throw new RouteError(409, "Outbound iMessage is disarmed.");
    }

    const results: Array<Record<string, unknown>> = [];
    let eligible = 0;
    let queued = 0;

    for (const profile of profiles) {
      const pref = profile.user_id ? preferences.get(profile.user_id) : null;
      const audit = getProfileCompletionAudit(profile, photoCounts.get(profile.id) || 0);
      const phone = normalizePhoneE164(pref?.phone_e164) || profilePhone(profile);

      let reason: string | null = null;
      if (audit.complete) reason = "profile_complete";
      else if (!profile.user_id) reason = "no_authenticated_user";
      else if (!pref || pref.imessage_profile_assistant_enabled !== true) reason = "imessage_assistant_not_enabled";
      else if (!pref.imessage_profile_assistant_consent_at || !pref.imessage_profile_assistant_consent_version) reason = "imessage_consent_missing";
      else if (pref.imessage_profile_assistant_opted_out_at) reason = "imessage_opted_out";
      else if (!phone) reason = "no_valid_phone";

      if (reason) {
        results.push({
          profileId: profile.id,
          name: nameFor(profile),
          eligible: false,
          reason,
          missing: audit.missing,
        });
        continue;
      }

      eligible += 1;
      if (body.action === "preview") {
        results.push({
          profileId: profile.id,
          name: nameFor(profile),
          eligible: true,
          phone,
          consentAt: pref!.imessage_profile_assistant_consent_at,
          consentVersion: pref!.imessage_profile_assistant_consent_version,
          missing: audit.missing,
        });
        continue;
      }

      const ensured = await ensureContact(db, profile, phone!, pref?.timezone || null);
      if (!ensured.contact) {
        results.push({
          profileId: profile.id,
          name: nameFor(profile),
          eligible: false,
          reason: ensured.reason,
          missing: audit.missing,
        });
        continue;
      }

      const conversationId = await ensureConversation(
        db,
        ensured.contact.id,
        profile.user_id!,
        settingsResult.data.receiving_number,
      );
      const idempotencyKey = `profile-completion-imessage:v1:${profile.id}`;
      const previous = await db
        .from("messaging_messages")
        .select("id,delivery_status")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (previous.error) throw new RouteError(500, previous.error.message);

      if (previous.data) {
        results.push({
          profileId: profile.id,
          name: nameFor(profile),
          eligible: true,
          queued: false,
          reason: "already_contacted",
          messageId: previous.data.id,
          missing: audit.missing,
        });
        continue;
      }

      const message = await db
        .from("messaging_messages")
        .insert({
          user_id: profile.user_id,
          conversation_id: conversationId,
          contact_id: ensured.contact.id,
          direction: "outbound",
          sender_type: "knotty",
          body: initialMessage(profile, audit.missing),
          channel: "imessage",
          delivery_status: "queued",
          idempotency_key: idempotencyKey,
          metadata: {
            purpose: "profile_completion_outreach",
            audit_version: audit.version,
            missing_fields: audit.missing,
            consent_at: pref!.imessage_profile_assistant_consent_at,
            consent_version: pref!.imessage_profile_assistant_consent_version,
          },
        })
        .select("id,body")
        .single();
      if (message.error) throw new RouteError(500, message.error.message);

      const queue = await db
        .from("messaging_queue")
        .insert({
          user_id: profile.user_id,
          contact_id: ensured.contact.id,
          conversation_id: conversationId,
          message_id: message.data.id,
          body: message.data.body,
          transport_preference: "imessage",
          status: "pending",
          priority: 60,
          idempotency_key: idempotencyKey,
        });
      if (queue.error) {
        await db
          .from("messaging_messages")
          .update({ delivery_status: "failed", failed_at: new Date().toISOString(), error_message: queue.error.message })
          .eq("id", message.data.id);
        throw new RouteError(500, queue.error.message);
      }

      queued += 1;
      results.push({
        profileId: profile.id,
        name: nameFor(profile),
        eligible: true,
        queued: true,
        messageId: message.data.id,
        missing: audit.missing,
      });
    }

    await recordAuditLog(
      admin.userId,
      body.action === "queue" ? "profile_completion_imessage_outreach_queued" : "profile_completion_imessage_outreach_previewed",
      "messaging_campaign",
      undefined,
      {
        scanned: profiles.length,
        eligible,
        queued,
        targetProfileId: body.profileId || null,
        consentGate: "user_notification_preferences.imessage_profile_assistant_enabled",
      },
    );

    return json({
      ok: true,
      action: body.action,
      targetProfileId: body.profileId || null,
      scanned: profiles.length,
      eligible,
      queued,
      results,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
