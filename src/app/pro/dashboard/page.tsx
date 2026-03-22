"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Car,
  Plane,
  EyeOff,
  TrendingUp,
  Users,
  Eye,
  Star,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const statusOptions = [
  { key: "available", label: "Available Now", icon: Zap, color: "emerald" },
  { key: "mobile", label: "Mobile", icon: Car, color: "indigo" },
  { key: "traveling", label: "Traveling", icon: Plane, color: "amber" },
  { key: "hidden", label: "Hidden", icon: EyeOff, color: "rose" },
] as const;

type AvailabilityStatus = (typeof statusOptions)[number]["key"];

const statusMessages: Record<AvailabilityStatus, string> = {
  available:
    "Você está visível no topo das buscas locais com o selo 'Disponível Agora'. (Timer: 90 min)",
  mobile:
    "Modo In-Call/Out-Call ativado. Edite seu Service Radius (Raio de Atendimento).",
  traveling:
    "Defina sua cidade de destino e datas para atrair reservas antecipadas.",
  hidden:
    "Modo Invisível. Seu perfil foi removido das buscas temporariamente.",
};

const colorMap: Record<string, { active: string; idle: string }> = {
  emerald: {
    active: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
  },
  indigo: {
    active: "bg-indigo-500/10 border-indigo-500/50 text-indigo-400",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
  },
  amber: {
    active: "bg-amber-500/10 border-amber-500/50 text-amber-400",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
  },
  rose: {
    active: "bg-rose-500/10 border-rose-500/50 text-rose-400",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
  },
};

const metrics = [
  { label: "Views (30d)", value: "1,248", icon: Eye, trend: "+12%" },
  { label: "Impressões", value: "8,402", icon: TrendingUp, trend: "+5%" },
  { label: "Contatos", value: "42", icon: Users, trend: "+18%" },
  { label: "Avaliação", value: "4.9", icon: Star, trend: "Top 5%" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardHome() {
  const [activeStatus, setActiveStatus] = useState<AvailabilityStatus>("available");

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
            Visão Geral
          </h1>
          <p className="mt-1 font-sans text-sm text-slate-500">
            Acompanhe sua performance e gerencie sua disponibilidade.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="border border-slate-200 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
            Ver Perfil Público
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Profile & Availability */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="relative overflow-hidden border border-slate-200/60 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 p-1">
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-emerald-400 opacity-20" />
                <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white bg-slate-100">
                  <Image
                    src="https://i.pravatar.cc/150?img=32"
                    alt="Perfil"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="font-display text-xl font-medium text-slate-900">Alex M.</h2>
                <div className="mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    PRO Member
                  </span>
                </div>
              </div>
            </div>

            {/* Profile completeness */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-mono uppercase tracking-wider text-slate-500">
                  Completude do Perfil
                </span>
                <span className="font-mono font-semibold text-slate-900">85%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-slate-900"
                />
              </div>
            </div>
          </motion.div>

          {/* Availability Control */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="border border-slate-800 bg-slate-950 p-6 text-white shadow-xl"
          >
            <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-slate-400">
              Availability Control
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((opt) => {
                const isActive = activeStatus === opt.key;
                const colors = colorMap[opt.color];
                return (
                  <button
                    key={opt.key}
                    onClick={() => setActiveStatus(opt.key)}
                    className={`flex flex-col items-center justify-center gap-2 border p-4 transition-all duration-300 ${
                      isActive ? colors.active : colors.idle
                    }`}
                  >
                    <opt.icon className="h-6 w-6" />
                    <span className="font-sans text-xs font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border border-white/10 bg-white/5 p-3 font-sans text-xs leading-relaxed text-slate-300">
              {statusMessages[activeStatus]}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Metrics & Feed */}
        <div className="space-y-6 lg:col-span-2">
          {/* Smart Alert */}
          <div className="flex items-start gap-3 border-l-4 border-indigo-500 bg-indigo-50 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 text-indigo-500" />
            <div>
              <h4 className="font-sans text-sm font-medium text-indigo-900">
                Dica Knotty AI: Adicione Especialidades
              </h4>
              <p className="mt-1 font-sans text-xs text-indigo-700">
                Terapeutas que listam &ldquo;Deep Tissue&rdquo; recebem 30% mais mensagens na sua
                região.{" "}
                <button className="ml-1 font-semibold underline">Editar Serviços</button>
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex flex-col gap-2 border border-slate-200/60 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between text-slate-400">
                  <metric.icon className="h-4 w-4" />
                  <span className="bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] uppercase text-emerald-500">
                    {metric.trend}
                  </span>
                </div>
                <div>
                  <div className="font-display text-2xl font-medium text-slate-900">
                    {metric.value}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {metric.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity Feed */}
          <div className="border border-slate-200/60 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h3 className="font-sans font-semibold text-slate-900">Atividade Recente</h3>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Score de Engajamento: Alto
              </span>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between font-sans text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">
                    Alguém salvou seu perfil nos favoritos.
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">Há 2 min</span>
              </div>
              <div className="flex items-center justify-between font-sans text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-slate-600">Nova mensagem recebida.</span>
                </div>
                <span className="font-mono text-xs text-slate-400">Há 1 hora</span>
              </div>
              <div className="flex items-center justify-between font-sans text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-slate-600">
                    Você subiu para o 3º lugar na busca por &ldquo;Relaxante&rdquo;.
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">Ontem</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
