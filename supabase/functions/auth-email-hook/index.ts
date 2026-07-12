import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://masseurmatch.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const FROM_ADDRESS = "MasseurMatch <noreply@masseurmatch.com>";

function shell(title: string, content: string, badge = "Account"): string {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#F7F7F7;font-family:Arial,sans-serif;color:#111111">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F7F7F7;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #E8E8E8;border-radius:14px;overflow:hidden">
        <tr><td style="background:#111111;padding:22px 28px 24px">
          <span style="display:inline-block;background:#8B1E2D;color:#FFFFFF;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;padding:7px 10px;border-radius:999px;margin-bottom:10px">${badge}</span>
          <h1 style="margin:8px 0;font-size:26px;line-height:1.2;color:#FFFFFF">${title}</h1>
        </td></tr>
        <tr><td style="padding:28px 28px 24px">${content}</td></tr>
        <tr><td style="padding:0 28px"><hr style="border:none;border-top:1px solid #E8E8E8;margin:0" /></td></tr>
        <tr><td style="padding:14px 28px 20px;font-size:12px;line-height:1.6;color:#8E8E8E">
          This email was sent by MasseurMatch. If you didn't request this, you can safely ignore it.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#8B1E2D;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:12px 24px;border-radius:8px;margin-top:8px">${text}</a>`;
}

function confirmUrl(type: string, tokenHash: string, redirectTo: string): string {
  return `${SUPABASE_URL}/auth/v1/verify?token=${tokenHash}&type=${type}&redirect_to=${encodeURIComponent(redirectTo)}`;
}

function buildEmail(
  actionType: string,
  emailData: Record<string, string>,
  userEmail: string,
): { subject: string; html: string } | null {
  const redirectTo = emailData.redirect_to || SITE_URL;

  switch (actionType) {
    case "signup":
      return {
        subject: "Confirm your MasseurMatch email",
        html: shell("Confirm Your Email", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">Thanks for signing up! Click below to confirm your email address and activate your account.</p>
          ${btn("Confirm Email", confirmUrl("signup", emailData.token_hash, redirectTo))}
          <p style="font-size:13px;color:#8E8E8E;margin-top:20px">This link expires in 24 hours.</p>
        `),
      };

    case "recovery":
      return {
        subject: "Reset your MasseurMatch password",
        html: shell("Reset Your Password", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">We received a request to reset the password for <strong>${userEmail}</strong>. Click below to choose a new password.</p>
          ${btn("Reset Password", confirmUrl("recovery", emailData.token_hash, redirectTo))}
          <p style="font-size:13px;color:#8E8E8E;margin-top:20px">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        `, "Security"),
      };

    case "magiclink":
      return {
        subject: "Your MasseurMatch login link",
        html: shell("Your Login Link", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">Click below to sign in to your MasseurMatch account. This link can only be used once.</p>
          ${btn("Sign In", confirmUrl("magiclink", emailData.token_hash, redirectTo))}
          <p style="font-size:13px;color:#8E8E8E;margin-top:20px">This link expires in 1 hour.</p>
        `),
      };

    case "invite":
      return {
        subject: "You've been invited to MasseurMatch",
        html: shell("You've Been Invited", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">You've been invited to join MasseurMatch. Click below to accept your invitation and set up your account.</p>
          ${btn("Accept Invitation", confirmUrl("invite", emailData.token_hash, redirectTo))}
          <p style="font-size:13px;color:#8E8E8E;margin-top:20px">This link expires in 24 hours.</p>
        `, "Invitation"),
      };

    case "email_change":
      return {
        subject: "Confirm your new MasseurMatch email",
        html: shell("Confirm Your New Email", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">Click below to confirm your new email address.</p>
          ${btn("Confirm New Email", confirmUrl("email_change", emailData.token_hash_new || emailData.token_hash, redirectTo))}
          <p style="font-size:13px;color:#8E8E8E;margin-top:20px">If you didn't request an email change, contact support immediately.</p>
        `, "Security"),
      };

    case "reauthentication":
      return {
        subject: "Your MasseurMatch verification code",
        html: shell("Your Verification Code", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">Enter this code to verify your identity:</p>
          <div style="background:#F7F7F7;border:1px solid #E8E8E8;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px">
            <span style="font-size:36px;font-weight:700;letter-spacing:0.15em;color:#111111">${emailData.token}</span>
          </div>
          <p style="font-size:13px;color:#8E8E8E">This code expires in 10 minutes. Do not share it with anyone.</p>
        `, "Security"),
      };

    default:
      return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

    let body: Record<string, unknown>;
    if (hookSecret) {
      // Supabase signs send-email hook requests per the Standard Webhooks
      // spec (webhook-id/-timestamp/-signature headers), NOT with an
      // Authorization bearer token. The dashboard secret is prefixed with
      // "v1,whsec_"; the library expects only the base64 part after "v1,".
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

    const email = buildEmail(actionType, emailData, userEmail);
    if (!email) {
      console.warn(`[AUTH-EMAIL] Unknown action type: ${actionType}`);
      return new Response(JSON.stringify({}), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [userEmail],
        subject: email.subject,
        html: email.html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Resend error: ${res.status} ${errBody}`);
    }

    const result = await res.json();
    console.log(`[AUTH-EMAIL] Sent ${actionType} to ${userEmail}`, { id: result.id });

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
