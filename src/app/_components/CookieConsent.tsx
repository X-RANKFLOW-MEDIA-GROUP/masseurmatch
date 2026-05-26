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

  const accept = () => {
    localStorage.setItem("mm_cookie_consent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-slate-900">We value your privacy</h3>
            <p className="mt-2 text-sm text-slate-600">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
              <Link href="/cookie-policy" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Read Cookie Policy
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              onClick={accept}
              className="rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Accept All
            </button>
            <button
              onClick={() => setShow(false)}
              className="rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
