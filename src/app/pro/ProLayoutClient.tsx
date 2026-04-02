"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  LayoutDashboard,
  UserCircle,
  Image as ImageIcon,
  Settings,
  Sparkles,
  BarChart,
  BookUser,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Visão Geral", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "Meu Perfil", href: "/pro/listing", icon: UserCircle },
  { name: "Fotos", href: "/pro/photos", icon: ImageIcon },
  { name: "Performance", href: "/pro/analytics", icon: BarChart },
  { name: "Perfis", href: "/pro/profiles", icon: BookUser },
  { name: "Configurações", href: "/pro/settings", icon: Settings },
];

export default function ProLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const SidebarContent = () => (
    <>
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
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Desktop Sidebar ── */}
      <aside className="z-20 hidden w-64 flex-col border-r border-slate-900 bg-slate-950 text-slate-300 shadow-2xl md:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile: Top bar + Drawer ── */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-900 bg-slate-950 px-4 py-3 md:hidden">
        <Link href="/" className="font-display text-xl font-bold tracking-tighter text-white">
          Masseur<span className="text-slate-500">Match</span>{" "}
          <span className="ml-1 align-top font-mono text-[9px] uppercase tracking-widest text-indigo-400">
            PRO
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-slate-800"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-slate-300 shadow-2xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area — top padding on mobile for the fixed top bar */}
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-14 md:pt-0">{children}</main>
    </div>
  );
}

