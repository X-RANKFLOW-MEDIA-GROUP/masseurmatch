import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { requireRequestSession } from "@/app/api/_lib/session";
import {
  getDemandFreshness,
  getOpportunityScore,
  rankDemandRecords,
  type DemandScoreRecord,
} from "@/lib/demand-radar";

type Db = { from: (table: string) => any };

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const db = createSupabaseAdminClient() as unknown as Db;

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id,city,state,subscription_tier")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) throw new RouteError(404, "Provider profile not found.");

    const tier = String(profile.subscription_tier ?? "free").toLowerCase();
    const isAdmin = session.role === "admin" || session.email.endsWith("@masseurmatch.com");
    if (tier !== "elite" && !isAdmin) {
      throw new RouteError(403, "Demand Radar requires an active Elite plan.", "elite_required");
    }

    const { data, error } = await db
      .from("demand_scores")
      .select("id,city,state,neighborhood,score,trend,search_volume_index,competition_index,confidence,source,week_start,collected_at,expires_at")
      .eq("is_sample", false)
      .order("week_start", { ascending: false })
      .order("score", { ascending: false })
      .limit(500);

    if (error) throw new RouteError(500, error.message);

    const allRows = (data ?? []) as DemandScoreRecord[];
    const latestWeek = allRows[0]?.week_start ?? null;
    const latestRows = latestWeek ? allRows.filter((row) => row.week_start === latestWeek) : [];
    const ranked = rankDemandRecords(latestRows);
    const currentCity = String(profile.city ?? "").trim().toLowerCase();
    const currentState = String(profile.state ?? "").trim().toUpperCase();
    const localRows = ranked.filter(
      (row) => row.city.trim().toLowerCase() === currentCity && row.state.trim().toUpperCase() === currentState,
    );

    const freshestCollectedAt = ranked
      .map((row) => row.collected_at)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;

    return json({
      ok: true,
      market: {
        city: profile.city ?? null,
        state: profile.state ?? null,
        weekStart: latestWeek,
        freshness: getDemandFreshness(freshestCollectedAt),
        collectedAt: freshestCollectedAt,
      },
      local: localRows.map((row) => ({ ...row, opportunity_score: getOpportunityScore(row) })),
      opportunities: ranked.slice(0, 20).map((row) => ({
        ...row,
        opportunity_score: getOpportunityScore(row),
      })),
      disclaimer:
        "Demand Radar shows relative market signals. Scores do not guarantee searches, inquiries, bookings, or revenue.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
