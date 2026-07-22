"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  BarChart,
  Bell,
  CreditCard,
  Eye,
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  Menu,
  Search,
  Settings,
  TrendingUp,
  UserCircle,
  WalletCards,
  X,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { BRAND_ASSETS } from "@/lib/brand";

const navItems = [
  { name: "Dashboard", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "Market Intelligence", href: "/pro/dashboard/market-intelligence", icon: Search },
  { name: "Analytics", href: "/pro/analytics", icon: BarChart },
  { name: "My Profile", href: "/pro/listing", icon: UserCircle },
  { name: "Rates", href: "/pro/rates", icon: Banknote },
  { name: "Photos", href: "/pro/photos", icon: ImageIcon },
  { name: "Preview Profile", href: "/pro/profile", icon: Eye },
  { name: "Growth Tools", href: "/pro/growth", icon: TrendingUp },
  { name: "Notifications", href: "/pro/notifications", icon: Bell },
  { name: "Subscription", href: "/pro/subscription", icon: CreditCard },
  { name: "Payment History", href: "/pro/payment-history", icon: WalletCards },
  { name: "Help Center", href: "/help", icon: LifeBuoy },
  { name: "Support", href: "/pro/tickets", icon: LifeBuoy },
  { name: "Settings", href: "/pro/settings", icon: Settings },
];

export default function ProLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=%2Fpro%2Fdashboard");
  }, [loading, router, user]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!loading && !user) return null;

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src={BRAND_ASSETS.logo} alt="MasseurMatch" width={160} height={32} className="h-8 w-auto brightness-0 invert" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#D4717E]">PRO</span>
        </Link>
        <button type="button" onClick={() => setMobileOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden" aria-label="Close dashboard menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive ? <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl border border-[#A83A49] bg-[#8B1E2D]" transition={{ type: "spring", stiffness: 300, damping: 30 }} /> : null}
              <span className={`relative flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${isActive ? "font-semibold text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
                <item.icon className="h-4 w-4 shrink-0" />{item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <aside className="z-20 hidden w-64 flex-col border-r border-slate-900 bg-slate-950 text-slate-300 shadow-2xl md:flex">{sidebarContent}</aside>

      <div className="fixed inset-x-0 top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-900 bg-slate-950 px-4 py-3 shadow-lg md:hidden">
        <Link href="/pro/dashboard" className="inline-flex items-center gap-2">
          <Image src={BRAND_ASSETS.logo} alt="MasseurMatch" width={128} height={28} className="h-7 w-auto brightness-0 invert" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#D4717E]">PRO</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open dashboard menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#A83A49] bg-[#8B1E2D] text-white shadow-lg"
        >
          <Menu className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside key="drawer" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 300, damping: 35 }} className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,330px)] flex-col bg-slate-950 text-slate-300 shadow-2xl md:hidden">
              {sidebarContent}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto bg-slate-50 pt-16 md:pt-0">
        {loading ? <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : children}
      </main>
    </div>
  );
}
