"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

const STORAGE_KEY = "knotty-intro-banner-dismissed";

const EXCLUDED_PREFIXES = [
  "/admin",
  "/pro",
  "/auth",
  "/dashboard",
  "/login",
  "/register",
  "/signup",
  "/sign-in",
  "/sign-up",
  "/chat",
];

function isPublicRoute(pathname: string): boolean {
  return !EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function KnottyIntroBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pathname || !isPublicRoute(pathname)) {
      setVisible(false);
      return;
    }

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [pathname]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (_) { /* localStorage may be unavailable */ }
  }

  function handleCta() {
    dismiss();
    window.dispatchEvent(new CustomEvent("knotty:open"));
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="knotty-intro-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-24 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-lg items-center gap-3 rounded-2xl border border-white/15 bg-[rgba(10,24,42,0.82)] px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:bottom-28 sm:gap-4 sm:px-5 sm:py-3.5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.08] text-white">
            <Sparkles className="h-4 w-4" />
          </div>

          <p className="flex-1 text-sm font-medium leading-snug text-white/90">
            Meet <span className="font-semibold text-white">Knotty</span> — your
            AI massage concierge
          </p>

          <button
            type="button"
            onClick={handleCta}
            className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-900 transition hover:bg-white/90"
          >
            Ask Knotty
          </button>

          <button
            type="button"
            onClick={dismiss}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white/80"
            aria-label="Dismiss Knotty intro"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
