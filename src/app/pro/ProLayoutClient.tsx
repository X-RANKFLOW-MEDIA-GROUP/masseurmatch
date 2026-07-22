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
];

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
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src={BRAND_ASSETS.logo} alt="MasseurMatch" width={160} height={32} className="h-8 w-auto" />
          <span className="align-top font-mono text-[10px] uppercase tracking-[0.18em] text-[#C4344A]">
            PRO
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive ? (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              ) : null}
              <span
                className={`relative flex items-center gap-3 rounded-lg px-4 py-3 font-sans text-sm transition-colors ${
                  isActive
                    ? "font-medium text-white"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white/90"
                }`}
              >
                {isActive ? (
                  <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full border-l-2 border-brand-secondary" />
                ) : null}
                <item.icon className="h-4 w-4" strokeWidth={2.25} />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="m-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-sans text-xs text-white/55">
          Need help?{" "}
          <a href="mailto:support@masseurmatch.com" className="text-[#C4344A] underline underline-offset-2">
            Contact support
          </a>
        </p>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-bg-subtle">
      <aside className="z-20 hidden w-64 flex-col border-r border-white/10 bg-[#111111] text-white shadow-2xl md:flex">
        {sidebarContent}
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#111111] px-4 py-3 md:hidden">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src={BRAND_ASSETS.logo} alt="MasseurMatch" width={128} height={28} className="h-7 w-auto" />
          <span className="align-top font-mono text-[9px] uppercase tracking-[0.18em] text-[#C4344A]">
            PRO
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10"
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
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#111111] text-white shadow-2xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto bg-bg-subtle pt-14 md:pt-0">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : children}
      </div>
    </div>
  );
}
