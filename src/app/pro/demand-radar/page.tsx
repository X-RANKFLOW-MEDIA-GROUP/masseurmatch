"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, Loader2, LockKeyhole, MapPin, Radar, RefreshCw } from "lucide-react";

import { getDemandLabel, type DemandTrend } from "@/lib/demand-radar";

type RadarRow = {
  id: string;
  city: string;
  state: string;
  neighborhood?: string | null;
  score: number;
  trend: DemandTrend;
  week_start: string;
  search_volume_index?: number;
  competition_index?: number;
  opportunity_score?: number;
};

type RadarResponse = {
  ok: boolean;
  access: { tier: string; full: boolean; preview: boolean };
  dataMode: "preview-sample" | "live";
  market: { city: string | null; state: string | null; weekStart: string | null };
  local: RadarRow[];
  opportunities: RadarRow[];
  disclaimer: string;
  error?: string;
};

function trendLabel(trend: DemandTrend) {
  if (trend === "rising") return "Rising";
  if (trend === "falling") return "Falling";
  return "Stable";
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-2xl border border-[#E8DFD8] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81766F]">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-[#211C19]">{value}</p>
      <p className="mt-1 text-xs text-[#756C66]">{detail}</p>
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
      if (!response.ok) throw new Error(payload.error ?? "Demand Radar could not be loaded.");
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Demand Radar could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const local = useMemo(() => data?.local[0] ?? null, [data]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#8B1E2D]" /></div>;
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

  const sample = data.dataMode === "preview-sample";
  const preview = data.access.preview;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 md:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#8B1E2D]">
            <Radar className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">{preview ? "Market Intelligence Preview" : "Elite Market Intelligence"}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#211C19]">Demand Radar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716862]">
            See relative demand and direction by market. Elite members unlock deeper opportunity and competition signals.
          </p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DED3CC] bg-white px-4 py-2.5 text-sm font-semibold text-[#4F4742] shadow-sm hover:bg-[#FAF7F4]">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </header>

      {sample ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Preview dataset. These values are sample signals for the dashboard experience and are not current market measurements.
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E8DFD8] bg-[#FCF8F5] px-4 py-3 text-xs text-[#6D625B]">
          Live market signals{data.market.weekStart ? ` · Week of ${new Date(`${data.market.weekStart}T12:00:00`).toLocaleDateString()}` : ""}
        </div>
      )}

      {local ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#8B1E2D]" />
            <h2 className="font-display text-xl font-semibold text-[#211C19]">Your market: {local.city}, {local.state}</h2>
          </div>
          <div className={`grid gap-4 ${preview ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
            <Metric label="Demand" value={preview ? getDemandLabel(local.score) : local.score} detail={preview ? `Relative score ${local.score}/100` : getDemandLabel(local.score)} />
            <Metric label="Trend" value={trendLabel(local.trend)} detail="Direction versus the market baseline" />
            {!preview ? <Metric label="Opportunity" value={local.opportunity_score ?? "—"} detail="Demand adjusted for competition" /> : null}
            {!preview ? <Metric label="Competition" value={local.competition_index ?? "—"} detail="Relative competitive pressure" /> : null}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DCCFC7] bg-white p-6 text-sm text-[#716862]">
          No signal is available for {data.market.city ?? "your current city"} yet. Available markets are shown below.
        </div>
      )}

      {preview ? (
        <div className="rounded-3xl border border-[#E4D8D1] bg-[#FCF8F5] p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9EDEE] text-[#8B1E2D]"><LockKeyhole className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8B1E2D]">Elite intelligence</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-[#211C19]">Unlock the full Demand Radar</h2>
              <p className="mt-2 text-sm leading-6 text-[#716862]">Compare more markets and see opportunity and competition metrics.</p>
              <Link href="/pro/subscription" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#741824]">
                View Elite plan <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-3xl border border-[#E8DFD8] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#EEE7E1] px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9EDEE] text-[#8B1E2D]"><BarChart3 className="h-4 w-4" /></div>
          <div>
            <h2 className="font-display text-lg font-semibold text-[#211C19]">{preview ? "Market preview" : "Top market opportunities"}</h2>
            <p className="text-xs text-[#756C66]">{preview ? "Three city-level signals" : "Markets ranked by relative opportunity"}</p>
          </div>
        </div>
        {data.opportunities.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#716862]">Market signals are being prepared.</div>
        ) : (
          <div className="divide-y divide-[#F0E9E4]">
            {data.opportunities.map((row, index) => (
              <div key={row.id} className="grid gap-4 px-6 py-4 md:grid-cols-[44px_1.5fr_repeat(2,minmax(110px,1fr))] md:items-center">
                <div className="font-display text-lg font-semibold text-[#A59A92]">{index + 1}</div>
                <div>
                  <p className="font-semibold text-[#28221F]">{row.city}, {row.state}</p>
                  <p className="mt-1 text-xs text-[#7A716B]">{trendLabel(row.trend)}</p>
                </div>
                <div><p className="text-xs text-[#8A817B]">Demand</p><p className="font-semibold text-[#211C19]">{preview ? getDemandLabel(row.score) : row.score}</p></div>
                <div><p className="text-xs text-[#8A817B]">Trend</p><p className="font-semibold text-[#211C19]">{trendLabel(row.trend)}</p></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-[#7B726C]">{data.disclaimer}</p>
    </div>
  );
}
