"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart2, Eye, Loader2, MousePointerClick } from "lucide-react";

import { requestJson } from "@/app/_lib/request";

type AnalyticsSeriesPoint = { date: string; visitors: number };

type AnalyticsResponse = {
  ok: boolean;
  windowDays: number;
  series: AnalyticsSeriesPoint[];
  totals: {
    windowViews: number;
    windowUniqueVisitors: number;
    allTimeViews: number;
    allTimeContactClicks: number;
  };
};

function formatTick(value: string) {
  const d = new Date(`${value}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    requestJson<AnalyticsResponse>("/api/pro/analytics")
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const series = data?.series ?? [];
  const hasData = series.some((point) => point.visitors > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 pb-32 md:p-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-2 font-sans text-slate-500">Profile views over the last 30 days.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard
          title="Profile Views (30d)"
          icon={Eye}
          value={data ? data.totals.windowViews.toLocaleString() : null}
          loading={loading}
        />
        <StatCard
          title="Contact Clicks"
          icon={MousePointerClick}
          value={data ? data.totals.allTimeContactClicks.toLocaleString() : null}
          loading={loading}
          highlight
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-slate-900">Daily profile views</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Last 30 days</span>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
            <BarChart2 className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">We couldn&apos;t load your analytics. Try again shortly.</p>
          </div>
        ) : !hasData ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
            <BarChart2 className="h-10 w-10 text-slate-300" />
            <h3 className="font-display text-lg font-medium text-slate-700">No visits yet</h3>
            <p className="max-w-sm text-sm text-slate-500">
              We start tracking visitors the day your listing goes live. Your daily trend appears here as clients
              discover you.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B1E2D" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#8B1E2D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatTick}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  cursor={{ stroke: "#8B1E2D", strokeWidth: 1, strokeDasharray: "4 4" }}
                  labelFormatter={(label) => formatTick(String(label))}
                  formatter={(value: number) => [`${value} view${value === 1 ? "" : "s"}`, "Views"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#8B1E2D"
                  strokeWidth={2.25}
                  fill="url(#visitorFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#8B1E2D" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  icon: Icon,
  value,
  loading,
  highlight = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string | null;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-6 ${
        highlight ? "border-slate-800 bg-slate-950 text-white" : "border-slate-200/60 bg-white shadow-sm"
      }`}
    >
      <div className={`mb-4 flex items-center justify-between ${highlight ? "text-slate-400" : "text-slate-500"}`}>
        <span className="font-mono text-xs uppercase tracking-widest">{title}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex items-end gap-3">
        {loading ? (
          <Loader2 className={`h-6 w-6 animate-spin ${highlight ? "text-slate-500" : "text-slate-300"}`} />
        ) : (
          <span className={`font-display text-4xl font-medium ${highlight ? "text-white" : "text-slate-900"}`}>
            {value ?? "—"}
          </span>
        )}
      </div>
    </div>
  );
}
