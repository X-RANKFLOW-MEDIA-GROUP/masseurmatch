import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

const WINDOW_DAYS = 30;

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const session = requireRequestSession(request);
    const admin = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, contact_clicks")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const since = new Date(Date.now() - (WINDOW_DAYS - 1) * 86_400_000);
    since.setUTCHours(0, 0, 0, 0);

    const { data: events, error: eventsError } = await admin
      .from("ranking_events")
      .select("event_name, created_at")
      .eq("profile_id", profile.id)
      .eq("event_name", "profile_viewed")
      .gte("created_at", since.toISOString());

    if (eventsError) throw new RouteError(500, eventsError.message);

    // Build a continuous 30-day series of daily visitors.
    const buckets = new Map<string, number>();
    for (let i = 0; i < WINDOW_DAYS; i += 1) {
      const d = new Date(since.getTime() + i * 86_400_000);
      buckets.set(dayKey(d.toISOString()), 0);
    }

    let windowViews = 0;
    for (const event of events ?? []) {
      if (!event.created_at) continue;
      const key = dayKey(event.created_at);
      if (!buckets.has(key)) continue;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
      windowViews += 1;
    }

    const series = Array.from(buckets.entries()).map(([date, visitors]) => ({ date, visitors }));

    return json({
      ok: true,
      windowDays: WINDOW_DAYS,
      series,
      totals: {
        windowViews,
        windowUniqueVisitors: windowViews,
        allTimeViews: windowViews,
        allTimeContactClicks: Number(profile.contact_clicks) || 0,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
