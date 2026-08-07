"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, Loader2, LockKeyhole, MapPin, Radar, RefreshCw } from "lucide-react";

import { getDemandLabel, type DataFreshness, type DemandTrend } from "@/lib/demand-radar";

type RadarRow = {
  id: string;
  city: string;
  state: string;
  neighborhood: string | null;
  score: number;
  trend: DemandTrend;
  week_start: string;
  collected_at: string | null;
  search_volume_index?: number;
  competition_index?: number;
  confidence?: number | null;
  source?: string | null;
  opportunity_score?: number;
};

type RadarResponse = {
  ok: boolean;
  access: {
    tier: string;
    full: boolean;
    preview: boolean;
  };
  market: {
    city: string | null;
    state: string | null;
    weekStart: string | null;
    freshness: DataFreshness;
    collectedAt: string | null;
  };
  local: RadarRow[];
  opportunities: RadarRow[];
  disclaimer: string;
  error?: string;
};

const freshnessCopy: Record<DataFreshness, string> = {
  fresh: "Fresh data",
  delayed: "Delayed data",
  stale: "Stale data",
  unknown: "Awaiting data",
};

function trendCopy(trend: DemandTrend) {
  if (trend === "rising") return "Rising";
  if (trend === "falling") return "Falling";
  return "Stable";
}

function ScoreCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-2xl border border-[#E8DFD8] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81766F]">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-[#211C19]">{value}</p>
      <p className="mt-1 text-xs text-[#756C66]">{detail}</p>
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="rounded-3xl border border-[#E4D8D1] bg-[#FCF8F5] p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9EDEE] text-[#8B1E2D]">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8B1E2D]">Elite intelligence</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#211C19]">Unlock the full Demand Radar</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716862]">
            See opportunity scores, competition, confidence, deeper market rankings, and the full set of current signals.
          </p>
          <Link
            href="/pro/subscription"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#741824]"
          >
            View Elite plan
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DemandRadarPage() {
  const [data, setData] = useState<RadarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pro/demand-radar", { cache: "no-store" });
      const payload = (await response.json()) as RadarResponse;
      if (!response.ok) {
        setData(payload);
        setError(payload.error ?? "Demand Radar could not be loaded.");
        return;
      }
      setData(payload);
    } catch {
      setError("Demand Radar could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const localPrimary = useMemo(
    () => data?.local.find((row) => !row.neighborhood) ?? data?.local[0] ?? null,
    [data],
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B1E2D]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="font-semibold text-rose-900">Demand Radar unavailable</p>
          <p className="mt-1 text-sm text-rose-700">{error}</p>
          <button onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-800">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const isPreview = data.access.preview && !data.access.full;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 md:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#8B1E2D]">
            <Radar className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">
              {isPreview ? "Market Intelligence Preview" : "Elite Market Intelligence"}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#211C19]">Demand Radar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716862]">
            {isPreview
              ? "See current relative demand and trend signals for your market plus a preview of leading cities."
              : "Compare relative demand, competition, and data confidence before changing markets or publishing travel dates."}
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DED3CC] bg-white px-4 py-2.5 text-sm font-semibold text-[#4F4742] shadow-sm hover:bg-[#FAF7F4]"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </header>

      <div className="rounded-2xl border border-[#E8DFD8] bg-[#FCF8F5] px-4 py-3 text-xs text-[#6D625B]">
        {freshnessCopy[data.market.freshness]}
        {data.market.collectedAt ? ` · Updated ${new Date(data.market.collectedAt).toLocaleString()}` : ""}
        {data.market.weekStart ? ` · Week of ${new Date(`${data.market.weekStart}T12:00:00`).toLocaleDateString()}` : ""}
      </div>

      {localPrimary ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#8B1E2D]" />
            <h2 className="font-display text-xl font-semibold text-[#211C19]">
              Your market: {localPrimary.city}, {localPrimary.state}
            </h2>
          </div>
          {isPreview ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreCard label="Demand" value={getDemandLabel(localPrimary.score)} detail={`Relative demand score ${localPrimary.score}/100`} />
              <ScoreCard label="Trend" value={trendCopy(localPrimary.trend)} detail="Current direction versus the recent baseline" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreCard label="Demand" value={localPrimary.score} detail={getDemandLabel(localPrimary.score)} />
              <ScoreCard label="Opportunity" value={localPrimary.opportunity_score ?? "—"} detail="Demand adjusted for competition and confidence" />
              <ScoreCard label="Competition" value={localPrimary.competition_index ?? "—"} detail="Lower can mean more room to stand out" />
              <ScoreCard label="Confidence" value={localPrimary.confidence ?? "—"} detail={trendCopy(localPrimary.trend)} />
            </div>
          )}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DCCFC7] bg-white p-6 text-sm text-[#716862]">
          No current market signal is available for {data.market.city ?? "your city"}. Available market signals are shown below.
        </div>
      )}

      {isPreview ? <UpgradeCard /> : null}

      <section className="rounded-3xl border border-[#E8DFD8] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#EEE7E1] px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9EDEE] text-[#8B1E2D]">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-[#211C19]">
              {isPreview ? "Market preview" : "Top market opportunities"}
            </h2>
            <p className="text-xs text-[#756C66]">
              {isPreview ? "Three current non-sample city signals" : "Latest non-sample market signals ranked by opportunity"}
            </p>
          </div>
        </div>

        {data.opportunities.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#716862]">
            No live demand data has been ingested yet. Sample migration records are intentionally hidden.
          </div>
        ) : (
          <div className="divide-y divide-[#F0E9E4]">
            {data.opportunities.map((row, index) => (
              <div
                key={row.id}
                className={
                  isPreview
                    ? "grid gap-4 px-6 py-4 md:grid-cols-[44px_1.5fr_repeat(2,minmax(100px,1fr))] md:items-center"
                    : "grid gap-4 px-6 py-4 md:grid-cols-[44px_1.5fr_repeat(4,minmax(90px,1fr))] md:items-center"
                }
              >
                <div className="font-display text-lg font-semibold text-[#A59A92]">{index + 1}</div>
                <div>
                  <p className="font-semibold text-[#28221F]">
                    {row.neighborhood ? `${row.neighborhood}, ` : ""}{row.city}, {row.state}
                  </p>
                  <p className="mt-1 text-xs text-[#7A716B]">
                    {trendCopy(row.trend)}{!isPreview && row.source ? ` · ${row.source}` : ""}
                  </p>
                </div>
                {isPreview ? (
                  <>
                    <div><p className="text-xs text-[#8A817B]">Demand</p><p className="font-semibold text-[#211C19]">{getDemandLabel(row.score)}</p></div>
                    <div><p className="text-xs text-[#8A817B]">Trend</p><p className="font-semibold text-[#211C19]">{trendCopy(row.trend)}</p></div>
                  </>
                ) : (
                  <>
                    <div><p className="text-xs text-[#8A817B]">Opportunity</p><p className="font-semibold text-[#211C19]">{row.opportunity_score ?? "—"}</p></div>
                    <div><p className="text-xs text-[#8A817B]">Demand</p><p className="font-semibold text-[#211C19]">{row.score}</p></div>
                    <div><p className="text-xs text-[#8A817B]">Competition</p><p className="font-semibold text-[#211C19]">{row.competition_index ?? "—"}</p></div>
                    <div><p className="text-xs text-[#8A817B]">Confidence</p><p className="font-semibold text-[#211C19]">{row.confidence ?? "—"}</p></div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {isPreview ? (
        <div className="flex justify-center">
          <Link href="/pro/subscription" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B1E2D] hover:underline">
            Unlock full Demand Radar
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}

      <p className="text-xs leading-5 text-[#7B726C]">{data.disclaimer}</p>
    </div>
  );
}
