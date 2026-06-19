import { errorResponse, json } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId } from "@/app/_lib/store";

export async function GET(request: Request) {
  try {
    const session = requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    if (!profile) {
      return json({ ok: true, impressions: 0, views: 0, favorites: 0, daily: [] });
    }

    const supabase = createSupabaseAdminClient();

    const { data: daily } = await supabase
      .from("therapist_analytics_daily")
      .select("*")
      .eq("therapist_profile_id", profile.id)
      .order("event_date", { ascending: false })
      .limit(30);

    let impressions = 0;
    let views = 0;
    let favorites = 0;

    for (const row of daily ?? []) {
      const name = (row as Record<string, unknown>).event_name as string;
      const count = Number((row as Record<string, unknown>).event_count) || 0;
      if (name === "search_impression") impressions += count;
      else if (name === "profile_view") views += count;
      else if (name === "save_favorite") favorites += count;
    }

    return json({ ok: true, impressions, views, favorites, daily: daily ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}
