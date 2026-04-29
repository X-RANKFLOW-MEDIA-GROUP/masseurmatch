"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart,
  BookUser,
  CreditCard,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  Mail,
  Menu,
  Plane,
  Settings,
  Ticket,
  UserCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Dashboard", href: "/pro/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/pro/listing", icon: UserCircle },
  { name: "Photos", href: "/pro/photos", icon: ImageIcon },
  { name: "Inquiries", href: "/pro/inquiries", icon: Mail },
  { name: "Tickets", href: "/pro/tickets", icon: Ticket },
  { name: "Travel HTML", href: "/pro/travel-system", icon: Plane },
  { name: "Analytics", href: "/pro/analytics", icon: BarChart },
  { name: "Subscription", href: "/pro/subscription", icon: CreditCard },
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

  const sidebarContent = (
    <>
      <div className="p-4">
        <Link href="/pro/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
            <BookUser className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold text-sidebar-foreground">
            Pro Dashboard
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive ? (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-lg border border-primary/20 bg-primary/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              ) : null}
              <span
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-border bg-sidebar-accent/30 p-4">
        <p className="text-xs text-muted-foreground">
          Need help?{" "}
          <a href="mailto:support@masseurmatch.com" className="text-primary underline">
            Contact support
          </a>
        </p>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen overflow-hidden bg-[hsl(220,33%,97%)]">
      <aside className="z-20 hidden w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
        {sidebarContent}
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-white/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/pro/dashboard" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookUser className="h-4 w-4 text-primary" />
          Pro Dashboard
        </Link>
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
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
              className="fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-xs flex-col border-r border-border bg-sidebar text-sidebar-foreground shadow-2xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
