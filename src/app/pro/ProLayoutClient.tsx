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
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCircle,
  WalletCards,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BRAND_ASSETS } from "@/lib/brand";

const navItems = [
  { name: "Dashboard", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/pro/listing", icon: UserCircle },
  { name: "AI Profile Coach", href: "/pro/ai-coach", icon: Sparkles, badge: "New" },
  { name: "Trust & Verification", href: "/pro/trust", icon: ShieldCheck },
  { name: "Rates", href: "/pro/rates", icon: Banknote },
  { name: "Photos", href: "/pro/photos", icon: ImageIcon },
  { name: "Growth Tools", href: "/pro/growth", icon: TrendingUp },
  { name: "Inquiries", href: "/pro/inquiries", icon: Mail },
  { name: "Analytics", href: "/pro/analytics", icon: BarChart },
  { name: "Notifications", href: "/pro/notifications", icon: Bell },
  { name: "Subscription", href: "/pro/subscription", icon: CreditCard },
  { name: "Payment History", href: "/pro/payment-history", icon: WalletCards },
  { name: "Support", href: "/pro/tickets", icon: LifeBuoy },
  { name: "Settings", href: "/pro/settings", icon: Settings },
] as const;

export default function ProLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!loading && !user) {
    return null;
  }

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
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-sm transition-colors ${
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
                {"badge" in item ? (
                  <span className="rounded-full bg-[#8B1E2D] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-white">
                    {item.badge}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-[#E9E1DA] bg-[#FCF9F6] p-4">
        <div className="flex items-center gap-2 text-[#8B1E2D]">
          <Sparkles className="h-4 w-4" />
          <p className="text-xs font-semibold">Need guidance?</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#756D67]">
          Ask the AI Profile Coach or contact our team.
        </p>
        <div className="mt-3 flex gap-3 text-xs font-semibold">
          <Link href="/pro/ai-coach" className="text-[#8B1E2D] hover:underline">
            Open coach
          </Link>
          <a href="mailto:support@masseurmatch.com" className="text-[#655E59] hover:underline">
            Support
          </a>
        </div>
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
        <button
          type="button"
          onClick={() => setMobileOpen((previous) => !previous)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-lg border border-[#E5DDD6] p-1.5 text-[#5E5752] transition-colors hover:bg-[#F7F3F0]"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
