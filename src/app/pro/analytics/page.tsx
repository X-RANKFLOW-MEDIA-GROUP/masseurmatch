"use client";

import { Eye, MousePointerClick, Heart, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 pb-32 md:p-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-slate-900">
            Performance
          </h1>
          <p className="mt-2 font-sans text-slate-500">Dados dos últimos 30 dias.</p>
        </div>
        <select className="border border-slate-200 bg-white px-4 py-2 font-sans text-sm text-slate-700 outline-none">
          <option>Últimos 30 Dias</option>
          <option>Este Ano</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Impressões nas Buscas" value="8,402" trend="+12.5%" icon={Eye} />
        <StatCard
          title="Visualizações de Perfil"
          value="1,248"
          trend="+5.2%"
          icon={MousePointerClick}
        />
        <StatCard
          title="Guardado nos Favoritos"
          value="142"
          trend="+18.1%"
          icon={Heart}
          highlight
        />
      </div>

      {/* CSS-only bar chart */}
      <div className="mt-8 border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="font-display text-xl font-medium text-slate-900">Tráfego do Perfil</h3>
          <span className="flex items-center gap-1 bg-emerald-50 px-2 py-1 font-mono text-xs text-emerald-600">
            <TrendingUp className="h-3 w-3" /> Em Crescimento
          </span>
        </div>

        <div className="flex h-64 w-full items-end justify-between gap-2 pt-10 sm:gap-4">
          {[40, 25, 45, 30, 60, 85, 55, 75, 100, 80, 95, 65].map((height, i) => (
            <div
              key={i}
              className="group relative flex w-full justify-center bg-slate-100 transition-colors hover:bg-slate-200"
              style={{ height: `${height}%` }}
            >
              <div className="absolute -top-8 font-mono text-[10px] text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
                {height * 10}
              </div>
              <div
                className="mt-auto w-full bg-slate-900"
                style={{ height: `${height * 0.4}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-mono text-[10px] uppercase text-slate-400">
          <span>Dia 1</span>
          <span>Dia 15</span>
          <span>Hoje</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  highlight = false,
}: {
  title: string;
  value: string;
  trend: string;
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
          {value}
        </span>
        <span className="mb-1 font-mono text-xs text-emerald-500">{trend}</span>
      </div>
    </div>
  );
}
