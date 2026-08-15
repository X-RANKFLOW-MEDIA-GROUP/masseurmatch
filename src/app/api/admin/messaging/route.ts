export const dynamic = "force-dynamic";

import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import type { Json } from "@/integrations/supabase/types";

const updateSettingsSchema = z.object({
  action: z.literal("update_settings"),
  globalPause: z.boolean().optional(),
  knottyEnabled: z.boolean().optional(),
});

const updateContactSchema = z.object({
  action: z.literal("update_contact"),
  contactId: z.string().uuid(),
  lifecycleStatus: z.enum(["new", "contacted", "replied", "interested", "converted", "closed"]).optional(),
  knottyEnabled: z.boolean().optional(),
  optedOut: z.boolean().optional(),
  optedOutReason: z.string().trim().max(300).optional().nullable(),
});

const queueMessageSchema = z.object({
  action: z.literal("queue_message"),
  contactId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

const markReadSchema = z.object({
  action: z.literal("mark_read"),
  conversationId: z.string().uuid(),
});

const postSchema = z.discriminatedUnion("action", [
  updateSettingsSchema,
  updateContactSchema,
  queueMessageSchema,
  markReadSchema,
]);

type DbClient = ReturnType<typeof createSupabaseAdminClient> & {
  from: (table: string) => any;
};

type QueryResult<T> = { data: T | null; error: { message: string } | null; count?: number | null };

function assertQuery<T>(result: QueryResult<T>, label: string): T | null {
  if (result.error) throw new RouteError(500, `${label}: ${result.error.message}`);
  return result.data;
}

function safeSearch(value: string | null) {
  if (!value) return null;
  return value.trim().replace(/[,%()]/g, " ").slice(0, 120) || null;
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    assertRateLimit(request, "admin-messaging-read", { limit: 120, windowMs: 60_000 });

    const url = new URL(request.url);
    const search = safeSearch(url.searchParams.get("q"));
    const conversationId = url.searchParams.get("conversationId");
    if (conversationId && !z.string().uuid().safeParse(conversationId).success) {
      throw new RouteError(400, "Invalid conversation id.");
    }

    const db = createSupabaseAdminClient() as DbClient;

    let contactsQuery = db
      .from("messaging_contacts")
      .select(
        "id,phone_e164,name,city,state,timezone,profile_url,lifecycle_status,knotty_enabled,opted_out,opted_out_at,opted_out_reason,last_outbound_at,last_inbound_at,last_activity_at,created_at,updated_at",
      )
      .order("last_activity_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(300);

    if (search) {
      contactsQuery = contactsQuery.or(`name.ilike.%${search}%,phone_e164.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const [
      settingsResult,
      contactsResult,
      conversationsResult,
      campaignsResult,
      queueResult,
      totalContactsResult,
      optedOutResult,
      pendingQueueResult,
      failedQueueResult,
      openConversationsResult,
    ] = await Promise.all([
      db.from("messaging_settings").select("*").eq("id", "default").maybeSingle(),
      contactsQuery,
      db
        .from("messaging_conversations")
        .select(
          "id,contact_id,receiving_number,status,knotty_enabled,current_channel,unread_count,last_message_at,last_inbound_at,last_outbound_at,created_at,updated_at,messaging_contacts(id,name,phone_e164,city,state,lifecycle_status,opted_out,knotty_enabled)",
        )
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(150),
      db
        .from("messaging_campaigns")
        .select("id,name,status,transport_preference,started_at,completed_at,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(20),
      db
        .from("messaging_queue")
        .select(
          "id,campaign_id,contact_id,conversation_id,message_id,body,transport_preference,status,scheduled_for,priority,attempts,max_attempts,locked_at,locked_by,last_error,sent_at,delivered_at,failed_at,created_at,messaging_contacts(id,name,phone_e164,city,state)",
        )
        .order("created_at", { ascending: false })
        .limit(100),
      db.from("messaging_contacts").select("id", { count: "exact", head: true }),
      db.from("messaging_contacts").select("id", { count: "exact", head: true }).eq("opted_out", true),
      db.from("messaging_queue").select("id", { count: "exact", head: true }).in("status", ["pending", "processing"]),
      db.from("messaging_queue").select("id", { count: "exact", head: true }).eq("status", "failed"),
      db.from("messaging_conversations").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);

    const selectedMessagesResult = conversationId
      ? await db
          .from("messaging_messages")
          .select(
            "id,conversation_id,contact_id,campaign_id,direction,sender_type,body,channel,delivery_status,external_id,sent_at,delivered_at,received_at,failed_at,error_code,error_message,created_at,updated_at",
          )
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })
          .limit(500)
      : ({ data: [], error: null } as QueryResult<any[]>);

    const settings = assertQuery<any>(settingsResult, "Load messaging settings");
    const contacts = assertQuery<any[]>(contactsResult, "Load messaging contacts") || [];
    const conversations = assertQuery<any[]>(conversationsResult, "Load messaging conversations") || [];
    const campaigns = assertQuery<any[]>(campaignsResult, "Load messaging campaigns") || [];
    const queue = assertQuery<any[]>(queueResult, "Load messaging queue") || [];
    const messages = assertQuery<any[]>(selectedMessagesResult, "Load conversation messages") || [];

    for (const [result, label] of [
      [totalContactsResult, "Count contacts"],
      [optedOutResult, "Count opt outs"],
      [pendingQueueResult, "Count queue"],
      [failedQueueResult, "Count failures"],
      [openConversationsResult, "Count conversations"],
    ] as Array<[QueryResult<unknown>, string]>) {
      if (result.error) throw new RouteError(500, `${label}: ${result.error.message}`);
    }

    return json({
      ok: true,
      settings,
      contacts,
      conversations,
      campaigns,
      queue,
      messages,
      counts: {
        contacts: totalContactsResult.count || 0,
        optedOut: optedOutResult.count || 0,
        pending: pendingQueueResult.count || 0,
        failed: failedQueueResult.count || 0,
        openConversations: openConversationsResult.count || 0,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-messaging-write", { limit: 60, windowMs: 60_000 });
    const body = await parseJsonBody(request, postSchema);
    const db = createSupabaseAdminClient() as DbClient;

    if (body.action === "update_settings") {
      const patch: { [key: string]: Json | undefined } = {};
      if (body.globalPause !== undefined) patch.global_pause = body.globalPause;
      if (body.knottyEnabled !== undefined) patch.knotty_enabled = body.knottyEnabled;
      if (Object.keys(patch).length === 0) throw new RouteError(400, "No settings supplied.");

      const { data, error } = await db
        .from("messaging_settings")
        .update(patch)
        .eq("id", "default")
        .select("*")
        .single();
      if (error) throw new RouteError(500, error.message);

      await recordAuditLog(admin.userId, "admin_messaging_settings_updated", "messaging_settings", "default", patch);
      return json({ ok: true, settings: data });
    }

    if (body.action === "update_contact") {
      const patch: { [key: string]: Json | undefined } = {};
      if (body.lifecycleStatus !== undefined) patch.lifecycle_status = body.lifecycleStatus;
      if (body.knottyEnabled !== undefined) patch.knotty_enabled = body.knottyEnabled;
      if (body.optedOut !== undefined) {
        patch.opted_out = body.optedOut;
        patch.opted_out_at = body.optedOut ? new Date().toISOString() : null;
        patch.opted_out_reason = body.optedOut ? body.optedOutReason || "admin" : null;
        if (body.optedOut) patch.knotty_enabled = false;
      }
      if (Object.keys(patch).length === 0) throw new RouteError(400, "No contact changes supplied.");

      const { data, error } = await db
        .from("messaging_contacts")
        .update(patch)
        .eq("id", body.contactId)
        .select(
          "id,phone_e164,name,city,state,lifecycle_status,knotty_enabled,opted_out,opted_out_at,opted_out_reason,last_activity_at,updated_at",
        )
        .single();
      if (error) throw new RouteError(500, error.message);

      await recordAuditLog(admin.userId, "admin_messaging_contact_updated", "messaging_contact", body.contactId, patch);
      return json({ ok: true, contact: data });
    }

    if (body.action === "mark_read") {
      const { error } = await db
        .from("messaging_conversations")
        .update({ unread_count: 0 })
        .eq("id", body.conversationId);
      if (error) throw new RouteError(500, error.message);
      return json({ ok: true });
    }

    const { data: contact, error: contactError } = await db
      .from("messaging_contacts")
      .select("id,phone_e164,opted_out,knotty_enabled")
      .eq("id", body.contactId)
      .single();
    if (contactError) throw new RouteError(500, contactError.message);
    if (!contact) throw new RouteError(404, "Contact not found.");
    if (contact.opted_out) throw new RouteError(409, "This contact is opted out and cannot be messaged.");

    const { data: settings, error: settingsError } = await db
      .from("messaging_settings")
      .select("receiving_number,transport_mode,global_pause")
      .eq("id", "default")
      .single();
    if (settingsError) throw new RouteError(500, settingsError.message);
    if (settings?.global_pause) throw new RouteError(409, "Messaging is globally paused.");

    const { data: existingConversation, error: conversationError } = await db
      .from("messaging_conversations")
      .select("id")
      .eq("contact_id", body.contactId)
      .eq("receiving_number", settings.receiving_number)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (conversationError) throw new RouteError(500, conversationError.message);

    let conversation = existingConversation;

    if (!conversation) {
      const created = await db
        .from("messaging_conversations")
        .insert({
          contact_id: body.contactId,
          receiving_number: settings.receiving_number,
          current_channel: "unknown",
          knotty_enabled: Boolean(contact.knotty_enabled),
        })
        .select("id")
        .single();
      if (created.error) throw new RouteError(500, created.error.message);
      conversation = created.data;
    }

    const idempotencyKey = `manual:${body.contactId}:${crypto.randomUUID()}`;
    const createdMessage = await db
      .from("messaging_messages")
      .insert({
        conversation_id: conversation.id,
        contact_id: body.contactId,
        direction: "outbound",
        sender_type: "human",
        body: body.body,
        channel: "unknown",
        delivery_status: "queued",
        idempotency_key: idempotencyKey,
      })
      .select("id")
      .single();
    if (createdMessage.error) throw new RouteError(500, createdMessage.error.message);

    const queued = await db
      .from("messaging_queue")
      .insert({
        contact_id: body.contactId,
        conversation_id: conversation.id,
        message_id: createdMessage.data.id,
        body: body.body,
        transport_preference: settings.transport_mode || "automatic",
        status: "pending",
        idempotency_key: idempotencyKey,
      })
      .select("id,status,scheduled_for")
      .single();

    if (queued.error) {
      await db
        .from("messaging_messages")
        .update({ delivery_status: "failed", failed_at: new Date().toISOString(), error_message: queued.error.message })
        .eq("id", createdMessage.data.id);
      throw new RouteError(500, queued.error.message);
    }

    await recordAuditLog(admin.userId, "admin_messaging_message_queued", "messaging_message", createdMessage.data.id, {
      contactId: body.contactId,
      conversationId: conversation.id,
      queueId: queued.data.id,
    });

    return json({
      ok: true,
      messageId: createdMessage.data.id,
      queue: queued.data,
      conversationId: conversation.id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
