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

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const supabase = createReferralSupabaseAdminClient();

    const { error: expireError } = await supabase.rpc("expire_referral_bonus_for_user", {
      p_user_id: session.userId,
    });
    if (expireError) throw new Error(expireError.message);

    const { data: dashboardData, error: dashboardError } = await supabase.rpc(
      "get_referral_dashboard",
      { p_user_id: session.userId },
    );
    if (dashboardError) throw new Error(dashboardError.message);

    const dashboard = parseDashboard(dashboardData);
    const summary = dashboard.summary ?? {};
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://masseurmatch.com").replace(/\/$/, "");
    const code = typeof summary.code === "string" ? summary.code : "";

    return json({
      ok: true,
      summary: {
        ...summary,
        referralLink: code ? `${appUrl}/signup?ref=${encodeURIComponent(code)}` : null,
      },
      referrals: dashboard.referrals ?? [],
    });
  } catch (error) {
    return errorResponse(error);
  }
}
