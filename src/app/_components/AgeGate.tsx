"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// In-memory fallback for browsers where localStorage throws (Safari private
// mode, blocked storage). Keeps the acknowledgement for the page's lifetime.
let inMemoryAck = false;

const STORAGE_KEY = "mm_age_ack";

export function AgeGate() {
  // Rendered as a client-only overlay: the underlying page is still present in
  // the DOM (so crawlers and assistive tech see full content), we simply gate
  // interaction until the visitor confirms they are 18+.
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const ack = localStorage.getItem(STORAGE_KEY) === "true" || inMemoryAck;
      if (!ack) setShow(true);
    } catch {
      if (!inMemoryAck) setShow(true);
    }
  }, []);

  useEffect(() => {
    // Prevent the page behind the gate from scrolling while it is visible.
    if (!show) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [show]);

  const confirm = () => {
    inMemoryAck = true;
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // In-memory fallback above still applies.
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#111111]/85 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-7 shadow-2xl sm:p-8">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEE] text-[#8B1E2D]">
          <ShieldCheck className="h-6 w-6" strokeWidth={2.25} />
        </div>
        <h2 id="age-gate-title" className="font-display text-2xl font-bold tracking-tight text-[#111111]">
          Are you 18 or older?
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#6F6F6F]">
          MasseurMatch is a professional massage directory intended for adults. You must be at least 18 years
          old to enter. This site does not offer or facilitate sexual services.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={confirm}
            className="min-h-11 rounded-lg bg-[#8B1E2D] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6E1521] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E2D]"
          >
            I am 18 or older — enter
          </button>
          <a
            href="https://www.google.com"
            className="min-h-11 rounded-lg border border-[#E8E8E8] px-4 py-3 text-center text-sm font-semibold text-[#6F6F6F] transition-colors hover:bg-[#F7F7F7]"
          >
            Leave this site
          </a>
        </div>
        <p className="mt-5 text-xs leading-5 text-[#8E8E8E]">
          By entering you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-[#8B1E2D]">Terms</Link> and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-[#8B1E2D]">Privacy Policy</Link>.
          See our{" "}
          <Link href="/2257" className="underline underline-offset-2 hover:text-[#8B1E2D]">18 U.S.C. § 2257 notice</Link>.
        </p>
      </div>
    </div>
  );
}
