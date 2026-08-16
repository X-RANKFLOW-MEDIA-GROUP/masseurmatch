import { errorResponse, json } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/api/_lib/session";
import type { Json } from "@/integrations/supabase/app-database";
import { createReferralSupabaseAdminClient } from "./supabase";

type ReferralDashboardPayload = {
  summary?: Record<string, unknown> | null;
  referrals?: Array<Record<string, unknown> | null> | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseDashboard(value: Json | null): ReferralDashboardPayload {
  if (!isRecord(value)) return {};

  const summary = isRecord(value.summary) ? value.summary : undefined;
  let referrals: Array<Record<string, unknown>> | undefined;

  if (Array.isArray(value.referrals)) {
    referrals = [];
    for (const referral of value.referrals) {
      if (isRecord(referral)) referrals.push(referral);
    }
  }

  return { summary, referrals };
}

function emptySummary() {
  return {
    code: "",
    referralCount: 0,
    premiumMonthsEarned: 0,
    pendingReferrals: 0,
    paidReferrals: 0,
    maxPremiumMonths: 6,
    remainingPremiumMonths: 6,
    bonusExpiresAt: null,
    bonusTier: null,
    referralLink: null,
  };
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const supabase = createReferralSupabaseAdminClient();

    // Expiration is maintenance work, not a prerequisite for rendering the
    // referral dashboard. A stale/missing expiration RPC must not take the
    // entire page down.
    const { error: expireError } = await supabase.rpc("expire_referral_bonus_for_user", {
      p_user_id: session.userId,
    });
    if (expireError) {
      console.error("[api/pro/referrals] unable to expire referral bonus", {
        userId: session.userId,
        code: expireError.code,
        message: expireError.message,
      });
    }

    const { data: dashboardData, error: dashboardError } = await supabase.rpc(
      "get_referral_dashboard",
      { p_user_id: session.userId },
    );

    if (dashboardError) {
      console.error("[api/pro/referrals] unable to load referral dashboard", {
        userId: session.userId,
        code: dashboardError.code,
        message: dashboardError.message,
      });

      // Keep the authenticated page usable while a referral migration/RPC is
      // being rolled out or repaired. The client receives a stable response
      // shape instead of a 500 that cascades into the page error state.
      return json({
        ok: true,
        summary: emptySummary(),
        referrals: [],
        unavailable: true,
      });
    }

    const dashboard = parseDashboard(dashboardData);
    const summary = dashboard.summary ?? {};
    let appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://masseurmatch.com").replace(/\/$/, "");
    appUrl = appUrl.replace("://www.", "://"); // Normalize to remove www. prefix
    const code = typeof summary.code === "string" ? summary.code : "";

    return json({
      ok: true,
      summary: {
        ...emptySummary(),
        ...summary,
        referralLink: code ? `${appUrl}/signup?ref=${encodeURIComponent(code)}` : null,
      },
      referrals: dashboard.referrals ?? [],
      unavailable: false,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
