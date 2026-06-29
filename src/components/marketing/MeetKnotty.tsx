"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { IconMessage, IconSearch, IconSpark } from "@/components/icons";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FEATURES = [
  {
    icon: IconSearch,
    title: "Ask in plain English",
    body: "“Deep tissue in Miami this weekend, outcall under $150” — Knotty understands and finds it.",
  },
  {
    icon: IconMessage,
    title: "On every profile",
    body: "Each therapist has their own Knotty chat to answer questions about services, rates, and availability.",
  },
  {
    icon: IconSpark,
    title: "Always-on guidance",
    body: "Compare specialties, cities, and session types — 24/7, with instant answers.",
  },
];

type Msg = { id: number; role: "user" | "bot"; text: string };

// Auto-played opening conversation.
const SCRIPT: { role: "user" | "bot"; text: string }[] = [
  { role: "user", text: "Deep tissue in Miami this weekend, outcall under $150?" },
  {
    role: "bot",
    text: "Found 7 therapists in Miami offering deep-tissue outcall this weekend under $150. Top match: Marcus R. — available Saturday evenings.",
  },
  { role: "user", text: "Who’s available Sunday morning?" },
  { role: "bot", text: "3 of them have Sunday-morning slots. Want me to sort by distance from South Beach?" },
];

// Clickable suggestion chips → canned answers (demo, no backend yet).
const PROMPTS = ["Sports massage near me", "LGBTQ+ friendly in NYC", "Incall vs outcall?"];
const ANSWERS: Record<string, string> = {
  "Sports massage near me":
    "I found 12 sports-massage specialists near you. The closest is 1.2 mi away with same-day availability.",
  "LGBTQ+ friendly in NYC":
    "Every NYC therapist here is LGBTQ+-affirming — 24 are open this week. Want me to filter by neighborhood?",
  "Incall vs outcall?":
    "Incall = you visit the therapist’s studio. Outcall = they travel to your home or hotel. Many offer both.",
};
const FALLBACK =
  "Great question — in the live app I’ll search that instantly. Open Knotty search to try it for real ↗";

/**
 * "Meet Knotty" — introduces the site's AI assistant with a live, interactive
 * demo chat: it auto-types an opening conversation, then visitors can tap
 * suggested prompts (or type) to get instant canned answers. The real
 * AI backend is wired up separately.
 */
export function MeetKnotty() {
  const reducedMotion = useReducedMotion();

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");

  const idRef = useRef(0);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const push = useCallback((role: Msg["role"], text: string) => {
    idRef.current += 1;
    setMsgs((prev) => [...prev, { id: idRef.current, role, text }]);
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const t = window.setTimeout(fn, delay);
    timers.current.push(t);
  }, []);

  // Play the opening script once the section scrolls into view.
  const start = useCallback(() => {
    if (started.current) return;
    started.current = true;

    if (reducedMotion) {
      SCRIPT.forEach((line) => push(line.role, line.text));
      return;
    }

    let delay = 500;
    SCRIPT.forEach((line) => {
      if (line.role === "user") {
        schedule(() => push("user", line.text), delay);
        delay += 1000;
      } else {
        schedule(() => setTyping(true), delay);
        delay += 1200;
        schedule(() => {
          setTyping(false);
          push("bot", line.text);
        }, delay);
        delay += 800;
      }
    });
  }, [push, schedule, reducedMotion]);

  useEffect(() => {
    const all = timers.current;
    return () => all.forEach((t) => window.clearTimeout(t));
  }, []);

  // Keep the latest message in view inside the scroll container.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
  }, [msgs, typing, reducedMotion]);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text || typing) return;
    push("user", text);
    setInput("");
    if (reducedMotion) {
      push("bot", ANSWERS[text] ?? FALLBACK);
      return;
    }
    setTyping(true);
    schedule(() => {
      setTyping(false);
      push("bot", ANSWERS[text] ?? FALLBACK);
    }, 1100);
  };

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
          @keyframes _knottyDot{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-3px);opacity:1}}
          ._kd1{animation:_knottyDot 1.2s ease-in-out infinite}
          ._kd2{animation:_knottyDot 1.2s ease-in-out infinite .15s}
          ._kd3{animation:_knottyDot 1.2s ease-in-out infinite .3s}
        `}</style>
      )}

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ── Left: copy ─────────────────────────────────────────────── */}
          <motion.div {...reveal(0.05)}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
              <IconSpark size={14} className="text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Meet Knotty
              </span>
            </div>

            <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[0.95] tracking-tight text-foreground">
              Your AI massage concierge.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Knotty is the built-in AI assistant that powers MasseurMatch. Search by just
              describing what you want, get instant answers, and chat with Knotty right on
              every therapist&apos;s profile.
            </p>

            <ul className="mt-8 space-y-5">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon size={20} />
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
              className="mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 font-semibold text-primary-foreground transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            >
              <IconSearch size={16} />
              Try Knotty search
            </Link>
          </motion.div>

          {/* ── Right: live interactive demo chat ──────────────────────── */}
          <motion.div {...reveal(0.12)} onViewportEnter={start}>
            <div className="relative mx-auto w-full max-w-md">
              {/* Ambient glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_60%_0%,rgba(139,30,45,0.22),transparent_70%)] blur-2xl"
              />

              <div className="overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgba(17,17,17,0.28)] ring-1 ring-slate-200">
                {/* Chat header — vibrant gradient */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-primary via-red-600 to-red-500 px-5 py-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur">
                    <IconSpark size={20} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Knotty</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.9)]" />
                      AI Assistant · online
                    </p>
                  </div>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Live demo
                  </span>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="h-[300px] space-y-3 overflow-y-auto bg-slate-50 px-4 py-5">
                  {msgs.map((m) =>
                    m.role === "user" ? (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[82%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div key={m.id} className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200">
                          {m.text}
                        </div>
                      </div>
                    )
                  )}

                  {typing && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 ring-1 ring-slate-200">
                        <span className={`h-1.5 w-1.5 rounded-full bg-slate-400 ${reducedMotion ? "" : "_kd1"}`} />
                        <span className={`h-1.5 w-1.5 rounded-full bg-slate-400 ${reducedMotion ? "" : "_kd2"}`} />
                        <span className={`h-1.5 w-1.5 rounded-full bg-slate-400 ${reducedMotion ? "" : "_kd3"}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-4 pt-3">
                  {PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => ask(p)}
                      disabled={typing}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    ask(input);
                  }}
                  className="flex items-center gap-2 bg-white px-4 py-3"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Knotty anything…"
                    aria-label="Ask Knotty"
                    className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:bg-white focus:ring-primary/40"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || typing}
                    aria-label="Send"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:scale-105 disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default MeetKnotty;
