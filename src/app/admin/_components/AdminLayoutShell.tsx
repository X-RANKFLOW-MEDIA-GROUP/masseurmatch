"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import AdminSidebarNav from "./AdminSidebar";

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(220,33%,97%)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm md:flex">
        <div className="flex h-14 items-center border-b border-slate-100 px-5">
          <Link href="/admin" className="font-display text-lg font-bold tracking-tight text-slate-900">
            Admin
          </Link>
        </div>
        <AdminSidebarNav />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="font-display text-base font-bold tracking-tight text-slate-900">
          Admin
        </Link>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl md:hidden"
            >
              <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
                <Link href="/admin" className="font-display text-base font-bold tracking-tight text-slate-900">
                  Admin
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AdminSidebarNav />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Desktop header */}
        <header className="sticky top-0 z-20 hidden h-14 shrink-0 items-center border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl md:flex">
          <span className="text-sm font-semibold text-muted-foreground">Admin Panel</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pt-[72px] md:p-6 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
