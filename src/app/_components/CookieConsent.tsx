"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      setShow(false);
      return;
    }

    const consent = localStorage.getItem("mm_cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, [pathname]);

  const savePreference = (value: "accepted" | "rejected") => {
    localStorage.setItem("mm_cookie_consent", value);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-3 left-3 right-3 z-50 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm"
      aria-live="polite"
    >
      <div className="max-h-[46vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/20">
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Privacy preferences</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              We use essential cookies for site function and optional cookies to improve the
              experience. Review our{" "}
              <Link href="/cookie-policy" className="font-semibold text-[#1A1A1A] underline underline-offset-2 hover:text-[#8B1E2D]">
                Cookie Policy
              </Link>
              .
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => savePreference("rejected")}
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => savePreference("accepted")}
              className="min-h-10 rounded-lg bg-[#8B1E2D] px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6E1521] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E2D]"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
