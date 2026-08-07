import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

const WINDOW_DAYS = 30;

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function emptySeries(since: Date) {
  return Array.from({ length: WINDOW_DAYS }, (_, index) => ({
    date: dayKey(new Date(since.getTime() + index * 86_400_000).toISOString()),
    visitors: 0,
  }));
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const admin = createSupabaseAdminClient();
    const since = new Date(Date.now() - (WINDOW_DAYS - 1) * 86_400_000);
    since.setUTCHours(0, 0, 0, 0);

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
        series: emptySeries(since),
        totals: {
          windowViews: 0,
          windowUniqueVisitors: 0,
          allTimeViews: 0,
          allTimeContactClicks: 0,
        },
      });
    }

    const [windowResult, allTimeResult] = await Promise.all([
      admin
        .from("profile_view_analytics")
        .select("created_at, session_id")
        .eq("profile_id", profile.id)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(10_000),
      admin
        .from("profile_view_analytics")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id),
    ]);

    if (windowResult.error) throw new RouteError(500, windowResult.error.message);
    if (allTimeResult.error) throw new RouteError(500, allTimeResult.error.message);

    const buckets = new Map(emptySeries(since).map((point) => [point.date, 0]));
    const uniqueSessions = new Set<string>();

    for (const event of windowResult.data ?? []) {
      if (!event.created_at) continue;
      const key = dayKey(event.created_at);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
      if (event.session_id) uniqueSessions.add(event.session_id);
    }

    const series = Array.from(buckets.entries()).map(([date, visitors]) => ({ date, visitors }));
    const windowViews = (windowResult.data ?? []).length;
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
        windowUniqueVisitors: uniqueSessions.size || windowViews,
        allTimeViews: allTimeResult.count ?? windowViews,
        allTimeContactClicks: Number(profile.contact_clicks) || 0,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
