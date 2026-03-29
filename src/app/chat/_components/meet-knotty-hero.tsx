"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Send } from "lucide-react";

/* ───────────────── Quick-prompt chips ───────────────── */

const PROMPT_CHIPS = [
  { label: "Available now near me", searchUrl: "/search?keyword=available+now" },
  { label: "Visiting Dallas soon", searchUrl: "/search?keyword=visiting&city=Dallas" },
  { label: "Incall with photos", searchUrl: "/search?keyword=incall" },
  { label: "Outcall tonight", searchUrl: "/search?keyword=outcall+tonight" },
] as const;

/* ───────────────── Rotating placeholders ───────────────── */

const PLACEHOLDERS = [
  "Looking for incall in Dallas",
  "Who is available now?",
  "Find professionals visiting soon",
  "Show premium profiles near me",
  "Who offers outcall tonight?",
];

/* ───────────────── Component ───────────────── */

export function MeetKnottyHero() {
  const router = useRouter();

  /* Rotating placeholder text */
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  /* Chat state */
  const [greetingsVisible, setGreetingsVisible] = useState(0);
  const [userMsg, setUserMsg] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [knottyReply, setKnottyReply] = useState<string | null>(null);
  const [chipsDisabled, setChipsDisabled] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const pendingRedirect = useRef<string | null>(null);

  /* Reveal greeting bubbles */
  useEffect(() => {
    const t1 = setTimeout(() => setGreetingsVisible(1), 300);
    const t2 = setTimeout(() => setGreetingsVisible(2), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* Auto-scroll chat */
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [greetingsVisible, userMsg, isTyping, knottyReply]);

  /* Core interaction logic */
  const triggerDemo = useCallback(
    (text: string, redirectUrl: string) => {
      if (chipsDisabled) return;
      setChipsDisabled(true);
      setUserMsg(text);
      pendingRedirect.current = redirectUrl;

      // Show typing after brief pause
      setTimeout(() => setIsTyping(true), 400);

      // Show reply and redirect
      setTimeout(() => {
        setIsTyping(false);
        setKnottyReply(text);

        setTimeout(() => {
          if (pendingRedirect.current) {
            router.push(pendingRedirect.current);
          }
        }, 1500);
      }, 2000);
    },
    [chipsDisabled, router],
  );

  return (
    <section className="relative flex min-h-screen items-center px-6 pb-16 pt-24 lg:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* ─── Left column: copy ─── */}
        <div className="z-10 space-y-8">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white lg:text-7xl">
            Meet{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
              Knotty
            </span>
          </h1>

          <h2 className="text-2xl font-medium leading-snug text-gray-200 lg:text-3xl">
            The AI powered way to explore massage professionals on MasseurMatch.
          </h2>

          <p className="max-w-lg text-lg text-gray-400">
            Discover profiles faster, check availability signals, and find the right match with less
            guesswork. Search smarter.
          </p>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <a
              href="#explore"
              className="rounded-full bg-emerald-500 px-8 py-4 text-center font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-600"
            >
              Start Exploring
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/20 px-8 py-4 text-center font-semibold text-white transition-all hover:bg-white/5"
            >
              How Knotty Works
            </a>
          </div>
        </div>

        {/* ─── Right column: live chat demo ─── */}
        <div className="relative z-10 mx-auto w-full max-w-md lg:ml-auto">
          {/* Ambient glows */}
          <div className="pointer-events-none absolute -left-[10%] -top-[10%] -z-10 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-[10%] -right-[10%] -z-10 h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.12)_0%,transparent_70%)]" />

          <div className="flex h-[550px] flex-col overflow-hidden rounded-[28px] border border-white/[0.12] bg-white/[0.04] shadow-[0_24px_48px_rgba(0,15,30,0.6)] backdrop-blur-2xl">
            {/* Chat header */}
            <div className="flex items-center gap-4 border-b border-white/10 p-5">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-700 to-gray-900 shadow-inner">
                  <Zap className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0f1423] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-wide text-white">Knotty</h3>
                <p className="text-xs font-medium text-emerald-400">AI Guide Active</p>
              </div>
            </div>

            {/* Message area */}
            <div ref={chatRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
              {/* Greeting 1 */}
              <AnimatePresence>
                {greetingsVisible >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex max-w-[85%] gap-3"
                  >
                    <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-white/10 p-3.5 text-sm leading-relaxed text-gray-100 backdrop-blur-sm">
                      Hey there, I&rsquo;m Knotty.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Greeting 2 */}
              <AnimatePresence>
                {greetingsVisible >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex max-w-[85%] gap-3"
                  >
                    <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-white/10 p-3.5 text-sm leading-relaxed text-gray-100 backdrop-blur-sm">
                      Tell me what you need and I&rsquo;ll help guide your search.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User message */}
              <AnimatePresence>
                {userMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-4 flex w-full justify-end gap-3"
                  >
                    <div className="rounded-2xl rounded-tr-sm border border-emerald-500/30 bg-emerald-500/20 p-3.5 text-sm leading-relaxed text-emerald-100 backdrop-blur-sm">
                      {userMsg}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex max-w-[85%] gap-3"
                  >
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/5 bg-white/5 p-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-gray-400"
                          animate={{ scale: [0, 1, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.16 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Knotty reply */}
              <AnimatePresence>
                {knottyReply && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-2 flex max-w-[85%] gap-3"
                  >
                    <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-white/10 p-3.5 text-sm leading-relaxed text-gray-100 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-sm">
                      Great! Filtering directory for <strong>&ldquo;{knottyReply}&rdquo;</strong>.
                      Taking you there now&hellip;
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Prompt chips */}
            <div className="px-5 pb-3">
              <div className="scrollbar-none flex gap-2 overflow-x-auto py-2">
                {PROMPT_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    disabled={chipsDisabled}
                    onClick={() => triggerDemo(chip.label, chip.searchUrl)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300 transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input bar (decorative) */}
            <div className="rounded-b-[28px] border-t border-white/10 bg-black/20 p-5">
              <div className="relative flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex-1 overflow-hidden whitespace-nowrap text-sm text-gray-400">
                  {PLACEHOLDERS[placeholderIdx]}
                  <span className="ml-0.5 inline-block animate-pulse text-emerald-500">|</span>
                </span>
                <button
                  className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_0_0_rgba(16,185,129,0.4)] transition-colors animate-[pulse-green_2s_infinite] hover:bg-emerald-600"
                  aria-label="Send message"
                >
                  <Send className="ml-0.5 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── Trust bar ───────────────── */

export function TrustBar() {
  return (
    <section className="border-t border-white/10 bg-[#060913] py-16">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="mb-8 text-sm uppercase tracking-widest text-gray-500">
          Trusted by thousands of professionals
        </p>
        <div className="flex justify-center gap-12 opacity-50 grayscale">
          <div className="h-8 w-24 rounded bg-white/20" />
          <div className="hidden h-8 w-24 rounded bg-white/20 sm:block" />
          <div className="hidden h-8 w-24 rounded bg-white/20 md:block" />
          <div className="h-8 w-24 rounded bg-white/20" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────── Explore section ───────────────── */

export function ExploreSection() {
  return (
    <section id="explore" className="bg-[#0a0e1a] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">
          Explore by City or Category
        </h2>
      </div>
    </section>
  );
}
