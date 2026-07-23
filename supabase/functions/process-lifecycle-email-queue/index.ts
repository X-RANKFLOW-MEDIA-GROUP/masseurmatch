import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse, getClientKey } from "../_shared/rate-limit.ts";

type QueueRow = {
  id: string;
  user_id: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  segment: string | null;
  campaign_key: string | null;
  flow_key: string | null;
  template_key: string | null;
  send_category: "marketing" | "transactional";
  subject: string;
  body_html: string;
  body_text: string | null;
  from_address: string | null;
  reply_to: string | null;
  payload: Record<string, unknown> | null;
  scheduled_for: string;
  status: string;
  suppression_reason: string | null;
  provider_id: string | null;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_FROM = {
  marketing: "updates@updates.masseurmatch.com",
  transactional: "noreply@mail.masseurmatch.com",
};

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://www.masseurmatch.com";

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[LIFECYCLE-WORKER] ${step}${details ? ` ${JSON.stringify(details)}` : ""}`);
}

function textEncoder(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

async function toHex(buffer: ArrayBuffer): Promise<string> {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signUnsubscribeToken(email: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, textEncoder(email.toLowerCase().trim()));
  return toHex(signature);
}

function appendMarketingFooter(html: string, unsubscribeUrl: string): string {
  if (html.includes("{{unsubscribe_url}}")) {
    return html.replaceAll("{{unsubscribe_url}}", unsubscribeUrl);
  }

  return `${html}
<hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0" />
<p style="font-size:12px;color:#71717a;line-height:1.5">
  You are receiving this email because you are subscribed to MasseurMatch marketing updates.
  <a href="${unsubscribeUrl}">Unsubscribe</a>.
</p>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rl = checkRateLimit(getClientKey(req), { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const unsubscribeSecret = Deno.env.get("UNSUBSCRIBE_HMAC_SECRET") ?? "";

    if (!supabaseUrl || !serviceKey) throw new Error("Supabase service credentials are not configured");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");
    if (!unsubscribeSecret) throw new Error("UNSUBSCRIBE_HMAC_SECRET not configured");

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const unsubscribeBaseUrl = Deno.env.get("UNSUBSCRIBE_BASE_URL") || `${supabaseUrl}/functions/v1/lifecycle-unsubscribe`;

    const payload = await req.json().catch(() => ({}));
    const limit = Math.max(1, Math.min(Number(payload.limit ?? 50), 200));

    logStep("Claiming queued emails", { limit });
    const { data: claimedRows, error: claimError } = await supabase.rpc("claim_lifecycle_queue_batch", {
      p_limit: limit,
    });

    if (claimError) throw claimError;

    const queue = (claimedRows ?? []) as QueueRow[];
    if (queue.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, sent: 0, skipped: 0, failed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of queue) {
      try {
        let recipientEmail = row.recipient_email?.toLowerCase().trim() || "";

        if (!recipientEmail && row.user_id) {
          const userLookup = await supabase.auth.admin.getUserById(row.user_id);
          recipientEmail = userLookup.data?.user?.email?.toLowerCase().trim() ?? "";
        }

        if (!recipientEmail) {
          throw new Error("recipient_email_not_found");
        }

        if (row.send_category === "marketing") {
          const { data: eligibility, error: eligibilityError } = await supabase.rpc("can_send_marketing_email", {
            p_user_id: row.user_id,
            p_email: recipientEmail,
            p_send_time: new Date().toISOString(),
          });

          if (eligibilityError) throw eligibilityError;

          const policy = Array.isArray(eligibility) ? eligibility[0] : eligibility;
          if (!policy?.eligible) {
            const reason = policy?.reason ?? "suppressed_by_policy";

            await supabase
              .from("lifecycle_email_queue")
              .update({ status: "suppressed", suppression_reason: reason })
              .eq("id", row.id);

            await supabase.from("lifecycle_email_log").insert({
              queue_id: row.id,
              user_id: row.user_id,
              recipient_email: recipientEmail,
              segment: row.segment,
              campaign_key: row.campaign_key,
              flow_key: row.flow_key,
              template_key: row.template_key,
              send_category: row.send_category,
              status: "suppressed",
              suppression_reason: reason,
              subject: row.subject,
              metadata: row.payload ?? {},
            });

            skipped++;
            continue;
          }
        }

        const fromAddress = row.from_address || DEFAULT_FROM[row.send_category];
        const safeRecipientName = row.recipient_name || "there";

        const token = await signUnsubscribeToken(recipientEmail, unsubscribeSecret);
        const unsubscribeUrl = `${unsubscribeBaseUrl}?email=${encodeURIComponent(recipientEmail)}&token=${token}`;

        const html = row.send_category === "marketing"
          ? appendMarketingFooter(row.body_html, unsubscribeUrl)
          : row.body_html;

        const headers: Record<string, string> = {};
        if (row.send_category === "marketing") {
          headers["List-Unsubscribe"] = `<${unsubscribeUrl}>, <mailto:unsubscribe@updates.masseurmatch.com?subject=unsubscribe>`;
          headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
        }

        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [recipientEmail],
            subject: row.subject,
            html,
            text: row.body_text || undefined,
            reply_to: row.reply_to || undefined,
            headers,
            tags: [
              { name: "campaign", value: row.campaign_key || "none" },
              { name: "flow", value: row.flow_key || "none" },
              { name: "segment", value: row.segment || "none" },
              { name: "template", value: row.template_key || "custom" },
            ],
          }),
        });

        const resendBody = await resendResponse.json();
        if (!resendResponse.ok) {
          throw new Error(resendBody?.message || "resend_send_failed");
        }

        const providerId = resendBody?.id ?? null;

        await supabase
          .from("lifecycle_email_queue")
          .update({
            status: "sent",
            provider_id: providerId,
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", row.id);

        await supabase.from("lifecycle_email_log").insert({
          queue_id: row.id,
          user_id: row.user_id,
          recipient_email: recipientEmail,
          segment: row.segment,
          campaign_key: row.campaign_key,
          flow_key: row.flow_key,
          template_key: row.template_key,
          send_category: row.send_category,
          status: "sent",
          provider: "resend",
          provider_id: providerId,
          subject: row.subject,
          metadata: {
            ...(row.payload ?? {}),
            recipient_name: safeRecipientName,
          },
        });

        sent++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        const nextRetry = (row.retry_count ?? 0) + 1;
        const isFinalFailure = nextRetry > (row.max_retries ?? 2);

        await supabase
          .from("lifecycle_email_queue")
          .update({
            retry_count: nextRetry,
            status: isFinalFailure ? "failed" : "queued",
            error_message: message,
            scheduled_for: isFinalFailure
              ? row.scheduled_for
              : new Date(Date.now() + Math.min(nextRetry, 5) * 5 * 60 * 1000).toISOString(),
          })
          .eq("id", row.id);

        if (isFinalFailure) {
          await supabase.from("lifecycle_email_log").insert({
            queue_id: row.id,
            user_id: row.user_id,
            recipient_email: row.recipient_email || "",
            segment: row.segment,
            campaign_key: row.campaign_key,
            flow_key: row.flow_key,
            template_key: row.template_key,
            send_category: row.send_category,
            status: "failed",
            suppression_reason: message,
            subject: row.subject,
            metadata: row.payload ?? {},
          });
        }

        failed++;
      }
    }

    logStep("Worker completed", { processed: queue.length, sent, skipped, failed });

    return new Response(
      JSON.stringify({
        success: true,
        processed: queue.length,
        sent,
        skipped,
        failed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("Worker failed", { error: message });

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
