import { createHash, randomBytes } from "node:crypto";

import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { sanitizeText } from "@/app/_lib/security";
import { chatMessages, type ChatMessage } from "@/lib/ai/llm";
import { runKnottyGuardrails } from "@/lib/knotty/guardrails";
import {
  fieldLabel,
  getProfileCompletionAudit,
  normalizePhoneE164,
  parseProfileFieldAnswer,
  profilePatchForField,
  questionForField,
  summarizeMissingFields,
  type EditableProfileField,
  type ProfileCompletionField,
} from "@/lib/messaging/profile-completion";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://masseurmatch.com").replace(/\/$/, "");
const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const VERIFY_TTL_MS = 30 * 60 * 1000;
const PROFILE_SELECT = [
  "id",
  "user_id",
  "slug",
  "display_name",
  "full_name",
  "headline",
  "tagline",
  "bio",
  "city",
  "state",
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
  "profile_status",
  "visibility_status",
  "is_active",
  "is_suspended",
  "is_banned",
].join(",");

type Db = ReturnType<typeof createSupabaseAdminClient> & { from: (table: string) => any; rpc: (fn: string, args?: any) => any };
type Profile = Record<string, any> & { id: string; user_id: string | null };
type Contact = {
  id: string;
  phone_e164: string;
  name: string | null;
  profile_id: string | null;
  user_id: string | null;
  knotty_enabled: boolean;
  opted_out: boolean;
};
type Conversation = { id: string; contact_id: string; receiving_number: string; knotty_enabled: boolean; status: string };
type SessionRow = {
  id: string;
  contact_id: string;
  conversation_id: string;
  profile_id: string;
  user_id: string;
  status: "unverified" | "pending_verification" | "verified" | "expired" | "revoked";
  pending_field: EditableProfileField | null;
  pending_value: unknown;
  pending_preview: string | null;
  verification_token_hash: string | null;
  verified_at: string | null;
  expires_at: string | null;
  last_prompted_field: ProfileCompletionField | null;
};

function nowIso() {
  return new Date().toISOString();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function displayName(profile: Profile, contact?: Contact) {
  return String(profile.display_name || profile.full_name || contact?.name || "there").trim();
}

function isSessionVerified(session: SessionRow | null) {
  if (!session || session.status !== "verified" || !session.expires_at) return false;
  return new Date(session.expires_at).getTime() > Date.now();
}

async function photoCount(db: Db, profileId: string) {
  const { count, error } = await db
    .from("profile_photos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);
  if (error) return 0;
  return count || 0;
}

async function queueKnottyMessage(
  db: Db,
  contact: Contact,
  conversation: Conversation,
  body: string,
  idempotencyKey: string,
  metadata: Record<string, unknown> = {},
) {
  const cleanBody = sanitizeText(body).slice(0, 4000);
  if (!cleanBody) return null;

  const created = await db
    .from("messaging_messages")
    .insert({
      user_id: contact.user_id,
      conversation_id: conversation.id,
      contact_id: contact.id,
      direction: "outbound",
      sender_type: "knotty",
      body: cleanBody,
      channel: "imessage",
      delivery_status: "queued",
      idempotency_key: idempotencyKey,
      metadata,
    })
    .select("id")
    .single();
  if (created.error) throw new Error(`Could not create outbound message: ${created.error.message}`);

  const queued = await db.from("messaging_queue").insert({
    user_id: contact.user_id,
    contact_id: contact.id,
    conversation_id: conversation.id,
    message_id: created.data.id,
    body: cleanBody,
    transport_preference: "imessage",
    status: "pending",
    priority: 40,
    idempotency_key: idempotencyKey,
  });
  if (queued.error) {
    await db
      .from("messaging_messages")
      .update({ delivery_status: "failed", failed_at: nowIso(), error_message: queued.error.message })
      .eq("id", created.data.id);
    throw new Error(`Could not queue outbound message: ${queued.error.message}`);
  }

  return created.data.id as string;
}

async function audit(
  db: Db,
  session: SessionRow,
  action: string,
  fieldName?: string | null,
  previousValue?: unknown,
  newValue?: unknown,
  details: Record<string, unknown> = {},
) {
  await db.from("messaging_profile_audit_log").insert({
    session_id: session.id,
    conversation_id: session.conversation_id,
    contact_id: session.contact_id,
    profile_id: session.profile_id,
    user_id: session.user_id,
    action,
    field_name: fieldName || null,
    previous_value: previousValue === undefined ? null : previousValue,
    new_value: newValue === undefined ? null : newValue,
    details,
  });
}

async function getOrCreateConversation(db: Db, contact: Contact, receivingNumber: string) {
  const existing = await db
    .from("messaging_conversations")
    .select("id,contact_id,receiving_number,knotty_enabled,status")
    .eq("contact_id", contact.id)
    .eq("receiving_number", receivingNumber)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data as Conversation;

  const created = await db
    .from("messaging_conversations")
    .insert({
      user_id: contact.user_id,
      contact_id: contact.id,
      receiving_number: receivingNumber,
      knotty_enabled: contact.knotty_enabled,
      current_channel: "imessage",
      status: "open",
    })
    .select("id,contact_id,receiving_number,knotty_enabled,status")
    .single();
  if (created.error) throw new Error(created.error.message);
  return created.data as Conversation;
}

async function getOrCreateSession(db: Db, contact: Contact, conversation: Conversation, profile: Profile) {
  const existing = await db
    .from("messaging_profile_sessions")
    .select("*")
    .eq("conversation_id", conversation.id)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);

  if (existing.data) {
    const session = existing.data as SessionRow;
    if (session.status === "verified" && session.expires_at && new Date(session.expires_at).getTime() <= Date.now()) {
      const expired = await db
        .from("messaging_profile_sessions")
        .update({ status: "expired", verification_token_hash: null })
        .eq("id", session.id)
        .select("*")
        .single();
      if (!expired.error) return expired.data as SessionRow;
    }
    return session;
  }

  const created = await db
    .from("messaging_profile_sessions")
    .insert({
      contact_id: contact.id,
      conversation_id: conversation.id,
      profile_id: profile.id,
      user_id: profile.user_id,
      status: "unverified",
    })
    .select("*")
    .single();
  if (created.error) throw new Error(created.error.message);
  return created.data as SessionRow;
}

async function requestVerification(db: Db, session: SessionRow, contact: Contact, conversation: Conversation) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS).toISOString();
  const updated = await db
    .from("messaging_profile_sessions")
    .update({
      status: "pending_verification",
      verification_token_hash: hashToken(token),
      verification_requested_at: nowIso(),
      expires_at: expiresAt,
    })
    .eq("id", session.id)
    .select("*")
    .single();
  if (updated.error) throw new Error(updated.error.message);

  const verifyUrl = `${APP_URL}/api/messaging/profile/verify?token=${encodeURIComponent(token)}`;
  const body = `I have that ready to update. For security, sign in to MasseurMatch here to verify this conversation: ${verifyUrl}\n\nDo not send your password by text. This link expires in 30 minutes.`;
  const messageId = await queueKnottyMessage(
    db,
    contact,
    conversation,
    body,
    `knotty:verify:${session.id}:${hashToken(token).slice(0, 16)}`,
    { purpose: "profile_verification" },
  );
  await audit(db, updated.data as SessionRow, "verification_requested", session.pending_field, undefined, undefined, {
    expiresAt,
    messageId,
  });

  return updated.data as SessionRow;
}

async function promptNextField(
  db: Db,
  session: SessionRow,
  contact: Contact,
  conversation: Conversation,
  profile: Profile,
  prefix?: string,
) {
  const count = await photoCount(db, profile.id);
  const completion = getProfileCompletionAudit(profile, count);
  if (completion.complete) {
    const body = `${prefix ? `${prefix} ` : ""}Your core MasseurMatch profile information is complete. You can still fine tune your listing anytime from your dashboard.`;
    await queueKnottyMessage(db, contact, conversation, body, `knotty:complete:${conversation.id}:${Date.now()}`, {
      completionVersion: completion.version,
    });
    await db.from("messaging_profile_sessions").update({ last_prompted_field: null }).eq("id", session.id);
    return;
  }

  const next = completion.nextField!;
  const body = [prefix, `Your profile is still missing ${summarizeMissingFields(completion.missing)}.`, questionForField(next)]
    .filter(Boolean)
    .join(" ");
  const messageId = await queueKnottyMessage(
    db,
    contact,
    conversation,
    body,
    `knotty:prompt:${conversation.id}:${next}:${Date.now()}`,
    { profileField: next, completionVersion: completion.version },
  );
  await db
    .from("messaging_profile_sessions")
    .update({ last_prompted_field: next, last_outbound_message_id: messageId })
    .eq("id", session.id);
}

async function stageOrApplyField(
  db: Db,
  session: SessionRow,
  contact: Contact,
  conversation: Conversation,
  profile: Profile,
  field: EditableProfileField,
  answer: string,
) {
  const parsed = parseProfileFieldAnswer(field, answer, profile);
  if (!parsed.ok) {
    await audit(db, session, "field_rejected", field, undefined, undefined, { reason: parsed.error });
    await queueKnottyMessage(
      db,
      contact,
      conversation,
      `${parsed.error} ${questionForField(field)}`,
      `knotty:retry:${conversation.id}:${field}:${Date.now()}`,
      { profileField: field },
    );
    return;
  }

  if (!isSessionVerified(session)) {
    const staged = await db
      .from("messaging_profile_sessions")
      .update({
        pending_field: field,
        pending_value: parsed.value,
        pending_preview: parsed.preview,
      })
      .eq("id", session.id)
      .select("*")
      .single();
    if (staged.error) throw new Error(staged.error.message);
    await audit(db, staged.data as SessionRow, "field_staged", field, undefined, parsed.value, { preview: parsed.preview });
    await requestVerification(db, staged.data as SessionRow, contact, conversation);
    return;
  }

  const patch = profilePatchForField(field, parsed.value);
  const previous: Record<string, unknown> = {};
  for (const key of Object.keys(patch)) previous[key] = profile[key];

  const updated = await db.from("profiles").update(patch).eq("id", profile.id).eq("user_id", session.user_id).select(PROFILE_SELECT).single();
  if (updated.error) throw new Error(updated.error.message);

  await audit(db, session, "field_updated", field, previous, patch, { source: "imessage", preview: parsed.preview });
  await db
    .from("messaging_profile_sessions")
    .update({ pending_field: null, pending_value: null, pending_preview: null })
    .eq("id", session.id);

  await promptNextField(db, session, contact, conversation, updated.data as Profile, `Updated ${fieldLabel(field)} to ${parsed.preview}.`);
}

async function generalKnottyReply(profile: Profile, message: string) {
  const guardrails = runKnottyGuardrails(message);
  if (guardrails.blocked) return guardrails.safeReply;

  const context = {
    name: displayName(profile),
    headline: profile.headline || null,
    bio: profile.bio || null,
    city: profile.city || null,
    state: profile.state || null,
    languages: profile.languages || [],
    massageTechniques: profile.massage_techniques || [],
    yearsExperience: profile.years_experience || null,
    offersIncall: profile.offers_incall === true || profile.incall === true,
    offersOutcall: profile.offers_outcall === true || profile.outcall === true,
    incallPrice: profile.incall_price || null,
    outcallPrice: profile.outcall_price || null,
  };

  const system = [
    "You are Knotty, MasseurMatch's provider profile assistant over iMessage.",
    "Help the provider complete and improve only their own MasseurMatch profile.",
    "Use only the supplied profile data. Never invent services, credentials, pricing, availability, or verification.",
    "MasseurMatch is a directory only and does not book or process session payments.",
    "Never ask the user to send a password, authentication code, payment credential, or identity document by text.",
    "If the provider wants to change profile data, tell them you can guide them through the missing fields and secure verification flow.",
    "Keep the reply concise, professional, nonsexual, and suitable for iMessage.",
    `PROFILE DATA: ${JSON.stringify(context)}`,
  ].join("\n");
  const history: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: message },
  ];
  const result = await chatMessages(history, { temperature: 0.25, maxTokens: 220, timeoutMs: 7000 });
  return result?.text || "I can help you complete your MasseurMatch profile here. Tell me what you want to update, or say 'complete my profile' and I'll guide you through the missing sections.";
}

export async function processKnottyImessageInbound(input: {
  from: string;
  to?: string | null;
  body: string;
  externalId: string;
  receivedAt?: string | null;
}) {
  const db = createSupabaseAdminClient() as Db;
  const phone = normalizePhoneE164(input.from);
  if (!phone) throw new Error("Invalid inbound phone number.");
  const cleanBody = sanitizeText(input.body).slice(0, 4000);
  if (!cleanBody) throw new Error("Inbound message is empty.");

  const settingsResult = await db
    .from("messaging_settings")
    .select("receiving_number,knotty_enabled,global_pause")
    .eq("id", "default")
    .single();
  if (settingsResult.error) throw new Error(settingsResult.error.message);
  const settings = settingsResult.data as { receiving_number: string; knotty_enabled: boolean; global_pause: boolean };

  const contactResult = await db
    .from("messaging_contacts")
    .select("id,phone_e164,name,profile_id,user_id,knotty_enabled,opted_out")
    .eq("phone_e164", phone)
    .maybeSingle();
  if (contactResult.error) throw new Error(contactResult.error.message);
  if (!contactResult.data) return { handled: false, reason: "contact_not_found" as const };
  const contact = contactResult.data as Contact;

  const conversation = await getOrCreateConversation(db, contact, input.to || settings.receiving_number);

  const existingInbound = await db
    .from("messaging_messages")
    .select("id")
    .eq("external_id", input.externalId)
    .maybeSingle();
  if (existingInbound.error) throw new Error(existingInbound.error.message);
  if (existingInbound.data) return { handled: true, duplicate: true, conversationId: conversation.id };

  const inbound = await db
    .from("messaging_messages")
    .insert({
      user_id: contact.user_id,
      conversation_id: conversation.id,
      contact_id: contact.id,
      direction: "inbound",
      sender_type: "contact",
      body: cleanBody,
      channel: "imessage",
      delivery_status: "received",
      external_id: input.externalId,
      idempotency_key: `imessage:in:${input.externalId}`,
      received_at: input.receivedAt || nowIso(),
    })
    .select("id")
    .single();
  if (inbound.error) throw new Error(inbound.error.message);

  if (/^(stop|unsubscribe|cancel|end|quit)$/i.test(cleanBody.trim())) {
    await db
      .from("messaging_contacts")
      .update({ opted_out: true, opted_out_reason: "imessage_keyword" })
      .eq("id", contact.id);
    return { handled: true, optedOut: true, conversationId: conversation.id };
  }

  if (contact.opted_out || !contact.knotty_enabled || !conversation.knotty_enabled || !settings.knotty_enabled || settings.global_pause) {
    return { handled: true, replied: false, reason: "messaging_disabled" as const, conversationId: conversation.id };
  }

  if (!contact.profile_id || !contact.user_id) {
    await db.from("messaging_conversations").update({ status: "needs_human" }).eq("id", conversation.id);
    await queueKnottyMessage(
      db,
      contact,
      conversation,
      "I received your message, but I can't securely match this phone number to one MasseurMatch provider account yet. Please sign in at masseurmatch.com or contact support@masseurmatch.com.",
      `knotty:unlinked:${conversation.id}:${input.externalId}`,
      { reason: "profile_not_linked" },
    );
    return { handled: true, replied: true, needsHuman: true, conversationId: conversation.id };
  }

  const profileResult = await db.from("profiles").select(PROFILE_SELECT).eq("id", contact.profile_id).eq("user_id", contact.user_id).maybeSingle();
  if (profileResult.error) throw new Error(profileResult.error.message);
  if (!profileResult.data) return { handled: true, replied: false, reason: "profile_not_found" as const, conversationId: conversation.id };
  const profile = profileResult.data as Profile;
  if (profile.is_suspended || profile.is_banned || profile.is_active === false) {
    await db.from("messaging_conversations").update({ status: "needs_human" }).eq("id", conversation.id);
    return { handled: true, replied: false, reason: "profile_ineligible" as const, conversationId: conversation.id };
  }

  let session = await getOrCreateSession(db, contact, conversation, profile);
  await db.from("messaging_profile_sessions").update({ last_inbound_message_id: inbound.data.id }).eq("id", session.id);

  if (/^(help|start|complete my profile|finish my profile|profile help|setup|set up)$/i.test(cleanBody.trim())) {
    await promptNextField(db, session, contact, conversation, profile, `Hi ${displayName(profile, contact)}. I can help you finish your profile here.`);
    return { handled: true, replied: true, conversationId: conversation.id };
  }

  const expectedField = session.last_prompted_field;
  if (expectedField === "photo") {
    await queueKnottyMessage(
      db,
      contact,
      conversation,
      `Photos can't be accepted by text. Upload your photo securely at ${APP_URL}/pro/profile. Once it's uploaded, text me "done" and I'll check the next missing section.`,
      `knotty:photo:${conversation.id}:${input.externalId}`,
      { profileField: "photo" },
    );
    return { handled: true, replied: true, conversationId: conversation.id };
  }

  if (/^done$/i.test(cleanBody.trim())) {
    await promptNextField(db, session, contact, conversation, profile);
    return { handled: true, replied: true, conversationId: conversation.id };
  }

  if (expectedField) {
    await stageOrApplyField(db, session, contact, conversation, profile, expectedField as EditableProfileField, cleanBody);
    return { handled: true, replied: true, conversationId: conversation.id };
  }

  const count = await photoCount(db, profile.id);
  const completion = getProfileCompletionAudit(profile, count);
  if (!completion.complete && /profile|missing|complete|finish|update|change|edit/i.test(cleanBody)) {
    await promptNextField(db, session, contact, conversation, profile);
    return { handled: true, replied: true, conversationId: conversation.id };
  }

  const reply = await generalKnottyReply(profile, cleanBody);
  await queueKnottyMessage(
    db,
    contact,
    conversation,
    reply,
    `knotty:general:${conversation.id}:${input.externalId}`,
    { source: "knotty_imessage" },
  );
  return { handled: true, replied: true, conversationId: conversation.id };
}

export async function verifyKnottyProfileSession(token: string, authenticatedUserId: string) {
  const db = createSupabaseAdminClient() as Db;
  const tokenHash = hashToken(token);
  const sessionResult = await db
    .from("messaging_profile_sessions")
    .select("*")
    .eq("verification_token_hash", tokenHash)
    .maybeSingle();
  if (sessionResult.error) throw new Error(sessionResult.error.message);
  if (!sessionResult.data) return { ok: false, reason: "invalid_token" as const };

  let session = sessionResult.data as SessionRow;
  if (session.user_id !== authenticatedUserId) return { ok: false, reason: "wrong_account" as const };
  if (session.status !== "pending_verification" || !session.expires_at || new Date(session.expires_at).getTime() <= Date.now()) {
    await db.from("messaging_profile_sessions").update({ status: "expired", verification_token_hash: null }).eq("id", session.id);
    return { ok: false, reason: "expired" as const };
  }

  const verifiedResult = await db
    .from("messaging_profile_sessions")
    .update({
      status: "verified",
      verified_at: nowIso(),
      expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
      verification_token_hash: null,
    })
    .eq("id", session.id)
    .select("*")
    .single();
  if (verifiedResult.error) throw new Error(verifiedResult.error.message);
  session = verifiedResult.data as SessionRow;
  await audit(db, session, "verified", session.pending_field, undefined, undefined, { method: "supabase_session" });

  const contactResult = await db
    .from("messaging_contacts")
    .select("id,phone_e164,name,profile_id,user_id,knotty_enabled,opted_out")
    .eq("id", session.contact_id)
    .single();
  if (contactResult.error) throw new Error(contactResult.error.message);
  const contact = contactResult.data as Contact;
  const conversationResult = await db
    .from("messaging_conversations")
    .select("id,contact_id,receiving_number,knotty_enabled,status")
    .eq("id", session.conversation_id)
    .single();
  if (conversationResult.error) throw new Error(conversationResult.error.message);
  const conversation = conversationResult.data as Conversation;

  const profileResult = await db.from("profiles").select(PROFILE_SELECT).eq("id", session.profile_id).eq("user_id", authenticatedUserId).single();
  if (profileResult.error) throw new Error(profileResult.error.message);
  let profile = profileResult.data as Profile;

  if (session.pending_field && session.pending_value !== null && session.pending_value !== undefined) {
    const patch = profilePatchForField(session.pending_field, session.pending_value);
    const previous: Record<string, unknown> = {};
    for (const key of Object.keys(patch)) previous[key] = profile[key];

    const updated = await db.from("profiles").update(patch).eq("id", profile.id).eq("user_id", authenticatedUserId).select(PROFILE_SELECT).single();
    if (updated.error) throw new Error(updated.error.message);
    profile = updated.data as Profile;
    await audit(db, session, "field_updated", session.pending_field, previous, patch, {
      source: "verification_completion",
      preview: session.pending_preview,
    });

    const prefix = `Verified. I updated ${fieldLabel(session.pending_field)}${session.pending_preview ? ` to ${session.pending_preview}` : ""}.`;
    await db
      .from("messaging_profile_sessions")
      .update({ pending_field: null, pending_value: null, pending_preview: null })
      .eq("id", session.id);
    await promptNextField(db, session, contact, conversation, profile, prefix);
  } else {
    await promptNextField(db, session, contact, conversation, profile, "Verified. You can continue updating your profile by iMessage for the next 6 hours.");
  }

  return { ok: true, profileId: session.profile_id, conversationId: session.conversation_id };
}
