"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

const STORAGE_KEY = "knotty-intro-banner-dismissed";
const AUTO_DISMISS_MS = 10_000;

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

const shakeKeyframes = {
  x: [0, -6, 6, -4, 4, -2, 2, 0],
  rotate: [0, -1.5, 1.5, -1, 1, -0.5, 0.5, 0],
};

export function KnottyIntroBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (_) { /* localStorage may be unavailable */ }
  }, []);

  useEffect(() => {
    if (!pathname || !isPublicRoute(pathname)) {
      setVisible(false);
      return;
    }

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch (_) {
      return;
    }

    const showTimer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(showTimer);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const autoDismiss = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(autoDismiss);
  }, [visible, dismiss]);

  function handleCta() {
    dismiss();
    window.dispatchEvent(new CustomEvent("knotty:open"));
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="knotty-intro-banner"
          initial={{ y: 120, opacity: 0, scale: 0.92 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 320, damping: 22 },
          }}
          exit={{
            y: 80,
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.3, ease: "easeIn" },
          }}
          className="fixed inset-x-0 bottom-6 z-[60] mx-auto flex w-[calc(100%-1.5rem)] max-w-md items-center gap-3 rounded-2xl border border-blue-200/40 bg-white px-4 py-3.5 shadow-[0_8px_40px_rgba(30,75,143,0.22),0_2px_12px_rgba(0,0,0,0.08)] sm:bottom-8 sm:gap-4 sm:px-5 sm:py-4"
        >
          <motion.div
            animate={shakeKeyframes}
            transition={{
              delay: 0.4,
              duration: 0.6,
              ease: "easeInOut",
              repeat: 2,
              repeatDelay: 2.5,
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold leading-tight text-slate-900 sm:text-sm">
              Meet <span className="text-blue-600">Knotty</span>
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500 sm:text-xs">
              Your AI massage concierge — try it!
            </p>
          </div>

          <button
            type="button"
            onClick={handleCta}
            className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 sm:text-xs"
          >
            Ask Knotty
          </button>

          <button
            type="button"
            onClick={dismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Dismiss Knotty intro"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
            className="absolute bottom-0 left-4 right-4 h-[2px] origin-left rounded-full bg-blue-500/30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
