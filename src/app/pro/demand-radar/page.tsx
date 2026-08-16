"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Database,
  Loader2,
  LockKeyhole,
  MapPin,
  Radar,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  formatUsDate,
  getDemandLabel,
  getMarketSignalStatus,
  getSpikeLabel,
  getSpikeWindow,
  type DataFreshness,
  type DemandTrend,
} from "@/lib/demand-radar";

type RadarRow = {
  id: string;
  city: string;
  state: string;
  neighborhood: string | null;
  score: number;
  trend: DemandTrend;
  spike_score: number | null;
  week_start: string;
  collected_at: string | null;
  search_volume_index?: number;
  competition_index?: number | null;
  confidence?: number | null;
  source?: string | null;
  opportunity_score?: number | null;
  growth_pct?: number | null;
  run_id?: string | null;
};

type CollectionHealth = {
  status: "completed" | "partial" | "unknown";
  runId: string | null;
  coveragePct: number;
  marketsRequested: number;
  marketsSucceeded: number;
  marketsFailed: number;
  rowsIngested: number;
  completedAt: string | null;
  failedMarkets: Array<{ city: string; state: string; reason: "upstream_rate_limit" | "collection_error" }>;
};

type RadarInsights = {
  rank: number | null;
  totalMarkets: number;
  percentile: number | null;
  previousRank: number | null;
  rankChange: number | null;
  demandChange: number | null;
  spikeChange: number | null;
  growthPct: number | null;
  previousWeek: string | null;
};

type RadarResponse = {
  ok: boolean;
  access: { tier: string; full: boolean; preview: boolean };
  collection: CollectionHealth;
  market: { city: string | null; state: string | null; weekStart: string | null; freshness: DataFreshness; collectedAt: string | null };
  local: RadarRow[];
  localFallback: RadarRow | null;
  localHistory: RadarRow[];
  opportunities: RadarRow[];
  fastestRising: RadarRow[];
  highestDemand: RadarRow[];
  insights: RadarInsights | null;
  methodology: { version: string | null; source: string | null; competitionStatus: "reliable" | "experimental" | "unavailable"; opportunityStatus: "reliable" | "experimental" | "unavailable" };
  disclaimer: string;
  error?: string;
};

type RankingView = "opportunity" | "rising" | "demand";

const freshnessCopy: Record<DataFreshness, string> = {
  fresh: "Fresh data",
  delayed: "Delayed data",
  stale: "Stale data",
  unknown: "Awaiting data",
};

function trendCopy(trend: DemandTrend) {
  return trend === "rising" ? "Rising" : trend === "falling" ? "Falling" : "Stable";
}

function shortDate(value: string) {
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(parsed);
}

function signed(value: number | null | undefined, suffix = "") {
  if (value == null) return "—";
  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

function signalCopy(row: RadarRow) {
  const status = getMarketSignalStatus({ trend: row.trend, spike_score: row.spike_score ?? null, confidence: row.confidence ?? null });
  return status === "spiking" ? "SPIKING" : status === "accelerating" ? "ACCELERATING" : status === "building" ? "BUILDING" : "NORMAL";
}

function Delta({ value, suffix = "" }: { value: number | null | undefined; suffix?: string }) {
  if (value == null || value === 0) return <span className="text-xs text-[#81766F]">No material change</span>;
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-700" : "text-rose-700"}`}>
      {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {signed(value, suffix)}
    </span>
  );
}

function ScoreCard({ label, value, detail, delta, deltaSuffix }: { label: string; value: string | number; detail: string; delta?: number | null; deltaSuffix?: string }) {
  return (
    <div className="rounded-2xl border border-[#E8DFD8] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81766F]">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-[#211C19]">{value}</p>
      <div className="mt-1 flex min-h-5 items-center justify-between gap-2">
        <p className="text-xs text-[#756C66]">{detail}</p>
        {delta !== undefined ? <Delta value={delta} suffix={deltaSuffix} /> : null}
      </div>
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="rounded-3xl border border-[#E4D8D1] bg-[#FCF8F5] p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9EDEE] text-[#8B1E2D]"><LockKeyhole className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8B1E2D]">Elite intelligence</p>
          <h2 className="mt-1 font-display text-xl font-semibold">Unlock the full Demand Radar</h2>
          <p className="mt-2 text-sm text-[#716862]">See full rankings, market acceleration, competition quality, confidence and 12 week intelligence.</p>
          <Link href="/pro/subscription" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-sm font-semibold text-white">View Elite plan <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}

function TrendPanel({ rows }: { rows: RadarRow[] }) {
  const chart = rows.map((row) => ({ week: shortDate(row.week_start), Demand: row.score, Spike: row.spike_score ?? 0 }));
  return (
    <section className="rounded-3xl border border-[#E8DFD8] bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#8B1E2D]"><BarChart3 className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.14em]">12 week trend</p></div>
          <h2 className="mt-2 font-display text-xl font-semibold">Demand and acceleration over time</h2>
        </div>
        <p className="text-xs text-[#81766F]">Relative index · 0 to 100</p>
      </div>
      {chart.length < 2 ? (
        <div className="mt-5 rounded-2xl bg-[#FCF8F5] p-6 text-sm text-[#716862]">Historical trend will become more useful as additional weekly collections accumulate.</div>
      ) : (
        <div className="mt-5 h-72 w-full" aria-label="Demand and spike score trend chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="Demand" stroke="#8B1E2D" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Spike" stroke="#A59A92" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function RankingRows({ rows, preview, view }: { rows: RadarRow[]; preview: boolean; view: RankingView }) {
  if (rows.length === 0) return <div className="p-8 text-center text-sm text-[#716862]">No current markets are available for this view.</div>;
  return (
    <div className="divide-y">
      {rows.map((row, index) => {
        const window = getSpikeWindow(row);
        return (
          <div key={`${view}-${row.id}`} className="grid gap-4 px-5 py-4 md:grid-cols-[44px_1.4fr_repeat(3,minmax(110px,1fr))] md:items-center md:px-6">
            <div className="font-display text-lg text-[#A59A92]">{index + 1}</div>
            <div>
              <p className="font-semibold">{row.city}, {row.state}</p>
              <p className="mt-1 text-xs text-[#7A716B]">{trendCopy(row.trend)} · {getSpikeLabel(row.spike_score)}</p>
            </div>
            <div>
              <p className="text-xs text-[#8A817B]">Demand</p>
              <p className="font-semibold">{preview ? getDemandLabel(row.score) : `${row.score}/100`}</p>
            </div>
            <div>
              <p className="text-xs text-[#8A817B]">Movement</p>
              <p className="font-semibold">{row.growth_pct == null ? trendCopy(row.trend) : signed(Math.round(row.growth_pct), "%")}</p>
            </div>
            <div>
              <p className="text-xs text-[#8A817B]">Signal</p>
              <p className="font-semibold">{preview ? getSpikeLabel(row.spike_score) : `${row.spike_score ?? "—"} spike · ${row.confidence ?? "—"} conf.`}</p>
              {window.status !== "normal" ? <p className="mt-1 text-[11px] text-[#8B1E2D]">7 day window active</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DemandRadarPage() {
  const [data, setData] = useState<RadarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankingView, setRankingView] = useState<RankingView>("opportunity");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pro/demand-radar", { cache: "no-store" });
      const payload = await response.json() as RadarResponse;
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

  useEffect(() => { void load(); }, []);

  const localPrimary = useMemo(() => data?.local.find((row) => !row.neighborhood) ?? data?.local[0] ?? null, [data]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#8B1E2D]" /></div>;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="font-semibold text-rose-900">Demand Radar unavailable</p>
          <p className="mt-1 text-sm text-rose-700">{error}</p>
          <button onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"><RefreshCw className="h-4 w-4" />Retry</button>
        </div>
      </div>
    );
  }

  const isPreview = data.access.preview && !data.access.full;
  const bestSignal = localPrimary ?? data.opportunities[0] ?? null;
  const bestWindow = bestSignal ? getSpikeWindow(bestSignal) : null;
  const rankingRows = rankingView === "rising" ? data.fastestRising : rankingView === "demand" ? data.highestDemand : data.opportunities;
  const opportunityReliable = data.methodology.opportunityStatus === "reliable";
  const collectionPartial = data.collection.status === "partial";
  const topPulse = data.highestDemand.slice(0, isPreview ? 3 : 8);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 md:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#8B1E2D]"><Radar className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.16em]">{isPreview ? "Market Intelligence Preview" : "Elite Market Intelligence"}</span></div>
          <h1 className="mt-2 font-display text-3xl font-semibold">Demand Radar</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#716862]">See what changed, how your market ranks, where demand is moving and how reliable the current signal is.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold"><RefreshCw className="h-4 w-4" />Refresh</button>
      </header>

      <section className={`rounded-2xl border p-4 ${collectionPartial ? "border-amber-200 bg-amber-50" : "border-[#E4D8D1] bg-[#FCF8F5]"}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {collectionPartial ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />}
            <div>
              <p className="text-sm font-semibold text-[#211C19]">National coverage {data.collection.marketsSucceeded}/{data.collection.marketsRequested} · {data.collection.coveragePct}%</p>
              <p className="mt-1 text-xs text-[#6D625B]">{collectionPartial ? `${data.collection.marketsFailed} markets were unavailable in this collection. Rankings use only the current run.` : "Current run completed with full configured coverage."}</p>
            </div>
          </div>
          <div className="text-xs text-[#6D625B] sm:text-right">
            <p>{freshnessCopy[data.market.freshness]}{data.market.collectedAt ? ` · Updated ${formatUsDate(data.market.collectedAt)}` : ""}</p>
            <p className="mt-1">{data.market.weekStart ? `Week of ${formatUsDate(data.market.weekStart)}` : "No active week"}</p>
          </div>
        </div>
      </section>

      {localPrimary ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#8B1E2D]" /><h2 className="font-display text-xl font-semibold">Your market: {localPrimary.city}, {localPrimary.state}</h2></div>
            <div className="inline-flex w-fit items-center rounded-full bg-[#F9EDEE] px-3 py-1 text-xs font-bold tracking-wide text-[#8B1E2D]">{signalCopy(localPrimary)}</div>
          </div>
          {isPreview ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreCard label="Demand" value={getDemandLabel(localPrimary.score)} detail={`${localPrimary.score}/100`} delta={data.insights?.demandChange} />
              <ScoreCard label="Spike" value={getSpikeLabel(localPrimary.spike_score)} detail={localPrimary.spike_score == null ? "Awaiting baseline" : `${localPrimary.spike_score}/100 acceleration`} delta={data.insights?.spikeChange} />
              <ScoreCard label="Trend" value={trendCopy(localPrimary.trend)} detail="Direction versus recent baseline" />
              <ScoreCard label="National rank" value={data.insights?.rank ? `#${data.insights.rank}` : "—"} detail={`${data.insights?.totalMarkets ?? 0} current markets`} delta={data.insights?.rankChange} />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <ScoreCard label="Demand" value={localPrimary.score} detail={getDemandLabel(localPrimary.score)} delta={data.insights?.demandChange} />
              <ScoreCard label="Spike" value={localPrimary.spike_score ?? "—"} detail={getSpikeLabel(localPrimary.spike_score)} delta={data.insights?.spikeChange} />
              <ScoreCard label="National rank" value={data.insights?.rank ? `#${data.insights.rank}` : "—"} detail={data.insights?.percentile != null ? `${data.insights.percentile}th percentile` : "Current run"} delta={data.insights?.rankChange} />
              <ScoreCard label="Opportunity" value={opportunityReliable ? localPrimary.opportunity_score ?? "—" : "Beta"} detail={opportunityReliable ? "Demand adjusted for competition" : "Competition signal not differentiated yet"} />
              <ScoreCard label="Confidence" value={localPrimary.confidence ?? "—"} detail={trendCopy(localPrimary.trend)} />
            </div>
          )}
        </section>
      ) : data.localFallback ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-950">Your market was not captured in the latest national run</p>
              <p className="mt-1 text-sm text-amber-900">Last known signal for {data.localFallback.city}, {data.localFallback.state}: demand {data.localFallback.score}/100, collected {formatUsDate(data.localFallback.collected_at)}. It is shown as historical context and is not mixed into the current national ranking.</p>
            </div>
          </div>
        </section>
      ) : null}

      {localPrimary && data.insights ? (
        <section className="rounded-3xl border border-[#E8DFD8] bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-2 text-[#8B1E2D]"><Activity className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.14em]">What changed</p></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-[#FCF8F5] p-4"><p className="text-xs text-[#81766F]">Demand</p><p className="mt-2 text-xl font-semibold">{signed(data.insights.demandChange)}</p><p className="mt-1 text-xs text-[#716862]">points vs previous week</p></div>
            <div className="rounded-2xl bg-[#FCF8F5] p-4"><p className="text-xs text-[#81766F]">Spike</p><p className="mt-2 text-xl font-semibold">{signed(data.insights.spikeChange)}</p><p className="mt-1 text-xs text-[#716862]">acceleration points</p></div>
            <div className="rounded-2xl bg-[#FCF8F5] p-4"><p className="text-xs text-[#81766F]">Rank movement</p><p className="mt-2 text-xl font-semibold">{data.insights.rankChange == null ? "—" : data.insights.rankChange > 0 ? `↑ ${data.insights.rankChange}` : data.insights.rankChange < 0 ? `↓ ${Math.abs(data.insights.rankChange)}` : "No change"}</p><p className="mt-1 text-xs text-[#716862]">positions nationally</p></div>
            <div className="rounded-2xl bg-[#FCF8F5] p-4"><p className="text-xs text-[#81766F]">Baseline growth</p><p className="mt-2 text-xl font-semibold">{data.insights.growthPct == null ? "—" : signed(Math.round(data.insights.growthPct), "%")}</p><p className="mt-1 text-xs text-[#716862]">recent signal vs baseline</p></div>
          </div>
        </section>
      ) : null}

      {data.localHistory.length > 0 ? <TrendPanel rows={data.localHistory} /> : null}

      {bestSignal && bestWindow ? (
        <section className="rounded-3xl border border-[#E4D8D1] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#8B1E2D]"><TrendingUp className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-[0.14em]">{localPrimary ? "Your clearest signal" : "Strongest current market signal"}</p></div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#FCF8F5] p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#81766F]"><MapPin className="h-4 w-4" />Where</div><p className="mt-3 font-display text-2xl font-semibold">{bestSignal.city}, {bestSignal.state}</p></div>
            <div className="rounded-2xl bg-[#FCF8F5] p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#81766F]"><CalendarDays className="h-4 w-4" />When</div><p className="mt-3 text-lg font-semibold">{bestWindow.start && bestWindow.end ? `${formatUsDate(bestWindow.start)} – ${formatUsDate(bestWindow.end)}` : "No confirmed window"}</p><p className="mt-1 text-xs text-[#756C66]">{bestWindow.label}</p></div>
            <div className="rounded-2xl bg-[#FCF8F5] p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#81766F]"><Zap className="h-4 w-4" />Status</div><p className="mt-3 font-display text-2xl font-semibold">{signalCopy(bestSignal)}</p><p className="mt-1 text-xs text-[#756C66]">Spike {bestSignal.spike_score ?? "—"}/100 · Confidence {bestSignal.confidence ?? "—"}/100</p></div>
          </div>
          <div className="mt-4 rounded-2xl border border-[#E9E0DA] p-4 text-sm text-[#5F5650]"><strong>Action now:</strong> {bestWindow.action}</div>
          {!isPreview && bestWindow.status === "active" ? <div className="mt-4 flex items-center gap-2 text-xs text-[#6D625B]"><Bell className="h-4 w-4 text-[#8B1E2D]" />Email alerts are sent when a confirmed high confidence spike is detected in your profile city and market insight emails are enabled.</div> : null}
        </section>
      ) : null}

      {isPreview ? <UpgradeCard /> : null}

      <section className="rounded-3xl border border-[#E8DFD8] bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-2 text-[#8B1E2D]"><Radar className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.14em]">National market pulse</p></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topPulse.map((row) => (
            <div key={`pulse-${row.id}`} className="rounded-2xl bg-[#FCF8F5] p-4">
              <div className="flex items-center justify-between gap-2"><p className="font-semibold">{row.city}, {row.state}</p><span className="text-xs font-semibold text-[#8B1E2D]">{row.score}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EDE5E0]"><div className="h-full rounded-full bg-[#8B1E2D]" style={{ width: `${Math.max(2, Math.min(100, row.score))}%` }} /></div>
              <p className="mt-2 text-xs text-[#716862]">{trendCopy(row.trend)} · {getSpikeLabel(row.spike_score)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-3"><Radar className="h-5 w-5 text-[#8B1E2D]" /><div><h2 className="font-display text-lg font-semibold">Market rankings</h2><p className="text-xs text-[#756C66]">Every ranking uses only markets captured in the latest collection run.</p></div></div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Market ranking view">
              <button type="button" aria-pressed={rankingView === "opportunity"} onClick={() => setRankingView("opportunity")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${rankingView === "opportunity" ? "bg-[#8B1E2D] text-white" : "bg-[#F7F2EE] text-[#5F5650]"}`}>{opportunityReliable ? "Top opportunities" : "Market ranking"}</button>
              <button type="button" aria-pressed={rankingView === "rising"} onClick={() => setRankingView("rising")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${rankingView === "rising" ? "bg-[#8B1E2D] text-white" : "bg-[#F7F2EE] text-[#5F5650]"}`}>Fastest rising</button>
              <button type="button" aria-pressed={rankingView === "demand"} onClick={() => setRankingView("demand")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${rankingView === "demand" ? "bg-[#8B1E2D] text-white" : "bg-[#F7F2EE] text-[#5F5650]"}`}>Highest demand</button>
            </div>
          </div>
          {!opportunityReliable ? <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">Opportunity scoring is marked beta because the current competition signal is not sufficiently differentiated. It is not used to claim a precise competitive advantage.</div> : null}
        </div>
        <RankingRows rows={rankingRows} preview={isPreview} view={rankingView} />
      </section>

      <section className="rounded-3xl border border-[#E8DFD8] bg-[#FCF8F5] p-5 md:p-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div><div className="flex items-center gap-2 text-[#8B1E2D]"><Database className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Collection</p></div><p className="mt-2 text-sm font-semibold">{data.collection.status === "completed" ? "Complete" : data.collection.status === "partial" ? "Partial" : "Unknown"} · {data.collection.coveragePct}% coverage</p><p className="mt-1 text-xs text-[#716862]">{data.collection.rowsIngested} rows from run {data.collection.runId ? data.collection.runId.slice(0, 8) : "—"}</p></div>
          <div><div className="flex items-center gap-2 text-[#8B1E2D]"><ShieldCheck className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Methodology</p></div><p className="mt-2 text-sm font-semibold">{data.methodology.version ?? "Pending"}</p><p className="mt-1 text-xs text-[#716862]">Source: {data.methodology.source ?? "not available"}</p></div>
          <div><div className="flex items-center gap-2 text-[#8B1E2D]"><Activity className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Competition quality</p></div><p className="mt-2 text-sm font-semibold capitalize">{data.methodology.competitionStatus}</p><p className="mt-1 text-xs text-[#716862]">Opportunity is shown as beta until competition varies enough to support a differentiated score.</p></div>
        </div>
      </section>

      <p className="text-xs leading-5 text-[#7B726C]">{data.disclaimer} Spike windows describe current acceleration observed in fresh market data; they are statistical signals, not guaranteed future bookings or exact search volumes.</p>
    </div>
  );
}
