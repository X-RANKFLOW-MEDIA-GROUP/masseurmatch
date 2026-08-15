import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

import { buildMessages } from "./messages.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://masseurmatch.com";
const FROM_ADDRESS = "MasseurMatch <noreply@masseurmatch.com>";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: { http_code: 405, message: "Method not allowed" } }, 405);

  try {
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET")?.trim() ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
    const resendKey = Deno.env.get("RESEND_API_KEY")?.trim() ?? "";

    if (!hookSecret || !supabaseUrl || !resendKey) {
      const missing = [
        !hookSecret && "SEND_EMAIL_HOOK_SECRET",
        !supabaseUrl && "SUPABASE_URL",
        !resendKey && "RESEND_API_KEY",
      ].filter(Boolean);
      console.error("[AUTH-EMAIL] Configuration missing", { missing });
      return json({ error: { http_code: 503, message: "Email hook is not configured" } }, 503);
    }

    const payload = await req.text();
    const webhook = new Webhook(hookSecret.replace(/^v1,/, "").replace(/^whsec_/, ""));

    let body: Record<string, unknown>;
    try {
      body = webhook.verify(payload, {
        "webhook-id": req.headers.get("webhook-id") ?? "",
        "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
        "webhook-signature": req.headers.get("webhook-signature") ?? "",
      }) as Record<string, unknown>;
    } catch {
      return json({ error: { http_code: 401, message: "Invalid webhook signature" } }, 401);
    }

    const user = (body?.user ?? {}) as Record<string, string>;
    const emailData = (body?.email_data ?? {}) as Record<string, string>;
    const actionType = emailData?.email_action_type ?? "";
    const userEmail = user?.email ?? "";

    if (!userEmail || !actionType) {
      return json({ error: { http_code: 400, message: "Missing user email or action type" } }, 400);
    }

    const messages = buildMessages(actionType, emailData, user, {
      supabaseUrl,
      siteUrl: SITE_URL,
    });

    if (messages.length === 0) {
      console.warn(`[AUTH-EMAIL] No deliverable message for action type: ${actionType}`);
      return json({});
    }

    for (const message of messages) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [message.to],
          subject: message.subject,
          html: message.html,
        }),
      });

      if (!response.ok) {
        console.error(`[AUTH-EMAIL] Resend failed for ${actionType}: HTTP ${response.status}`);
        throw new Error("Resend delivery failed");
      }

      const result = await response.json().catch(() => ({}));
      console.log(`[AUTH-EMAIL] Sent ${actionType}`, { id: result?.id ?? null });
    }

    return json({});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[AUTH-EMAIL] Error:", message);
    return json({ error: { http_code: 500, message: "Auth email delivery failed" } }, 500);
  }
});
