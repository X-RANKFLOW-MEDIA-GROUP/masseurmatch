import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

import { buildMessages } from "./messages.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://masseurmatch.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const FROM_ADDRESS = "MasseurMatch <noreply@masseurmatch.com>";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

    let body: Record<string, unknown>;
    if (hookSecret) {
      const wh = new Webhook(hookSecret.replace(/^v1,/, "").replace(/^whsec_/, ""));
      try {
        body = wh.verify(payload, {
          "webhook-id": req.headers.get("webhook-id") ?? "",
          "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
          "webhook-signature": req.headers.get("webhook-signature") ?? "",
        }) as Record<string, unknown>;
      } catch {
        return new Response(
          JSON.stringify({ error: { http_code: 401, message: "Invalid webhook signature" } }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else {
      body = JSON.parse(payload);
    }

    const user = (body?.user ?? {}) as Record<string, string>;
    const emailData = (body?.email_data ?? {}) as Record<string, string>;
    const actionType: string = emailData?.email_action_type ?? "";
    const userEmail: string = user?.email ?? "";

    if (!userEmail || !actionType) {
      return new Response(JSON.stringify({ error: "Missing user email or action type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = buildMessages(actionType, emailData, user, {
      supabaseUrl: SUPABASE_URL,
      siteUrl: SITE_URL,
    });
    if (messages.length === 0) {
      console.warn(`[AUTH-EMAIL] No deliverable message for action type: ${actionType}`);
      return new Response(JSON.stringify({}), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    for (const message of messages) {
      const res = await fetch("https://api.resend.com/emails", {
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

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Resend error: ${res.status} ${errBody}`);
      }

      const result = await res.json();
      console.log(`[AUTH-EMAIL] Sent ${actionType} to ${message.to}`, { id: result.id });
    }

    return new Response(JSON.stringify({}), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[AUTH-EMAIL] Error:`, message);
    return new Response(
      JSON.stringify({ error: { http_code: 500, message } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
