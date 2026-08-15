import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse, getClientKey } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-signature, svix-timestamp",
};

const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[RESEND-WEBHOOK] ${step}${details ? ` ${JSON.stringify(details)}` : ""}`);
}

function toBytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

function secureEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function decodeWebhookSecret(secret: string): Uint8Array {
  if (!secret.startsWith("whsec_")) return toBytes(secret);

  const encoded = secret.slice("whsec_".length);
  try {
    return Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
  } catch {
    throw new Error("RESEND_WEBHOOK_SECRET has an invalid whsec_ encoding");
  }
}

async function hmacBase64(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    decodeWebhookSecret(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, toBytes(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function getSignatureCandidates(header: string): string[] {
  return header
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = /^v1[,=](.+)$/.exec(part);
      return match?.[1] ?? "";
    })
    .filter(Boolean);
}

async function verifySvixSignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): Promise<boolean> {
  if (!svixId || !svixTimestamp || !svixSignature || !secret) return false;

  const timestamp = Number(svixTimestamp);
  if (!Number.isFinite(timestamp)) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (age > MAX_WEBHOOK_AGE_SECONDS) return false;

  const expectedBase64 = await hmacBase64(`${svixId}.${svixTimestamp}.${payload}`, secret);
  return getSignatureCandidates(svixSignature).some((candidate) => secureEquals(candidate, expectedBase64));
}

function mapEventType(eventType: string, payload: Record<string, unknown>): string {
  const lower = eventType.toLowerCase();
  if (lower.includes("complain")) return "complained";

  if (lower.includes("bounce")) {
    const bounceType = String(payload?.bounce_type ?? payload?.type ?? "").toLowerCase();
    if (bounceType.includes("soft") || bounceType.includes("transient")) return "bounced_soft";
    return "bounced_hard";
  }

  if (lower.includes("deliver")) return "delivered";
  if (lower.includes("open")) return "opened";
  if (lower.includes("click")) return "clicked";
  return lower.replace(/\s+/g, "_");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";
    const resendWebhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET")?.trim() ?? "";

    if (!supabaseUrl || !serviceKey) return json({ error: "configuration_error" }, 503);
    if (!resendWebhookSecret) {
      logStep("Webhook secret missing");
      return json({ error: "webhook_verification_not_configured" }, 503);
    }

    const payloadText = await req.text();
    const svixId = req.headers.get("svix-id")?.trim() ?? "";
    const svixTimestamp = req.headers.get("svix-timestamp")?.trim() ?? "";
    const svixSignature = req.headers.get("svix-signature")?.trim() ?? "";

    const valid = await verifySvixSignature(
      payloadText,
      svixId,
      svixTimestamp,
      svixSignature,
      resendWebhookSecret,
    );
    if (!valid) return json({ error: "Invalid or expired webhook signature" }, 401);

    const rl = checkRateLimit(getClientKey(req), { limit: 120, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const parsed = JSON.parse(payloadText) as Record<string, unknown>;
    const events = Array.isArray(parsed) ? parsed : [parsed];
    if (events.length > 100) return json({ error: "Webhook batch too large" }, 413);

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let processed = 0;
    for (const rawEvent of events) {
      const event = (rawEvent || {}) as Record<string, unknown>;
      const eventTypeRaw = String(event?.type ?? event?.event ?? "unknown");
      const data = (event?.data || {}) as Record<string, unknown>;

      const providerEventId = String(
        event?.id ?? event?.event_id ?? data?.id ?? data?.email_id ?? svixId,
      );
      if (!providerEventId) continue;

      const recipient = String(
        data?.to ?? data?.recipient ?? data?.email ?? event?.to ?? "",
      ).toLowerCase().trim();

      const normalizedType = mapEventType(eventTypeRaw, data);
      const { error } = await supabase.rpc("log_email_provider_event", {
        p_provider: "resend",
        p_provider_event_id: providerEventId,
        p_recipient_email: recipient,
        p_event_type: normalizedType,
        p_payload: { raw_event_type: eventTypeRaw, raw: event },
      });

      if (error) {
        logStep("Failed to log provider event", {
          provider_event_id: providerEventId,
          event_type: normalizedType,
          error: error.message,
        });
      } else {
        processed += 1;
      }
    }

    logStep("Webhook processed", { processed, incoming: events.length });
    return json({ success: true, processed, incoming: events.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("Webhook failed", { error: message });
    return json({ error: "webhook_processing_failed" }, 500);
  }
});
