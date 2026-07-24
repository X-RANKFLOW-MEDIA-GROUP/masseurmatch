"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  Loader2,
  Mail,
  Menu,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BRAND_ASSETS } from "@/lib/brand";

const navItems = [
  { name: "Home", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/pro/listing", icon: UserCircle },
  { name: "Leads", href: "/pro/inquiries", icon: Mail },
  { name: "Performance", href: "/pro/analytics", icon: BarChart3 },
  { name: "Plan & Billing", href: "/pro/subscription", icon: CreditCard },
  { name: "Settings & Help", href: "/pro/settings", icon: Settings },
] as const;

const routeGroups: Record<string, string[]> = {
  "/pro/listing": ["/pro/profile", "/pro/listing", "/pro/rates", "/pro/photos", "/pro/trust"],
  "/pro/analytics": ["/pro/analytics", "/pro/growth", "/pro/ai-coach"],
  "/pro/subscription": ["/pro/subscription", "/pro/billing", "/pro/payment-history"],
  "/pro/settings": ["/pro/settings", "/pro/tickets", "/pro/notifications"],
};

function itemIsActive(pathname: string, href: string) {
  const groupedRoutes = routeGroups[href];
  if (groupedRoutes) {
    return groupedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ProLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=%2Fpro%2Fdashboard");
    }
  }, [loading, router, user]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!loading && !user) return null;

  const sidebarContent = (
    <>
      <div className="border-b border-[#ECE5DF] px-5 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src={BRAND_ASSETS.logoLockup}
            alt="MasseurMatch"
            width={175}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
          <span className="rounded-full bg-[#F9EDEE] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#8B1E2D]">
            Pro
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Provider dashboard">
        {navItems.map((item) => {
          const isActive = itemIsActive(pathname, item.href);
          return (
            <Link key={item.name} href={item.href} className="relative block rounded-xl">
              {isActive ? (
                <motion.div
                  layoutId="activeProNav"
                  className="absolute inset-0 rounded-xl border border-[#EAD8D9] bg-[#F9EDEE]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              ) : null}
              <span
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-[#8B1E2D]"
                    : "text-[#6D655F] hover:bg-[#F7F3F0] hover:text-[#25211E]"
                }`}
              >
                {isActive ? (
                  <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full border-l-2 border-[#8B1E2D]" />
                ) : null}
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={2.15} />
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#ECE5DF] p-3">
        <Link
          href="/pro/notifications"
          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-[#6D655F] transition-colors hover:bg-[#F7F3F0] hover:text-[#25211E]"
        >
          <Bell className="h-4 w-4" />
          Notifications
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-[#FBFAF8]">
      <aside className="z-20 hidden w-64 shrink-0 flex-col border-r border-[#E9E2DC] bg-white text-[#171513] shadow-[6px_0_28px_rgba(61,43,33,0.035)] md:flex">
        {sidebarContent}
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-[#E9E2DC] bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src={BRAND_ASSETS.logoLockup} alt="MasseurMatch" width={140} height={28} className="h-7 w-auto object-contain" priority />
          <span className="rounded-full bg-[#F9EDEE] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-[#8B1E2D]">
            Pro
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/pro/notifications"
            aria-label="Notifications"
            className="rounded-lg border border-[#E5DDD6] p-1.5 text-[#5E5752] transition-colors hover:bg-[#F7F3F0]"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((previous) => !previous)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="rounded-lg border border-[#E5DDD6] p-1.5 text-[#5E5752] transition-colors hover:bg-[#F7F3F0]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[#211B18]/35 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E9E2DC] bg-white text-[#171513] shadow-2xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="min-w-0 flex-1 overflow-y-auto bg-[#FBFAF8] pt-14 md:pt-0">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#8B1E2D]" />
          </div>
        ) : children}
      </div>
    </div>
  );
}
