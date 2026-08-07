import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { requireRequestSession } from "@/app/api/_lib/session";
import { getOpportunityScore } from "@/lib/demand-radar";

type Db = { from: (table: string) => any };

type DemandRow = {
  id: string;
  city: string;
  state: string;
  neighborhood: string | null;
  score: number;
  trend: "rising" | "stable" | "falling";
  search_volume_index: number;
  competition_index: number;
  week_start: string;
  created_at: string;
};

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const db = createSupabaseAdminClient() as unknown as Db;

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("city,state,subscription_tier")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) throw new RouteError(404, "Provider profile not found.");

    const tier = String(profile.subscription_tier ?? "free").toLowerCase();
    const full = tier === "elite" || session.role === "admin";

    const { data, error } = await db
      .from("demand_scores")
      .select("id,city,state,neighborhood,score,trend,search_volume_index,competition_index,week_start,created_at")
      .order("week_start", { ascending: false })
      .order("score", { ascending: false })
      .limit(250);

    if (error) throw new RouteError(500, error.message);

    const rows = (data ?? []) as DemandRow[];
    const latestWeek = rows[0]?.week_start ?? null;
    const latest = latestWeek ? rows.filter((row) => row.week_start === latestWeek) : [];
    const currentCity = String(profile.city ?? "").trim().toLowerCase();
    const currentState = String(profile.state ?? "").trim().toUpperCase();
    const local = latest.filter(
      (row) => row.city.trim().toLowerCase() === currentCity && row.state.trim().toUpperCase() === currentState,
    );
    const ranked = [...latest].sort((a, b) => getOpportunityScore(b) - getOpportunityScore(a));
    const isPreviewDataset = latestWeek === "2026-06-08";

    const previewRow = (row: DemandRow) => ({
      id: row.id,
      city: row.city,
      state: row.state,
      score: row.score,
      trend: row.trend,
      week_start: row.week_start,
    });

    return json({
      ok: true,
      access: { tier, full, preview: !full },
      dataMode: isPreviewDataset ? "preview-sample" : "live",
      market: { city: profile.city ?? null, state: profile.state ?? null, weekStart: latestWeek },
      local: full
        ? local.map((row) => ({ ...row, opportunity_score: getOpportunityScore(row) }))
        : local.filter((row) => !row.neighborhood).slice(0, 1).map(previewRow),
      opportunities: full
        ? ranked.slice(0, 20).map((row) => ({ ...row, opportunity_score: getOpportunityScore(row) }))
        : ranked.filter((row) => !row.neighborhood).slice(0, 3).map(previewRow),
      disclaimer: isPreviewDataset
        ? "Demand Radar Preview is currently showing a clearly labeled sample dataset while live collection is prepared. Do not treat these scores as current market measurements."
        : "Demand Radar shows relative market signals and does not guarantee searches, inquiries, contacts, or revenue.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
