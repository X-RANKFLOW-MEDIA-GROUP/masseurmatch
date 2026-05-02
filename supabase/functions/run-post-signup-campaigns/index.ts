import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse, getClientKey } from "../_shared/rate-limit.ts";

/*
 * run-post-signup-campaigns
 *
 * Automated post-signup email sequences.
 * Designed to run on a cron (e.g. every 2 hours) and send time-gated
 * onboarding emails to users who registered recently.
 *
 * Sequence:
 *   Day 0 – welcome_day_0:  Welcome + quick-start guide
 *   Day 1 – welcome_day_1:  Complete-your-profile tips
 *   Day 3 – welcome_day_3:  Upload photos & get verified
 *   Day 7 – welcome_day_7:  Go-live checklist
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://masseurmatch.com";

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[POST-SIGNUP] ${step}${details ? ` ${JSON.stringify(details)}` : ""}`);
}

/* ─── Onboarding Email Templates ─── */

function welcomeDay0Html(name: string): string {
  return shell(
    "Welcome to MasseurMatch! 🎉",
    `Hi ${name}, welcome aboard! Your account is ready. Here's everything you need to get started and start attracting clients.`,
    [
      "Complete your profile with a bio, photos, and service rates",
      "Set your availability so clients know when to book",
      "Verify your identity to build trust and rank higher",
      "Choose a plan that fits your business goals",
    ],
    "Complete Your Profile",
    `${SITE_URL}/pro/onboard`,
  );
}

function welcomeDay1Html(name: string): string {
  return shell(
    "Make a Great First Impression",
    `Hi ${name}, did you know that therapists with complete profiles get up to 3x more contact requests? Take a few minutes to polish yours.`,
    [
      "Write a compelling bio that highlights your specialties",
      "Add your incall and outcall prices so clients can compare easily",
      "List the massage types you offer (Swedish, deep tissue, sports, etc.)",
      "Set your working hours and preferred service areas",
    ],
    "Edit My Profile",
    `${SITE_URL}/dashboard/profile`,
  );
}

function welcomeDay3Html(name: string): string {
  return shell(
    "Photos & Verification = More Bookings",
    `Hi ${name}, profiles with professional photos and verified identity badges consistently rank higher and convert better.`,
    [
      "Upload at least 3 professional photos showing your workspace",
      "Complete identity verification for a trusted badge on your listing",
      "Add a profile cover image that represents your brand",
      "Review how your listing looks to potential clients",
    ],
    "Upload Photos Now",
    `${SITE_URL}/dashboard/photos`,
  );
}

function welcomeDay7Html(name: string): string {
  return shell(
    "Ready to Go Live? ✅",
    `Hi ${name}, you've been on MasseurMatch for a week! Here is a quick checklist to make sure everything is set before you publish your profile.`,
    [
      "Profile photo and bio are complete and up to date",
      "Pricing, services, and availability are configured",
      "Identity verification is submitted or completed",
      "Your profile is set to active so clients can find you",
    ],
    "Go Live Now",
    `${SITE_URL}/dashboard/profile`,
  );
}

function shell(
  title: string,
  intro: string,
  points: string[],
  ctaText: string,
  ctaLink: string,
): string {
  const list = points
    .map(
      (p, i) =>
        `<tr><td style="padding:0 0 10px 0;vertical-align:top">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
            <td width="28" style="vertical-align:top">
              <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#E2E6F0;border-radius:50%;color:#0B1F3A;font-size:12px;font-weight:700">${i + 1}</span>
            </td>
            <td style="font-size:14px;line-height:1.6;color:#4A4F5C;font-family:Arial,sans-serif">${p}</td>
          </tr></table>
        </td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#FCFBF8;font-family:Arial,sans-serif;color:#4A4F5C">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FCFBF8;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #ECE4E4;border-radius:14px;overflow:hidden">
        <tr><td style="background:#0B1F3A;padding:22px 28px 24px">
          <span style="display:inline-block;background:#FF8A1F;color:#FFFFFF;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;padding:7px 10px;border-radius:999px;margin-bottom:10px">Getting Started</span>
          <h1 style="margin:8px 0;font-size:26px;line-height:1.2;color:#FFFFFF">${title}</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#DCE6FF">${intro}</p>
        </td></tr>
        <tr><td style="padding:20px 28px 4px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${list}
          </table>
        </td></tr>
        <tr><td align="center" style="padding:8px 28px 24px">
          <a href="${ctaLink}" style="display:inline-block;background:#FF8A1F;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:12px 24px;border-radius:8px">${ctaText}</a>
        </td></tr>
        <tr><td style="padding:0 28px"><hr style="border:none;border-top:1px solid #E2E6F0;margin:0" /></td></tr>
        <tr><td style="padding:14px 28px 20px;font-size:12px;line-height:1.6;color:#71717a">
          You received this because you created a MasseurMatch account.<br />
          <a href="{{unsubscribe_url}}" style="color:#1E4B8F;text-decoration:underline">Unsubscribe</a> or manage preferences in your dashboard.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ─── Campaign Definitions ─── */

type PostSignupCampaign = {
  key: string;
  delayDays: number;
  subject: string;
  renderHtml: (name: string) => string;
  flow: string;
  template: string;
};

const POST_SIGNUP_CAMPAIGNS: PostSignupCampaign[] = [
  {
    key: "welcome_day_0",
    delayDays: 0,
    subject: "Welcome to MasseurMatch! 🎉",
    renderHtml: welcomeDay0Html,
    flow: "post_signup",
    template: "welcome_v1",
  },
  {
    key: "welcome_day_1",
    delayDays: 1,
    subject: "Complete your profile for more bookings",
    renderHtml: welcomeDay1Html,
    flow: "post_signup",
    template: "day1_profile_v1",
  },
  {
    key: "welcome_day_3",
    delayDays: 3,
    subject: "Photos & verification = more clients",
    renderHtml: welcomeDay3Html,
    flow: "post_signup",
    template: "day3_photos_v1",
  },
  {
    key: "welcome_day_7",
    delayDays: 7,
    subject: "Ready to go live? Here's your checklist ✅",
    renderHtml: welcomeDay7Html,
    flow: "post_signup",
    template: "day7_golive_v1",
  },
];

/* ─── Main Handler ─── */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rl = checkRateLimit(getClientKey(req), { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Supabase service credentials not configured");
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const now = new Date();
    let queuedCount = 0;

    for (const campaign of POST_SIGNUP_CAMPAIGNS) {
      logStep(`Processing campaign: ${campaign.key}`);

      // Find users who signed up exactly `delayDays` ago (within a 4-hour window)
      const targetTime = new Date(now.getTime() - campaign.delayDays * 86_400_000);
      const windowStart = new Date(targetTime.getTime() - 4 * 3_600_000);
      const windowEnd = targetTime;

      // For day 0 (welcome), target users created in the last 4 hours
      const rangeFrom = campaign.delayDays === 0
        ? new Date(now.getTime() - 4 * 3_600_000).toISOString()
        : windowStart.toISOString();
      const rangeTo = campaign.delayDays === 0
        ? now.toISOString()
        : windowEnd.toISOString();

      // Query profiles created in window
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id,user_id,full_name,display_name,created_at")
        .gte("created_at", rangeFrom)
        .lt("created_at", rangeTo);

      if (profilesError) {
        logStep(`Error fetching profiles for ${campaign.key}`, { error: profilesError.message });
        continue;
      }

      if (!profiles || profiles.length === 0) {
        logStep(`No eligible users for ${campaign.key}`);
        continue;
      }

      // Resolve emails
      for (const profile of profiles) {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
          profile.user_id,
        );

        if (authError || !authUser?.user?.email) continue;

        const email = authUser.user.email.toLowerCase().trim();
        const name = profile.display_name || profile.full_name || "there";
        const todayIso = now.toISOString().slice(0, 10);

        const html = campaign.renderHtml(name);
        const idempotencyKey = `postsignup:${campaign.key}:${profile.user_id}:${todayIso}`;

        const { error: queueError } = await supabase.rpc("queue_lifecycle_email", {
          p_user_id: profile.user_id,
          p_recipient_email: email,
          p_recipient_name: name,
          p_segment: "new_signup",
          p_campaign_key: campaign.key,
          p_flow_key: campaign.flow,
          p_template_key: campaign.template,
          p_send_category: "transactional",
          p_subject: campaign.subject,
          p_body_html: html,
          p_body_text: null,
          p_from_address: "welcome@masseurmatch.com",
          p_reply_to: "community@masseurmatch.com",
          p_payload: {
            campaign_type: "post_signup",
            day: campaign.delayDays,
          },
          p_scheduled_for: now.toISOString(),
          p_idempotency_key: idempotencyKey,
        });

        if (queueError) {
          // Idempotency key duplicate = already sent, skip silently
          if (queueError.message?.includes("duplicate") || queueError.message?.includes("unique")) {
            continue;
          }
          logStep(`Error queuing ${campaign.key} for ${profile.user_id}`, {
            error: queueError.message,
          });
          continue;
        }

        queuedCount += 1;
      }

      logStep(`Finished ${campaign.key}`, { queued: queuedCount });
    }

    logStep("Post-signup sequence run completed", { total_queued: queuedCount });

    return new Response(
      JSON.stringify({ success: true, queued: queuedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("Post-signup sequence failed", { error: message });

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
