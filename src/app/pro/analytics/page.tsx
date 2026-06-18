"use client";

import { BarChart2, Eye, Heart, MousePointerClick } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 pb-32 md:p-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-2 font-sans text-slate-500">Profile performance over time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Search Impressions" icon={Eye} />
        <StatCard title="Profile Views" icon={MousePointerClick} />
        <StatCard title="Saved to Favorites" icon={Heart} highlight />
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm">
        <BarChart2 className="h-10 w-10 text-slate-300" />
        <h2 className="font-display text-xl font-medium text-slate-700">No data yet</h2>
        <p className="max-w-sm text-sm text-slate-500">
          We start tracking views the day your listing goes live. Check back soon for your first insights.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  title,
  icon: Icon,
  highlight = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden border p-6 ${
        highlight
          ? "border-slate-800 bg-slate-950 text-white"
          : "border-slate-200/60 bg-white shadow-sm"
      }`}
    >
      <div
        className={`mb-4 flex items-center justify-between ${
          highlight ? "text-slate-400" : "text-slate-500"
        }`}
      >
        <span className="font-mono text-xs uppercase tracking-widest">{title}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex items-end gap-3">
        <span
          className={`font-display text-4xl font-medium ${
            highlight ? "text-white" : "text-slate-900"
          }`}
        >
          —
        </span>
      </div>
      <p className={`mt-1 text-xs ${highlight ? "text-slate-500" : "text-slate-400"}`}>
        No data yet
      </p>
    </div>
  );
}
