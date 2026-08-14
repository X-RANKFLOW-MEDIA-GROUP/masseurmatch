import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { requireRequestSession } from "@/app/api/_lib/session";
import {
  getCompetitionSignalStatus,
  getDemandFreshness,
  getMarketPercentile,
  getOpportunityScore,
  rankDemandRecords,
  type CompetitionSignalStatus,
  type DemandScoreRecord,
} from "@/lib/demand-radar";

type Db = { from: (table: string) => any };

type CollectionRunRecord = {
  run_id: string;
  status: "completed" | "partial";
  started_at: string;
  completed_at: string | null;
  markets_requested: number;
  markets_succeeded: number;
  markets_failed: number;
  rows_ingested: number;
  error_summary: unknown;
  metadata: Record<string, unknown> | null;
};

type FailedMarket = { city: string; state: string; reason: "upstream_rate_limit" | "collection_error" };

const SCORE_SELECT = "id,city,state,neighborhood,score,trend,spike_score,search_volume_index,competition_index,confidence,source,week_start,collected_at,expires_at,run_id,methodology_version,baseline_index,growth_pct,velocity_score,persistence_score,sample_size,score_components";

function toPreviewRow(row: DemandScoreRecord) {
  return {
    id: row.id,
    city: row.city,
    state: row.state,
    neighborhood: null,
    score: row.score,
    trend: row.trend,
    spike_score: row.spike_score,
    week_start: row.week_start,
    collected_at: row.collected_at,
    growth_pct: row.growth_pct ?? null,
    run_id: row.run_id ?? null,
  };
}

function toFullRow(row: DemandScoreRecord, competitionStatus: CompetitionSignalStatus) {
  return {
    ...row,
    opportunity_score: competitionStatus === "reliable" ? getOpportunityScore(row) : null,
  };
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function sameMarket(row: Pick<DemandScoreRecord, "city" | "state">, city: string, state: string) {
  return normalize(row.city) === normalize(city) && String(row.state ?? "").trim().toUpperCase() === String(state ?? "").trim().toUpperCase();
}

function safeFailedMarkets(value: unknown): FailedMarket[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const city = String(record.city ?? "").trim();
    const state = String(record.state ?? "").trim().toUpperCase();
    if (!city || state.length !== 2) return [];
    const error = String(record.error ?? "");
    return [{ city, state, reason: error.includes("429") ? "upstream_rate_limit" : "collection_error" } as FailedMarket];
  });
}

function dateWeeksAgo(weeks: number) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() - weeks * 7);
  return value.toISOString().slice(0, 10);
}

function mostRecent(rows: DemandScoreRecord[]) {
  return [...rows].sort((a, b) => String(b.collected_at ?? "").localeCompare(String(a.collected_at ?? "")))[0] ?? null;
}

function uniqueLocalHistory(rows: DemandScoreRecord[], city: string, state: string, currentWeek: string | null, current: DemandScoreRecord | null) {
  const byWeek = new Map<string, DemandScoreRecord>();
  for (const row of rows) {
    if (!sameMarket(row, city, state) || (currentWeek && row.week_start === currentWeek)) continue;
    const existing = byWeek.get(row.week_start);
    if (!existing || String(row.collected_at ?? "") > String(existing.collected_at ?? "")) byWeek.set(row.week_start, row);
  }
  if (current) byWeek.set(current.week_start, current);
  return [...byWeek.values()].sort((a, b) => a.week_start.localeCompare(b.week_start)).slice(-12);
}

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
    const hasFullAccess = tier === "elite" || session.role === "admin";

    const { data: latestRunRaw, error: runError } = await db
      .from("demand_collection_runs")
      .select("run_id,status,started_at,completed_at,markets_requested,markets_succeeded,markets_failed,rows_ingested,error_summary,metadata")
      .in("status", ["completed", "partial"])
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (runError) throw new RouteError(500, runError.message);

    const latestRun = (latestRunRaw ?? null) as CollectionRunRecord | null;
    if (!latestRun) {
      return json({
        ok: true,
        access: { tier, full: hasFullAccess, preview: !hasFullAccess },
        collection: { status: "unknown", runId: null, coveragePct: 0, marketsRequested: 0, marketsSucceeded: 0, marketsFailed: 0, rowsIngested: 0, completedAt: null, failedMarkets: [] },
        market: { city: profile.city ?? null, state: profile.state ?? null, weekStart: null, freshness: "unknown", collectedAt: null },
        local: [],
        localFallback: null,
        localHistory: [],
        opportunities: [],
        fastestRising: [],
        highestDemand: [],
        insights: null,
        methodology: { version: null, source: null, competitionStatus: "unavailable", opportunityStatus: "unavailable" },
        disclaimer: "Demand Radar shows relative market signals. Scores do not guarantee searches, inquiries, contacts, or revenue.",
      });
    }

    const { data: currentData, error: currentError } = await db
      .from("demand_scores")
      .select(SCORE_SELECT)
      .eq("is_sample", false)
      .eq("run_id", latestRun.run_id)
      .limit(500);
    if (currentError) throw new RouteError(500, currentError.message);

    const currentRows = (currentData ?? []) as DemandScoreRecord[];
    const methodologyVersion = typeof latestRun.metadata?.methodology_version === "string" ? latestRun.metadata.methodology_version : currentRows[0]?.methodology_version ?? null;

    let historyQuery = db
      .from("demand_scores")
      .select(SCORE_SELECT)
      .eq("is_sample", false)
      .gte("week_start", dateWeeksAgo(13))
      .order("week_start", { ascending: false })
      .order("collected_at", { ascending: false })
      .limit(1000);
    if (methodologyVersion) historyQuery = historyQuery.eq("methodology_version", methodologyVersion);
    const { data: historyData, error: historyError } = await historyQuery;
    if (historyError) throw new RouteError(500, historyError.message);

    const historyRows = (historyData ?? []) as DemandScoreRecord[];
    const competitionStatus = getCompetitionSignalStatus(currentRows);
    const ranked = rankDemandRecords(currentRows, { useOpportunity: competitionStatus === "reliable" });
    const currentCity = String(profile.city ?? "").trim();
    const currentState = String(profile.state ?? "").trim().toUpperCase();
    const localRows = ranked.filter((row) => sameMarket(row, currentCity, currentState));
    const localPrimary = localRows.find((row) => !row.neighborhood) ?? localRows[0] ?? null;
    const currentWeek = currentRows.map((row) => row.week_start).sort().at(-1) ?? null;

    const previousWeek = historyRows
      .map((row) => row.week_start)
      .filter((week) => !currentWeek || week < currentWeek)
      .sort()
      .at(-1) ?? null;
    const previousRows = previousWeek ? historyRows.filter((row) => row.week_start === previousWeek) : [];
    const previousCompetitionStatus = getCompetitionSignalStatus(previousRows);
    const previousRanked = rankDemandRecords(previousRows, { useOpportunity: previousCompetitionStatus === "reliable" });
    const previousLocal = previousRanked.find((row) => sameMarket(row, currentCity, currentState)) ?? null;

    const currentRank = localPrimary ? ranked.findIndex((row) => row.id === localPrimary.id) + 1 : null;
    const previousRank = previousLocal ? previousRanked.findIndex((row) => row.id === previousLocal.id) + 1 : null;
    const localHistory = uniqueLocalHistory(historyRows, currentCity, currentState, currentWeek, localPrimary);
    const lastKnown = mostRecent(historyRows.filter((row) => sameMarket(row, currentCity, currentState)));
    const localFallback = !localPrimary && lastKnown ? lastKnown : null;

    const fastestRising = [...currentRows].sort((a, b) => {
      const growth = (b.growth_pct ?? Number.NEGATIVE_INFINITY) - (a.growth_pct ?? Number.NEGATIVE_INFINITY);
      if (Number.isFinite(growth) && growth !== 0) return growth;
      if ((b.spike_score ?? 0) !== (a.spike_score ?? 0)) return (b.spike_score ?? 0) - (a.spike_score ?? 0);
      return b.score - a.score;
    });
    const highestDemand = [...currentRows].sort((a, b) => b.score - a.score || (b.spike_score ?? 0) - (a.spike_score ?? 0));

    const completedAt = latestRun.completed_at ?? latestRun.started_at;
    const coveragePct = latestRun.markets_requested > 0 ? Math.round((latestRun.markets_succeeded / latestRun.markets_requested) * 1000) / 10 : 0;
    const market = {
      city: profile.city ?? null,
      state: profile.state ?? null,
      weekStart: currentWeek,
      freshness: getDemandFreshness(completedAt),
      collectedAt: completedAt,
    };
    const insights = localPrimary ? {
      rank: currentRank,
      totalMarkets: ranked.length,
      percentile: currentRank ? getMarketPercentile(currentRank, ranked.length) : null,
      previousRank,
      rankChange: currentRank && previousRank ? previousRank - currentRank : null,
      demandChange: previousLocal ? localPrimary.score - previousLocal.score : null,
      spikeChange: previousLocal ? (localPrimary.spike_score ?? 0) - (previousLocal.spike_score ?? 0) : null,
      growthPct: localPrimary.growth_pct ?? null,
      previousWeek,
    } : null;
    const collection = {
      status: latestRun.status,
      runId: latestRun.run_id,
      coveragePct,
      marketsRequested: latestRun.markets_requested,
      marketsSucceeded: latestRun.markets_succeeded,
      marketsFailed: latestRun.markets_failed,
      rowsIngested: latestRun.rows_ingested,
      completedAt: latestRun.completed_at,
      failedMarkets: safeFailedMarkets(latestRun.error_summary),
    };
    const source = typeof latestRun.metadata?.source === "string" ? latestRun.metadata.source : currentRows[0]?.source ?? null;
    const methodology = {
      version: methodologyVersion,
      source,
      competitionStatus,
      opportunityStatus: competitionStatus === "reliable" ? "reliable" : competitionStatus === "experimental" ? "experimental" : "unavailable",
    };

    if (!hasFullAccess) {
      return json({
        ok: true,
        access: { tier, full: false, preview: true },
        collection,
        market,
        local: localRows.slice(0, 1).map(toPreviewRow),
        localFallback: localFallback ? toPreviewRow(localFallback) : null,
        localHistory: localHistory.map(toPreviewRow),
        opportunities: ranked.slice(0, 3).map(toPreviewRow),
        fastestRising: fastestRising.slice(0, 3).map(toPreviewRow),
        highestDemand: highestDemand.slice(0, 3).map(toPreviewRow),
        insights,
        methodology,
        disclaimer: "Demand Radar Preview shows relative market signals. Scores do not guarantee searches, inquiries, contacts, or revenue.",
      });
    }

    return json({
      ok: true,
      access: { tier, full: true, preview: false },
      collection,
      market,
      local: localRows.map((row) => toFullRow(row, competitionStatus)),
      localFallback: localFallback ? toFullRow(localFallback, competitionStatus) : null,
      localHistory: localHistory.map((row) => toFullRow(row, competitionStatus)),
      opportunities: ranked.slice(0, 20).map((row) => toFullRow(row, competitionStatus)),
      fastestRising: fastestRising.slice(0, 20).map((row) => toFullRow(row, competitionStatus)),
      highestDemand: highestDemand.slice(0, 20).map((row) => toFullRow(row, competitionStatus)),
      insights,
      methodology,
      disclaimer: "Demand Radar shows relative Google Trends market signals. Scores are directional intelligence, not absolute search volume, booking forecasts, or guaranteed revenue.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
