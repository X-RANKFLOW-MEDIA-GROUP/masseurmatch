"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Loader2,
  LayoutDashboard,
  UserCircle,
  Image as ImageIcon,
  Settings,
  Sparkles,
  MapPin,
  BarChart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Visão Geral", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "Meu Perfil", href: "/pro/listing", icon: UserCircle },
  { name: "Fotos", href: "/pro/photos", icon: ImageIcon },
  { name: "Performance", href: "/pro/analytics", icon: BarChart },
  { name: "Viagens & Raio", href: "/pro/travel", icon: MapPin },
  { name: "Configurações", href: "/pro/settings", icon: Settings },
];

export default function ProLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=%2Fpro%2Fdashboard");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar (Desktop) */}
      <aside className="z-20 hidden w-64 flex-col border-r border-slate-900 bg-slate-950 text-slate-300 shadow-2xl md:flex">
        <div className="p-6">
          <Link href="/" className="font-display text-2xl font-bold tracking-tighter text-white">
            Masseur<span className="text-slate-500">Match</span>{" "}
            <span className="ml-1 align-top font-mono text-[10px] uppercase tracking-widest text-indigo-400">
              PRO
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="relative block">
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg border border-slate-800 bg-slate-900"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span
                  className={`relative flex items-center gap-3 rounded-lg px-4 py-3 font-sans text-sm transition-colors ${
                    isActive
                      ? "font-medium text-white"
                      : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Callout */}
        <div className="m-4 rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-900/20 to-transparent p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-300">
              Knotty AI
            </span>
          </div>
          <p className="mb-3 font-sans text-xs text-slate-400">
            Seu perfil está 85% completo. Deixe a IA otimizar sua bio.
          </p>
          <button className="w-full rounded border border-indigo-500/20 bg-indigo-500/10 py-2 font-mono text-[10px] uppercase tracking-wider text-indigo-300 transition-colors hover:bg-indigo-500/20">
            Otimizar Agora
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  );
}
