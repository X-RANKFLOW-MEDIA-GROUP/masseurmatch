import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse, getClientKey } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-signature, svix-timestamp",
};

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[RESEND-WEBHOOK] ${step}${details ? ` ${JSON.stringify(details)}` : ""}`);
}

function toBytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

function secureEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return out === 0;
}

async function hmacBase64(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, toBytes(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function verifySvixSignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): Promise<boolean> {
  if (!svixId || !svixTimestamp || !svixSignature || !secret) {
    return false;
  }

  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  const expectedBase64 = await hmacBase64(signedContent, secret);

  const signedParts = svixSignature
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.includes("=") ? part.split("=")[1] : part);

  return signedParts.some((candidate) => secureEquals(candidate, expectedBase64));
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rl = checkRateLimit(getClientKey(req), { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendWebhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET") ?? "";

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Supabase service credentials are not configured");
    }

    const payloadText = await req.text();

    if (resendWebhookSecret) {
      const svixId = req.headers.get("svix-id") ?? "";
      const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
      const svixSignature = req.headers.get("svix-signature") ?? "";

      const valid = await verifySvixSignature(
        payloadText,
        svixId,
        svixTimestamp,
        svixSignature,
        resendWebhookSecret,
      );

      if (!valid) {
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const parsed = JSON.parse(payloadText) as Record<string, unknown>;
    const events = Array.isArray(parsed) ? parsed : [parsed];

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    let processed = 0;
    for (const rawEvent of events) {
      const event = (rawEvent || {}) as Record<string, unknown>;
      const eventTypeRaw = String(event?.type ?? event?.event ?? "unknown");
      const data = (event?.data || {}) as Record<string, unknown>;

      const providerEventId = String(
        event?.id ?? event?.event_id ?? data?.id ?? data?.email_id ?? crypto.randomUUID(),
      );

      const recipient = String(
        data?.to ?? data?.recipient ?? data?.email ?? event?.to ?? "",
      ).toLowerCase().trim();

      const normalizedType = mapEventType(eventTypeRaw, data);

      const { error } = await supabase.rpc("log_email_provider_event", {
        p_provider: "resend",
        p_provider_event_id: providerEventId,
        p_recipient_email: recipient,
        p_event_type: normalizedType,
        p_payload: {
          raw_event_type: eventTypeRaw,
          raw: event,
        },
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

    return new Response(JSON.stringify({ success: true, processed, incoming: events.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("Webhook failed", { error: message });

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
