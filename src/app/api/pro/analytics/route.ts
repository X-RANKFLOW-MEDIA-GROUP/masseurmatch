import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

const WINDOW_DAYS = 30;

type AnalyticsRpcResult = {
  series?: Array<{ date?: string; views?: number }>;
  windowViews?: number;
  windowUniqueVisitors?: number;
  allTimeViews?: number;
};

type RpcClient = ReturnType<typeof createSupabaseAdminClient> & {
  rpc: (
    name: string,
    params?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

function emptySeries() {
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000);
  const firstDay = new Date(since);
  firstDay.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const points: Array<{ date: string; visitors: number }> = [];
  for (let cursor = firstDay.getTime(); cursor <= today.getTime(); cursor += 86_400_000) {
    points.push({ date: new Date(cursor).toISOString().slice(0, 10), visitors: 0 });
  }
  return points;
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const admin = createSupabaseAdminClient() as RpcClient;
    const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, contact_clicks, visibility_status, profile_status, status, is_active")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);

    if (!profile?.id) {
      return json({
        ok: true,
        windowDays: WINDOW_DAYS,
        isLive: false,
        series: emptySeries(),
        totals: {
          windowViews: 0,
          windowUniqueVisitors: 0,
          allTimeViews: 0,
          allTimeContactClicks: 0,
        },
      });
    }

    const { data: analytics, error: analyticsError } = await admin.rpc("get_profile_view_analytics", {
      p_profile_id: profile.id,
      p_since: since,
    });

    if (analyticsError) throw new RouteError(500, analyticsError.message);

    const result = (analytics ?? {}) as AnalyticsRpcResult;
    const series = (result.series ?? []).map((point) => ({
      date: String(point.date ?? ""),
      visitors: Number(point.views) || 0,
    }));

    const windowViews = Number(result.windowViews) || 0;
    const isLive = Boolean(
      profile.is_active ||
      profile.visibility_status === "public" ||
      profile.profile_status === "approved" ||
      profile.status === "approved" ||
      profile.status === "active"
    );

    return json({
      ok: true,
      windowDays: WINDOW_DAYS,
      isLive,
      series,
      totals: {
        windowViews,
        windowUniqueVisitors: Number(result.windowUniqueVisitors) || 0,
        allTimeViews: Number(result.allTimeViews) || windowViews,
        allTimeContactClicks: Number(profile.contact_clicks) || 0,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
