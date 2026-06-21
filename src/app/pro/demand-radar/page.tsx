"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Minus,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { normalizePlanKey } from "@/hooks/usePlanLimits";
import { supabase } from "@/integrations/supabase/client";

interface DemandScore {
  id: string;
  city: string;
  state: string;
  neighborhood: string | null;
  score: number;
  trend: "rising" | "stable" | "falling";
  search_volume_index: number;
  competition_index: number;
  week_start: string;
}

function TrendIcon({ trend }: { trend: DemandScore["trend"] }) {
  if (trend === "rising") return <TrendingUp className="h-4 w-4 text-emerald-500" strokeWidth={2.25} />;
  if (trend === "falling") return <TrendingDown className="h-4 w-4 text-rose-400" strokeWidth={2.25} />;
  return <Minus className="h-4 w-4 text-slate-400" strokeWidth={2.25} />;
}

function ScoreBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-emerald-500" : value >= 55 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function UpgradeTeaser() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-[6px]" aria-hidden>
        <div className="space-y-2 p-6">
          {[
            { city: "New York, NY", score: 91, trend: "rising" },
            { city: "Los Angeles, CA", score: 85, trend: "rising" },
            { city: "Miami, FL", score: 88, trend: "rising" },
            { city: "Chicago, IL", score: 76, trend: "stable" },
            { city: "Dallas, TX", score: 71, trend: "stable" },
          ].map((row) => (
            <div key={row.city} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <span className="w-36 text-sm font-medium text-slate-700">{row.city}</span>
              <div className="flex-1">
                <ScoreBar value={row.score} />
              </div>
              <span className="w-8 text-right text-sm font-semibold text-slate-900">{row.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gate overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-[2px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900">
          <Zap className="h-6 w-6 text-amber-400" strokeWidth={2.25} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Elite feature</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Demand Radar shows weekly search volume and competition data by city and
            neighborhood — available on the Elite plan.
          </p>
        </div>
        <Link
          href="/pro/billing?upgrade=elite"
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Upgrade to Elite
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </Link>
      </div>
    </div>
  );
}

export default function DemandRadarPage() {
  const { subscription } = useAuth();
  const tier = normalizePlanKey(subscription?.plan_key) ?? (subscription?.subscribed ? "standard" : "free");
  const isElite = tier === "elite";

  const [rows, setRows] = useState<DemandScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    if (!isElite) return;
    setLoading(true);
    // demand_scores table not available in current schema
    setRows([]);
    setLoading(false);
  }, [isElite]);

  // Group by city
  const cityRows = rows.filter((r) => !r.neighborhood);
  const neighborhoodRows = (city: string, state: string) =>
    rows.filter((r) => r.city === city && r.state === state && r.neighborhood);

  const cities = cityRows.map((r) => `${r.city}, ${r.state}`);
  const activeCity = selectedCity ?? cities[0] ?? null;
  const activeCityRow = cityRows.find((r) => `${r.city}, ${r.state}` === activeCity);
  const activeNeighborhoods = activeCityRow
    ? neighborhoodRows(activeCityRow.city, activeCityRow.state)
    : [];

  const latestWeek = rows[0]?.week_start ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 pb-32 md:p-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-slate-900">
            Demand Radar
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Weekly search demand and competition index by city and neighborhood.
            {latestWeek && ` Week of ${new Date(latestWeek).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`}
          </p>
        </div>
        {isElite && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            <Zap className="h-3 w-3 text-amber-400" strokeWidth={2.5} />
            Elite
          </span>
        )}
      </div>

      {!isElite ? (
        <UpgradeTeaser />
      ) : loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading demand data…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* City list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Cities
            </p>
            <ul className="space-y-1">
              {cityRows.map((r) => {
                const key = `${r.city}, ${r.state}`;
                const active = key === activeCity;
                return (
                  <li key={key}>
                    <button
                      onClick={() => setSelectedCity(key)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-medium">{key}</span>
                      <span className={`text-xs font-semibold ${active ? "text-amber-300" : "text-slate-500"}`}>
                        {r.score}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Detail panel */}
          <div className="space-y-4">
            {activeCityRow && (
              <>
                {/* City summary card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {activeCityRow.city}, {activeCityRow.state}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">Overall demand score</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendIcon trend={activeCityRow.trend} />
                      <span className="font-display text-4xl font-bold text-slate-900">
                        {activeCityRow.score}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 text-xs text-slate-400">Search volume</p>
                      <ScoreBar value={activeCityRow.search_volume_index} />
                      <p className="mt-1 text-xs font-semibold text-slate-700">{activeCityRow.search_volume_index}/100</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-400">Competition</p>
                      <ScoreBar value={activeCityRow.competition_index} />
                      <p className="mt-1 text-xs font-semibold text-slate-700">{activeCityRow.competition_index}/100</p>
                    </div>
                  </div>
                </div>

                {/* Neighborhood breakdown */}
                {activeNeighborhoods.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Neighborhoods
                    </p>
                    <ul className="space-y-3">
                      {activeNeighborhoods.map((n) => (
                        <li key={n.neighborhood} className="flex items-center gap-3">
                          <TrendIcon trend={n.trend} />
                          <span className="w-36 text-sm text-slate-700">{n.neighborhood}</span>
                          <div className="flex-1">
                            <ScoreBar value={n.score} />
                          </div>
                          <span className="w-10 text-right text-sm font-semibold text-slate-900">{n.score}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Opportunity callout */}
                {activeCityRow.search_volume_index - activeCityRow.competition_index > 20 && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.25} />
                    <p className="text-sm text-emerald-800">
                      <strong>High opportunity:</strong> demand outpaces competition by{" "}
                      {activeCityRow.search_volume_index - activeCityRow.competition_index} points —
                      a new or improving listing here could capture outsized share.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
