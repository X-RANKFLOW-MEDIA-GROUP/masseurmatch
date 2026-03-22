import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse, getClientKey } from "../_shared/rate-limit.ts";

type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  city: string | null;
  status: string;
  is_active: boolean;
  is_verified_identity: boolean;
  bio: string | null;
  incall_price: number | null;
  outcall_price: number | null;
  updated_at: string;
};

type Travel = {
  profile_id: string;
  destination_city: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://masseurmatch.com";

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[LIFECYCLE-CAMPAIGNS] ${step}${details ? ` ${JSON.stringify(details)}` : ""}`);
}

type EmailVariant = "standard" | "compact";

type CampaignDef = {
  key: string;
  eligible: boolean;
  segment: string;
  flow: string;
  template: string;
  subject: string;
  title: string;
  intro: string;
  points: string[];
  ctaText: string;
  ctaLink: string;
  offerBody?: string;
  couponCode?: string;
};

const CAMPAIGN_VARIANT_MAP: Record<string, EmailVariant> = {
  profile_completion_nudge: "standard",
  therapist_weekly_newsletter: "standard",
  travel_mode_digest: "compact",
  re_engagement_30: "compact",
  re_engagement_45: "compact",
  city_demand_digest: "standard",
  trial_ending_general: "compact",
};

function resolveEmailVariant(campaignKey: string, intro: string, points: string[]): EmailVariant {
  void intro;
  void points;
  const modeRaw = (Deno.env.get("LIFECYCLE_EMAIL_VARIANT_MODE") ?? "hybrid").toLowerCase();
  const mode = modeRaw === "compact" || modeRaw === "standard" || modeRaw === "hybrid" ? modeRaw : "hybrid";

  if (mode === "compact" || mode === "standard") {
    return mode;
  }

  return CAMPAIGN_VARIANT_MAP[campaignKey] ?? "standard";
}

function htmlShellStandard(
  title: string,
  intro: string,
  points: string[],
  ctaText: string,
  ctaLink: string,
  offerBody: string,
  couponCode: string,
): string {
  const list = points
    .map(
      (p) => `<tr>
                <td style="padding:0 0 12px 0;vertical-align:top">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="30" style="vertical-align:top">
                        <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#E2E6F0;border-radius:50%;color:#0B1F3A;font-size:13px;font-weight:700">+</span>
                      </td>
                      <td style="font-size:15px;line-height:1.6;color:#4A4F5C;font-family:Arial,sans-serif">
                        <strong style="color:#0B1F3A">Benefit:</strong> ${p}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FCFBF8;font-family:Arial,sans-serif;color:#4A4F5C">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FCFBF8;padding:28px 12px">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:#FFFFFF;border:1px solid #ECE4E4;border-radius:14px;overflow:hidden">
            <tr>
              <td style="background:#0B1F3A;padding:22px 28px 24px 28px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <span style="display:inline-block;background:#FF8A1F;color:#FFFFFF;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;padding:7px 10px;border-radius:999px;margin-bottom:10px">Weekly Boost</span>
                      <h1 style="margin:8px 0 8px 0;font-size:28px;line-height:1.2;color:#FFFFFF">${title}</h1>
                      <p style="margin:0;font-size:15px;line-height:1.65;color:#DCE6FF">${intro}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px">
                <div style="background:#FFF5EC;border:1px solid #FFD9B8;border-radius:8px;margin:18px 0 0 0;padding:10px 12px;font-size:13px;line-height:1.5;color:#7D4B1E">
                  Offer expires soon. Keep your profile momentum active this week.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px 0 28px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #ECE4E4;border-radius:10px;overflow:hidden">
                  <tr>
                    <td style="background:#1E4B8F;padding:10px 14px;color:#FFFFFF;font-size:13px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase">
                      Featured Offer
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#EEF2FA;padding:12px 14px;font-size:14px;line-height:1.6;color:#4A4F5C">
                      ${offerBody}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 28px 4px 28px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${list}
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:12px 28px 10px 28px">
                <a href="${ctaLink}" style="display:inline-block;background:#FF8A1F;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:12px 18px;border-radius:8px">${ctaText}</a>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:0 28px 24px 28px">
                <span style="display:inline-block;background:#FF8A1F;color:#FFFFFF;font-size:12px;font-weight:700;border-radius:6px;padding:7px 10px">Coupon: ${couponCode}</span>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 0 28px">
                <hr style="border:none;border-top:1px solid #E2E6F0;margin:0" />
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 24px 28px;font-size:12px;line-height:1.6;color:#4A4F5C">
                You are receiving marketing updates from MasseurMatch.<br />
                <a href="{{unsubscribe_url}}" style="color:#1E4B8F;text-decoration:underline">Unsubscribe</a> or manage preferences in your dashboard.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function htmlShellCompact(
  title: string,
  intro: string,
  points: string[],
  ctaText: string,
  ctaLink: string,
  offerBody: string,
  couponCode: string,
): string {
  const compactPoints = points
    .slice(0, 3)
    .map(
      (p) => `<tr>
                <td style="padding:0 0 9px 0;vertical-align:top;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="24" style="vertical-align:top;">
                        <span style="display:inline-block;width:18px;height:18px;line-height:18px;text-align:center;background:#E2E6F0;color:#0B1F3A;font-family:Arial,sans-serif;font-size:11px;font-weight:700;">+</span>
                      </td>
                      <td style="font-family:Arial,sans-serif;font-size:14px;line-height:1.45;color:#4A4F5C;">
                        <strong style="color:#0B1F3A;">Benefit:</strong> ${p}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @media only screen and (max-width: 520px) {
        .mm-wrap { width: 100% !important; }
        .mm-pad { padding-left: 14px !important; padding-right: 14px !important; }
        .mm-hero-title { font-size: 23px !important; line-height: 1.2 !important; }
        .mm-btn { display: block !important; width: 100% !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#FCFBF8;">
    <center style="width:100%;background:#FCFBF8;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FCFBF8;">
        <tr>
          <td align="center" style="padding:14px 8px;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="480"><tr><td>
            <![endif]-->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="mm-wrap" style="max-width:480px;width:100%;background:#FFFFFF;border:1px solid #ECE4E4;">
              <tr>
                <td class="mm-pad" style="background:#0B1F3A;padding:14px 16px 16px 16px;">
                  <span style="display:inline-block;background:#FF8A1F;color:#FFFFFF;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:6px 8px;">Weekly Boost</span>
                  <h1 class="mm-hero-title" style="margin:8px 0 0 0;color:#FFFFFF;font-family:Arial,sans-serif;font-size:26px;line-height:1.2;">${title}</h1>
                  <p style="margin:8px 0 0 0;color:#DCE6FF;font-family:Arial,sans-serif;font-size:14px;line-height:1.55;">${intro}</p>
                </td>
              </tr>

              <tr>
                <td class="mm-pad" style="padding:10px 16px 0 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFF5EC;border:1px solid #FFD9B8;">
                    <tr>
                      <td style="padding:8px 9px;font-family:Arial,sans-serif;font-size:12px;line-height:1.4;color:#7D4B1E;">
                        Offer expires soon. Keep your profile momentum active this week.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td class="mm-pad" style="padding:10px 16px 0 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #ECE4E4;">
                    <tr>
                      <td style="background:#1E4B8F;padding:8px 10px;color:#FFFFFF;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">Featured Offer</td>
                    </tr>
                    <tr>
                      <td style="background:#EEF2FA;padding:9px 10px;color:#4A4F5C;font-family:Arial,sans-serif;font-size:13px;line-height:1.45;">${offerBody}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td class="mm-pad" style="padding:12px 16px 2px 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    ${compactPoints}
                  </table>
                </td>
              </tr>

              <tr>
                <td align="center" class="mm-pad" style="padding:8px 16px 8px 16px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${ctaLink}" style="height:42px;v-text-anchor:middle;width:260px;" arcsize="8%" stroke="f" fillcolor="#FF8A1F">
                    <w:anchorlock/>
                    <center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${ctaText}</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-- -->
                  <a href="${ctaLink}" class="mm-btn" style="display:inline-block;background:#FF8A1F;color:#FFFFFF;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;font-weight:700;line-height:42px;padding:0 18px;">${ctaText}</a>
                  <!--<![endif]-->
                </td>
              </tr>

              <tr>
                <td align="center" class="mm-pad" style="padding:0 16px 12px 16px;">
                  <span style="display:inline-block;background:#FF8A1F;color:#FFFFFF;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:6px 8px;">Coupon: ${couponCode}</span>
                </td>
              </tr>

              <tr>
                <td class="mm-pad" style="padding:0 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:1px solid #E2E6F0;font-size:1px;line-height:1px;">&nbsp;</td></tr></table>
                </td>
              </tr>

              <tr>
                <td class="mm-pad" style="padding:10px 16px 14px 16px;font-family:Arial,sans-serif;font-size:11px;line-height:1.5;color:#4A4F5C;">
                  You are receiving marketing updates from MasseurMatch.<br />
                  <a href="{{unsubscribe_url}}" style="color:#1E4B8F;text-decoration:underline;">Unsubscribe</a> or manage preferences in your dashboard.
                </td>
              </tr>
            </table>
            <!--[if mso]>
            </td></tr></table>
            <![endif]-->
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`;
}

function renderCampaignHtml(input: {
  campaignKey: string;
  title: string;
  intro: string;
  points: string[];
  ctaText: string;
  ctaLink: string;
  offerBody?: string;
  couponCode?: string;
}) {
  const offerBody = input.offerBody ?? "Upgrade your visibility and keep your listing competitive in your city this week.";
  const couponCode = input.couponCode ?? "WELCOME10";
  const variant = resolveEmailVariant(input.campaignKey, input.intro, input.points);

  if (variant === "compact") {
    return {
      variant,
      html: htmlShellCompact(
      input.title,
      input.intro,
      input.points,
      input.ctaText,
      input.ctaLink,
      offerBody,
      couponCode,
      ),
    };
  }

  return {
    variant,
    html: htmlShellStandard(
      input.title,
      input.intro,
      input.points,
      input.ctaText,
      input.ctaLink,
      offerBody,
      couponCode,
    ),
  };
}

async function resolveEmails(
  supabase: ReturnType<typeof createClient>,
  userIds: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();

  for (const userId of userIds) {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (!error && data?.user?.email) {
      out.set(userId, data.user.email.toLowerCase().trim());
    }
  }

  return out;
}

async function queueMarketingEmail(
  supabase: ReturnType<typeof createClient>,
  input: {
    userId: string;
    email: string;
    name: string;
    city: string;
    segment: string;
    campaignKey: string;
    flowKey: string;
    templateKey: string;
    subject: string;
    html: string;
    idempotencyKey: string;
    payload?: Record<string, unknown>;
  },
) {
  const { error } = await supabase.rpc("queue_lifecycle_email", {
    p_user_id: input.userId,
    p_recipient_email: input.email,
    p_recipient_name: input.name,
    p_segment: input.segment,
    p_campaign_key: input.campaignKey,
    p_flow_key: input.flowKey,
    p_template_key: input.templateKey,
    p_send_category: "marketing",
    p_subject: input.subject,
    p_body_html: input.html,
    p_body_text: null,
    p_from_address: "updates@updates.masseurmatch.com",
    p_reply_to: "community@updates.masseurmatch.com",
    p_payload: {
      city: input.city,
      segment: input.segment,
      ...(input.payload ?? {}),
    },
    p_scheduled_for: new Date().toISOString(),
    p_idempotency_key: input.idempotencyKey,
  });

  if (error) {
    throw error;
  }
}

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
      throw new Error("Supabase service credentials are not configured");
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const payload = await req.json().catch(() => ({}));
    const requestedCampaign: string | null = payload?.campaign_key ?? null;
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);

    const { data: profilesRaw, error: profilesError } = await supabase
      .from("profiles")
      .select("id,user_id,display_name,full_name,city,status,is_active,is_verified_identity,bio,incall_price,outcall_price,updated_at")
      .eq("is_active", true)
      .neq("status", "banned");

    if (profilesError) throw profilesError;

    const profiles = (profilesRaw ?? []) as Profile[];

    const { data: photosRaw, error: photosError } = await supabase
      .from("profile_photos")
      .select("profile_id,moderation_status")
      .eq("moderation_status", "approved");

    if (photosError) throw photosError;

    const approvedPhotoProfiles = new Set((photosRaw ?? []).map((p) => p.profile_id));

    const { data: travelRaw, error: travelError } = await supabase
      .from("provider_travel")
      .select("profile_id,destination_city,start_date,end_date,is_active")
      .eq("is_active", true);

    if (travelError) throw travelError;

    const travelByProfile = new Map<string, Travel[]>();
    for (const t of (travelRaw ?? []) as Travel[]) {
      const list = travelByProfile.get(t.profile_id) ?? [];
      list.push(t);
      travelByProfile.set(t.profile_id, list);
    }

    const userEmails = await resolveEmails(
      supabase,
      [...new Set(profiles.map((p) => p.user_id))],
    );

    let queuedCount = 0;
    const runStamp = today.toISOString().slice(0, 13);

    for (const profile of profiles) {
      const email = userEmails.get(profile.user_id);
      if (!email) continue;

      const name = profile.display_name || profile.full_name || "there";
      const city = profile.city || "your city";
      const dashboard = `${SITE_URL}/dashboard`;
      const profileEdit = `${SITE_URL}/dashboard/profile`;
      const subscriptionUrl = `${SITE_URL}/dashboard/subscription`;

      const missing: string[] = [];
      if (!profile.bio || profile.bio.trim().length < 80) missing.push("Bio");
      if (!approvedPhotoProfiles.has(profile.id)) missing.push("Photos");
      if (!profile.is_verified_identity) missing.push("Identity verification");
      if (!profile.incall_price && !profile.outcall_price) missing.push("Pricing");

      const daysSinceUpdate = Math.floor((today.getTime() - new Date(profile.updated_at).getTime()) / 86400000);
      const isIncomplete = missing.length > 0;
      const isLive = profile.status === "active";

      const activeTravel = (travelByProfile.get(profile.id) ?? []).find((trip) => {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        return today >= start && today <= end;
      });

      const campaignDefs: CampaignDef[] = [
        {
          key: "profile_completion_nudge",
          eligible: isIncomplete,
          segment: "Therapist - Profile Incomplete",
          flow: "profile_completion_nudge",
          template: "profile_completion_nudge_v1",
          subject: `Your profile is almost ready in ${city}`,
          title: "Finish your profile and go live",
          intro: `Hi ${name}, your profile is close to complete. Finish these items to increase visibility in ${city}.`,
          points: missing.map((m) => `${m} still needs attention.`),
          ctaText: "Complete Profile",
          ctaLink: profileEdit,
          offerBody: "Complete your key profile sections this week to improve ranking and trust.",
          couponCode: "PROFILE15",
        },
        {
          key: "therapist_weekly_newsletter",
          eligible: isLive && !isIncomplete,
          segment: "Therapist - Profile Live",
          flow: "newsletter_12_week",
          template: "week_profile_optimization",
          subject: `Your weekly MasseurMatch growth tips for ${city}`,
          title: "Your weekly growth checklist",
          intro: `Hi ${name}, here is this week's visibility checklist for therapists in ${city}.`,
          points: [
            "Refresh your primary photo and short bio.",
            "Keep incall and outcall prices current.",
            "Update availability for this week.",
            "Check your profile views and contact taps in dashboard analytics.",
          ],
          ctaText: "View Dashboard",
          ctaLink: dashboard,
        },
        {
          key: "travel_mode_digest",
          eligible: Boolean(activeTravel),
          segment: "Therapist - Travel Mode Active",
          flow: "travel_mode",
          template: "travel_mode_active",
          subject: `Travel mode active: maximize demand in ${activeTravel?.destination_city || city}`,
          title: "Travel mode optimization",
          intro: `Hi ${name}, your travel listing is active. Here is how to capture more demand in ${activeTravel?.destination_city || city}.`,
          points: [
            "Update travel availability daily.",
            "Ensure photos and rates are current for destination clients.",
            "Use profile highlights to mention travel dates.",
          ],
          ctaText: "Update Availability",
          ctaLink: profileEdit,
          offerBody: "Travel profiles convert better when dates, rates, and city availability are updated daily.",
          couponCode: "TRAVEL10",
        },
        {
          key: "re_engagement_30",
          eligible: daysSinceUpdate >= 30 && daysSinceUpdate < 45,
          segment: "Therapist - Inactive 30 days",
          flow: "re_engagement",
          template: "re_engagement_day_30",
          subject: "We miss you - here is what is new on MasseurMatch",
          title: "Get your profile momentum back",
          intro: `Hi ${name}, it has been a while since your last update. Keep your listing strong in ${city} with a quick refresh today.`,
          points: [
            "Update profile details and availability.",
            "Review your photo gallery and featured image.",
            "Check current activity trends in your dashboard.",
          ],
          ctaText: "Log In to Dashboard",
          ctaLink: dashboard,
          offerBody: "A quick profile refresh can recover visibility and increase incoming contacts this week.",
          couponCode: "BACK10",
        },
        {
          key: "re_engagement_45",
          eligible: daysSinceUpdate >= 45,
          segment: "Therapist - Inactive 45 days",
          flow: "re_engagement",
          template: "re_engagement_day_45",
          subject: "Your profile may be losing visibility",
          title: "Reactivate your visibility",
          intro: `Hi ${name}, profiles not updated for long periods tend to rank lower. A quick update can improve visibility in ${city}.`,
          points: [
            "Confirm service availability and city coverage.",
            "Refresh your bio and specialties.",
            "Review your subscription and visibility tools.",
          ],
          ctaText: "Update My Profile",
          ctaLink: profileEdit,
          offerBody: "Reactivating your profile now helps recover search position before peak weekly demand.",
          couponCode: "RESTART15",
        },
        {
          key: "city_demand_digest",
          eligible: isLive,
          segment: "Therapist - Paid Active",
          flow: "city_demand_digest",
          template: "city_demand_digest_monthly",
          subject: `${city} Monthly Demand Report - ${today.toLocaleString("en-US", { month: "long", year: "numeric" })}`,
          title: "Monthly city demand digest",
          intro: `Hi ${name}, here is your monthly demand snapshot for ${city}.`,
          points: [
            "Review search activity trends for your city.",
            "Track profile views and contact taps.",
            "Update availability to improve conversion.",
          ],
          ctaText: "View Full Stats",
          ctaLink: dashboard,
          offerBody: "Use your city demand insights to improve conversion with better photos, pricing, and availability.",
          couponCode: "CITY10",
        },
        {
          key: "trial_ending_general",
          eligible: isLive,
          segment: "Therapist - Trial Ending",
          flow: "trial_ending",
          template: "trial_ending_general",
          subject: "Your trial may end soon - keep premium visibility",
          title: "Keep your premium features",
          intro: `Hi ${name}, if you are currently trialing a paid plan, ensure your billing is up to date to avoid losing premium placement.`,
          points: [
            "Check trial end date in billing.",
            "Add a valid payment method.",
            "Review available paid plans.",
          ],
          ctaText: "Manage Subscription",
          ctaLink: subscriptionUrl,
          offerBody: "Keep premium placement active and avoid visibility drops when your trial period ends.",
          couponCode: "TRIAL20",
        },
      ];

      for (const campaign of campaignDefs) {
        if (requestedCampaign && campaign.key !== requestedCampaign) continue;

        const isMonthlyDigest = campaign.key === "city_demand_digest";
        if (isMonthlyDigest) {
          const weekday = today.getUTCDay();
          const day = today.getUTCDate();
          const isFirstMonday = weekday === 1 && day <= 7;
          if (!isFirstMonday) continue;
        }

        if (!campaign.eligible) continue;

        const rendered = renderCampaignHtml({
          campaignKey: campaign.key,
          title: campaign.title,
          intro: campaign.intro,
          points: campaign.points,
          ctaText: campaign.ctaText,
          ctaLink: campaign.ctaLink,
          offerBody: campaign.offerBody,
          couponCode: campaign.couponCode,
        });

        const variantModeRaw = (Deno.env.get("LIFECYCLE_EMAIL_VARIANT_MODE") ?? "hybrid").toLowerCase();
        const variantMode = variantModeRaw === "compact" || variantModeRaw === "standard" || variantModeRaw === "hybrid"
          ? variantModeRaw
          : "hybrid";

        const idempotencyKey = `campaign:${campaign.key}:user:${profile.user_id}:date:${todayIso}:hour:${runStamp}`;

        await queueMarketingEmail(supabase, {
          userId: profile.user_id,
          email,
          name,
          city,
          segment: campaign.segment,
          campaignKey: campaign.key,
          flowKey: campaign.flow,
          templateKey: campaign.template,
          subject: campaign.subject,
          html: rendered.html,
          idempotencyKey,
          payload: {
            email_variant: rendered.variant,
            email_variant_mode: variantMode,
            offer_body: campaign.offerBody ?? null,
            coupon_code: campaign.couponCode ?? "WELCOME10",
            template_version: "v2",
          },
        });

        queuedCount += 1;
      }
    }

    logStep("Campaign run completed", { queued: queuedCount, requested_campaign: requestedCampaign });

    return new Response(
      JSON.stringify({ success: true, queued: queuedCount, campaign: requestedCampaign || "all" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("Campaign run failed", { error: message });

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
