"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FEATURES = [
  {
    title: "Ask in plain English",
    body: "“Deep tissue in Miami this weekend, outcall under $150” — Knotty understands and finds it.",
  },
  {
    title: "On every profile",
    body: "Each therapist has their own Knotty chat to answer questions about services, rates, and availability.",
  },
  {
    title: "Always-on guidance",
    body: "Knotty helps you compare specialties, cities, and session types — 24/7, no waiting.",
  },
];

/**
 * "Meet Knotty" — introduces the site's AI assistant with a branded mock chat.
 * Knotty powers natural-language search and lives on every therapist profile.
 */
export function MeetKnotty() {
  const reducedMotion = useReducedMotion();

  const reveal = (delay: number) =>
    reducedMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, ease: customEase, delay },
        };

  return (
    <section className="py-16 lg:py-24">
      {!reducedMotion && (
        <style>{`
          @keyframes _knottyDot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-3px);opacity:1}}
          ._kd1{animation:_knottyDot 1.2s ease-in-out infinite}
          ._kd2{animation:_knottyDot 1.2s ease-in-out infinite .15s}
          ._kd3{animation:_knottyDot 1.2s ease-in-out infinite .3s}
          @keyframes _knottyGlow{0%,100%{box-shadow:0 0 18px 2px rgba(255,138,31,.35)}50%{box-shadow:0 0 28px 6px rgba(255,138,31,.6)}}
          ._knottyAvatar{animation:_knottyGlow 2.6s ease-in-out infinite}
        `}</style>
      )}

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ── Left: copy ─────────────────────────────────────────────── */}
          <motion.div {...reveal(0.05)}>
            <div className="inline-flex items-center gap-2 rounded-full glass-dark px-3 py-1.5">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                Meet Knotty
              </span>
            </div>

            <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[0.95] tracking-tight">
              Your AI massage concierge.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Knotty is the built-in AI assistant that powers MasseurMatch. Search by
              just describing what you want, get instant answers, and chat with Knotty
              right on every therapist&apos;s profile.
            </p>

            <ul className="mt-8 space-y-5">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                    ✦
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{f.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/search"
              className="mt-9 inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 font-semibold text-primary-foreground transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            >
              Try Knotty search
            </Link>
          </motion.div>

          {/* ── Right: branded mock chat ───────────────────────────────── */}
          <motion.div {...reveal(0.12)}>
            <div className="relative mx-auto w-full max-w-md">
              {/* Ambient glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_60%_0%,rgba(255,138,31,0.18),transparent_70%)] blur-2xl"
              />

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a1628]/90 shadow-2xl backdrop-blur">
                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-600 font-display text-lg font-extrabold text-white ${
                      reducedMotion ? "" : "_knottyAvatar"
                    }`}
                  >
                    K
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Knotty</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-white/50">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      AI Assistant · online
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 px-5 py-6">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      Deep tissue in Miami this weekend, outcall under $150?
                    </div>
                  </div>

                  {/* Knotty reply */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/90 ring-1 ring-white/10">
                      Found <span className="font-semibold text-primary">7 therapists</span> in
                      Miami offering deep tissue + outcall this weekend under $150. Top match:
                      <span className="font-semibold text-white"> Marcus R.</span> — 4.9★, books
                      Saturday evenings. Want me to filter by neighborhood?
                    </div>
                  </div>

                  {/* Typing indicator */}
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/5 px-4 py-3 ring-1 ring-white/10">
                      <span className={`h-1.5 w-1.5 rounded-full bg-white/60 ${reducedMotion ? "" : "_kd1"}`} />
                      <span className={`h-1.5 w-1.5 rounded-full bg-white/60 ${reducedMotion ? "" : "_kd2"}`} />
                      <span className={`h-1.5 w-1.5 rounded-full bg-white/60 ${reducedMotion ? "" : "_kd3"}`} />
                    </div>
                  </div>
                </div>

                {/* Input bar (decorative) */}
                <div className="border-t border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3 rounded-full bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
                    <span className="flex-1 text-sm text-white/40">Ask Knotty anything…</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      ↑
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default MeetKnotty;
