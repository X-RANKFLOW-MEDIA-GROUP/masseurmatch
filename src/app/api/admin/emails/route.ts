export const dynamic = "force-dynamic";

import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { completeText } from "@/lib/ai/llm";

const campaignSchema = z.object({
  action: z.literal("create_campaign"),
  name: z.string().trim().min(2).max(120),
  subject: z.string().trim().min(1).max(180),
  bodyHtml: z.string().min(1).max(150_000),
  bodyText: z.string().max(80_000).optional().nullable(),
  sendCategory: z.enum(["marketing", "transactional"]),
  fromAddress: z.string().trim().max(200).optional().nullable(),
  replyTo: z.string().trim().email().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  templateId: z.string().uuid().optional().nullable(),
  userIds: z.array(z.string().uuid()).max(500).default([]),
  profileStatuses: z.array(z.string().trim().min(1)).max(20).default([]),
  plans: z.array(z.string().trim().min(1)).max(20).default([]),
  cities: z.array(z.string().trim().min(1)).max(100).default([]),
  states: z.array(z.string().trim().min(1)).max(100).default([]),
});

const templateSchema = z.object({
  action: z.literal("save_template"),
  id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  subject: z.string().trim().min(1).max(180),
  bodyHtml: z.string().min(1).max(150_000),
  bodyText: z.string().max(80_000).optional().nullable(),
  sendCategory: z.enum(["marketing", "transactional"]),
  fromAddress: z.string().trim().max(200).optional().nullable(),
  replyTo: z.string().trim().email().optional().nullable(),
});

const cancelSchema = z.object({
  action: z.literal("cancel_campaign"),
  campaignId: z.string().uuid(),
});

const aiGenerateSchema = z.object({
  action: z.literal("ai_generate"),
  objective: z.string().trim().min(3).max(1200),
  audience: z.string().trim().max(500).default("MasseurMatch providers"),
  tone: z.enum(["professional", "warm", "concise", "educational", "promotional"]).default("professional"),
  cta: z.string().trim().max(300).optional().nullable(),
  offer: z.string().trim().max(500).optional().nullable(),
  category: z.enum(["marketing", "transactional"]).default("marketing"),
});

const postSchema = z.discriminatedUnion("action", [campaignSchema, templateSchema, cancelSchema, aiGenerateSchema]);

const aiResultSchema = z.object({
  campaignName: z.string().min(1).max(120),
  subject: z.string().min(1).max(180),
  previewText: z.string().max(220).default(""),
  bodyHtml: z.string().min(1).max(150_000),
  bodyText: z.string().min(1).max(80_000),
  suggestedAudience: z.string().max(500).default(""),
  suggestedSchedule: z.string().max(120).default(""),
});

const templateIdResultSchema = z.string().uuid();
const rpcCountSchema = z.preprocess(
  (value) => (typeof value === "string" ? Number(value) : value),
  z.number().int().nonnegative(),
);
const cancelledResultSchema = rpcCountSchema;
const campaignResultSchema = z.object({
  campaignId: z.string().uuid(),
  total: rpcCountSchema,
  queued: rpcCountSchema,
  suppressed: rpcCountSchema,
});

type RpcClient = ReturnType<typeof createSupabaseAdminClient> & {
  rpc: (name: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
};

function fallbackAiEmail(body: z.infer<typeof aiGenerateSchema>) {
  const ctaText = body.cta || "Open your MasseurMatch dashboard";
  const title = body.objective.length > 72 ? "A MasseurMatch update for your profile" : body.objective;
  const offerLine = body.offer ? `<p><strong>${body.offer}</strong></p>` : "";
  return {
    campaignName: title.slice(0, 120),
    subject: title.slice(0, 180),
    previewText: "A useful update from MasseurMatch.",
    bodyHtml: `<p>Hi {{name}},</p><p>${body.objective}</p>${offerLine}<p><a href="https://www.masseurmatch.com/pro/dashboard">${ctaText}</a></p><p>Best,<br />MasseurMatch</p>`,
    bodyText: `Hi {{name}},\n\n${body.objective}${body.offer ? `\n\n${body.offer}` : ""}\n\n${ctaText}: https://www.masseurmatch.com/pro/dashboard\n\nBest,\nMasseurMatch`,
    suggestedAudience: body.audience,
    suggestedSchedule: "Send during the recipient's local daytime after reviewing the draft.",
  };
}

async function generateAiEmail(body: z.infer<typeof aiGenerateSchema>) {
  const result = await completeText({
    json: true,
    temperature: 0.45,
    maxTokens: 1800,
    timeoutMs: 12_000,
    system: `You are the MasseurMatch Email Center copywriter. MasseurMatch is a professional directory platform. Providers are independent. Do not imply MasseurMatch books appointments, processes service payments, verifies professional licenses, guarantees income, guarantees visibility, or offers sexual services. Keep all content professional, non-sexual, inclusive, truthful and suitable for email. Never invent user-specific metrics, product features, discounts, deadlines or claims that were not supplied. Marketing copy must be respectful and should assume unsubscribe/preferences controls exist in the delivery layer. Return STRICT JSON only with these keys: campaignName, subject, previewText, bodyHtml, bodyText, suggestedAudience, suggestedSchedule. HTML must be email-safe, simple, mobile-friendly and use {{name}} and {{city}} only when useful. Use https://www.masseurmatch.com/pro/dashboard as the default CTA URL.`,
    user: `Create one complete email draft.\nObjective: ${body.objective}\nAudience: ${body.audience}\nTone: ${body.tone}\nCategory: ${body.category}\nCTA request: ${body.cta || "Use the provider dashboard CTA when appropriate"}\nOffer or announcement details: ${body.offer || "None supplied"}\nReturn the final draft, not commentary.`,
  });

  if (!result?.text) return fallbackAiEmail(body);
  try {
    const parsed = JSON.parse(result.text) as unknown;
    return aiResultSchema.parse(parsed);
  } catch {
    return fallbackAiEmail(body);
  }
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    assertRateLimit(request, "admin-email-center-read", { limit: 90, windowMs: 60_000 });

    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim() || null;
    const adminClient = createSupabaseAdminClient() as RpcClient;
    const { data, error } = await adminClient.rpc("admin_email_center_snapshot", {
      p_query: query,
      p_limit: 500,
    });

    if (error) throw new RouteError(500, error.message);
    return json({ ok: true, ...(data as Record<string, unknown>) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-email-center-write", { limit: 20, windowMs: 60_000 });
    const body = await parseJsonBody(request, postSchema);

    if (body.action === "ai_generate") {
      assertRateLimit(request, "admin-email-center-ai", { limit: 12, windowMs: 60_000 });
      const draft = await generateAiEmail(body);
      await recordAuditLog(admin.userId, "admin_email_ai_draft_generated", "email_draft", undefined, {
        category: body.category,
        audience: body.audience,
        tone: body.tone,
      });
      return json({ ok: true, draft });
    }

    const adminClient = createSupabaseAdminClient() as RpcClient;

    if (body.action === "save_template") {
      const { data, error } = await adminClient.rpc("admin_email_save_template", {
        p_admin_user_id: admin.userId,
        p_id: body.id || null,
        p_name: body.name,
        p_description: body.description || null,
        p_subject: body.subject,
        p_body_html: body.bodyHtml,
        p_body_text: body.bodyText || null,
        p_send_category: body.sendCategory,
        p_from_address: body.fromAddress || null,
        p_reply_to: body.replyTo || null,
      });
      if (error) throw new RouteError(500, error.message);

      const templateId = templateIdResultSchema.parse(data);
      await recordAuditLog(admin.userId, "admin_email_template_saved", "email_template", templateId, {
        name: body.name,
        sendCategory: body.sendCategory,
      });
      return json({ ok: true, templateId });
    }

    if (body.action === "cancel_campaign") {
      const { data, error } = await adminClient.rpc("admin_email_cancel_campaign", {
        p_admin_user_id: admin.userId,
        p_campaign_id: body.campaignId,
      });
      if (error) throw new RouteError(500, error.message);

      const cancelled = cancelledResultSchema.parse(data);
      await recordAuditLog(admin.userId, "admin_email_campaign_cancelled", "email_campaign", body.campaignId, {
        cancelledQueuedMessages: cancelled,
      });
      return json({ ok: true, cancelled });
    }

    const selectedAudience =
      body.userIds.length + body.profileStatuses.length + body.plans.length + body.cities.length + body.states.length;
    if (selectedAudience === 0) throw new RouteError(400, "Choose recipients or at least one audience filter.");
    if (body.sendCategory === "transactional" && body.userIds.length === 0) {
      throw new RouteError(400, "Transactional campaigns require explicitly selected recipients.");
    }

    const scheduledFor = body.scheduledFor || new Date().toISOString();
    const { data, error } = await adminClient.rpc("admin_email_create_campaign", {
      p_admin_user_id: admin.userId,
      p_name: body.name,
      p_subject: body.subject,
      p_body_html: body.bodyHtml,
      p_body_text: body.bodyText || null,
      p_send_category: body.sendCategory,
      p_from_address: body.fromAddress || null,
      p_reply_to: body.replyTo || null,
      p_scheduled_for: scheduledFor,
      p_template_id: body.templateId || null,
      p_user_ids: body.userIds,
      p_profile_statuses: body.profileStatuses,
      p_plans: body.plans,
      p_cities: body.cities,
      p_states: body.states,
    });
    if (error) throw new RouteError(500, error.message);

    const result = campaignResultSchema.parse(data);
    await recordAuditLog(admin.userId, "admin_email_campaign_created", "email_campaign", result.campaignId, {
      name: body.name,
      sendCategory: body.sendCategory,
      scheduledFor,
      total: result.total,
      queued: result.queued,
      suppressed: result.suppressed,
    });

    return json({ ok: true, campaign: result });
  } catch (error) {
    return errorResponse(error);
  }
}
