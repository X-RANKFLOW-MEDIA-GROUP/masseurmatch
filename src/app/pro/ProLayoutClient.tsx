"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
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
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src={BRAND_ASSETS.logo} alt="MasseurMatch" width={160} height={32} className="h-8 w-auto" />
          <span className="align-top font-mono text-[10px] uppercase tracking-widest text-indigo-400">PRO</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive ? <motion.div layoutId="activeNav" className="absolute inset-0 rounded-lg border border-slate-800 bg-slate-900" transition={{ type: "spring", stiffness: 300, damping: 30 }} /> : null}
              <span className={`relative flex items-center gap-3 rounded-lg px-4 py-2.5 font-sans text-sm transition-colors ${isActive ? "font-medium text-white" : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"}`}>
                <item.icon className="h-4 w-4" />{item.name}
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
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-900 bg-slate-950 px-4 py-3 md:hidden">
        <Link href="/" className="inline-flex items-center gap-2"><Image src={BRAND_ASSETS.logo} alt="MasseurMatch" width={128} height={28} className="h-7 w-auto" /><span className="font-mono text-[9px] uppercase tracking-widest text-indigo-400">PRO</span></Link>
        <button onClick={() => setMobileOpen((prev) => !prev)} aria-label={mobileOpen ? "Close menu" : "Open menu"} className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      <AnimatePresence>{mobileOpen ? <><motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} /><motion.aside key="drawer" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 300, damping: 35 }} className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-slate-300 shadow-2xl md:hidden">{sidebarContent}</motion.aside></> : null}</AnimatePresence>
      <div className="flex-1 overflow-y-auto bg-slate-50 pt-14 md:pt-0">{loading ? <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : children}</div>
    </div>
  );
}
