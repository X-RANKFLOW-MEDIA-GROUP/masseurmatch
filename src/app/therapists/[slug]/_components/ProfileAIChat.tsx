"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";

/* ─── types ──────────────────────────────────────────────────────────────── */
type Phase = "idle" | "analyzing" | "streaming";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

interface Props {
  profile: PublicTherapist;
}

/* ─── response generator ─────────────────────────────────────────────────── */
function buildResponse(question: string, profile: PublicTherapist, name: string): string {
  const city = profile.city || "the area";
  const neighborhood = profile.neighborhood_name || profile.primary_area || "";
  const q = question.toLowerCase();

  if (q.includes("rate") || q.includes("price") || q.includes("cost") || q.includes("how much")) {
    const i = profile.incall_price, o = profile.outcall_price;
    if (i && o) return `${name}'s sessions start at $${i} for incall and $${o} for outcall (60 min). Rates vary by session length and modality — contact ${name} directly for exact pricing.`;
    if (i) return `${name}'s incall sessions start at $${i} / 60 min. Contact them for pricing on longer sessions.`;
    if (o) return `${name}'s outcall sessions start at $${o} / 60 min. Travel fees may apply depending on your location.`;
    return `Contact ${name} directly using the buttons above for current pricing — it varies by session length and type.`;
  }

  if (q.includes("outcall") || q.includes("mobile") || q.includes("come to") || q.includes("travel to me")) {
    if (profile.outcall_price)
      return `Yes! ${name} offers outcall services in ${city}${neighborhood ? `, including ${neighborhood}` : ""}. Outcall starts at $${profile.outcall_price}. Travel fees may apply outside the primary service area.`;
    return `${name} currently focuses on incall sessions. Reach out directly to ask about outcall availability.`;
  }

  if (q.includes("incall") || q.includes("your place") || q.includes("studio") || q.includes("location")) {
    if (profile.incall_price)
      return `${name} offers incall sessions at their private studio in ${neighborhood || city}. Starting at $${profile.incall_price}. The exact address is shared after you book.`;
    return `Contact ${name} directly for incall location details and availability.`;
  }

  if (q.includes("special") || q.includes("type") || q.includes("modali") || q.includes("technique")) {
    if (profile.specialties?.length)
      return `${name} specializes in ${profile.specialties.join(", ")}. Sessions are customized to your needs — they can blend modalities for a tailored experience.`;
    return `${name} offers a range of techniques. Contact them to discuss which modalities would work best for you.`;
  }

  if (q.includes("book") || q.includes("schedule") || q.includes("appointment")) {
    return `To connect with ${name}:\n\n1. Text via the SMS button\n2. Call directly\n3. Message on WhatsApp\n\nContact them directly to confirm availability and discuss what you need.`;
  }

  if (q.includes("experience") || q.includes("how long") || q.includes("years")) {
    const years = profile.years_experience || (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
    if (years) return `${name} has ${years}+ years of professional experience and provides a safe, professional environment for all clients.`;
    return `${name} is an experienced therapist — check their About section for full background and training details.`;
  }

  if (q.includes("available") || q.includes("open") || q.includes("when")) {
    if (profile.available_now) return `${name} is currently available! You can reach out right now via the contact buttons on this page.`;
    return `Check the Availability section on this page for ${name}'s open slots, or contact them directly for real-time availability.`;
  }

  if (q.includes("lgbtq") || q.includes("gay") || q.includes("affirm") || q.includes("queer")) {
    if (profile.lgbtq_affirming)
      return `Absolutely — ${name} is an LGBTQ+ affirming therapist who maintains a welcoming, judgment-free environment. Your comfort and safety are their priority.`;
    return `${name} maintains a respectful, professional environment for all clients. Contact them directly with any specific questions.`;
  }

  if (q.includes("cancel") || q.includes("reschedule") || q.includes("policy")) {
    return `For ${name}'s cancellation policy and scheduling details, please ask them directly when you reach out — it varies by provider.`;
  }

  return `Great question! For specifics about ${name}'s services, reaching out directly via the contact buttons is your best bet — they're happy to answer. Anything else I can help clarify from their profile?`;
}

/* ─── component ──────────────────────────────────────────────────────────── */
export function ProfileAIChat({ profile }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [streamText, setStreamText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const name = getPublicProfileName(profile).split(" ")[0];

  const INTRO = `Hi! I'm Knotty AI — ${name}'s profile assistant. Ask me about their rates, services, availability, or anything else. What can I help you with?`;

  const QUICK_QUESTIONS = [
    `What are ${name}'s rates?`,
    `Does ${name} offer outcall?`,
    `What specialties does ${name} have?`,
    `Is ${name} LGBTQ+ affirming?`,
  ];

  /* auto-scroll */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, phase, streamText]);

  /* cleanup timers on unmount */
  useEffect(() => () => { if (streamRef.current) clearTimeout(streamRef.current); }, []);

  /* typewriter stream */
  const streamResponse = useCallback((fullText: string) => {
    setPhase("streaming");
    setStreamText("");
    let i = 0;
    const tick = () => {
      i++;
      setStreamText(fullText.slice(0, i));
      if (i < fullText.length) {
        // vary speed slightly for naturalness: punctuation pauses longer
        const ch = fullText[i - 1];
        const delay = /[.!?]/.test(ch) ? 55 : /[,;:]/.test(ch) ? 30 : /[\n]/.test(ch) ? 80 : 18 + Math.random() * 10;
        streamRef.current = setTimeout(tick, delay);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", text: fullText }]);
        setStreamText("");
        setPhase("idle");
      }
    };
    streamRef.current = setTimeout(tick, 18);
  }, []);

  /* send a message */
  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || phase !== "idle") return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text: trimmed }]);
    setInput("");
    setPhase("analyzing");

    // analyze delay: 1.2 – 1.8 s
    const analyzeMs = 1200 + Math.random() * 600;
    streamRef.current = setTimeout(() => {
      const response = buildResponse(trimmed, profile, name);
      streamResponse(response);
    }, analyzeMs);
  }, [phase, profile, name, streamResponse]);

  const handleQuick = (q: string) => send(q);

  const open = () => {
    setIsOpen(true);
    if (!hasStarted) {
      setHasStarted(true);
      setMessages([{ id: "intro", role: "ai", text: INTRO }]);
    }
  };

  /* ── render ── */
  return (
    <div className="pp-ai-chat">
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={open}
            aria-label="Ask Knotty AI"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg, #8B1E2D 0%, #6E1521 100%)",
              boxShadow: "0 8px 32px rgba(139,30,45,0.45), 0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 32, scale: 0.94, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.96, rotateX: 4 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed bottom-6 right-6 z-50 flex w-[380px] flex-col overflow-hidden"
            style={{
              height: 530,
              borderRadius: 24,
              /* 3-D depth look: top-highlight + deep shadow stack */
              background: "linear-gradient(160deg, rgba(255,252,248,0.98) 0%, rgba(255,248,238,0.95) 100%)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.85)",
              boxShadow: [
                "0 0 0 1px rgba(139,30,45,0.12)",         /* brand ring */
                "0 4px 0 -1px rgba(255,255,255,0.9)",      /* top-face highlight */
                "0 8px 24px rgba(17,17,17,0.10)",          /* mid shadow */
                "0 24px 56px rgba(17,17,17,0.16)",         /* depth shadow */
                "0 48px 96px rgba(17,17,17,0.10)",         /* ambient */
                "inset 0 1px 0 rgba(255,255,255,1)",       /* inner top-edge */
                "inset 0 -1px 0 rgba(17,17,17,0.06)",      /* inner bottom-edge */
              ].join(", "),
              /* subtle 3-D tilt — feels like a physical card */
              perspective: "1200px",
              transform: "perspective(1200px) rotateX(1deg)",
              transformOrigin: "50% 100%",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex shrink-0 items-center justify-between px-5 py-4"
              style={{
                background: "linear-gradient(135deg, rgba(139,30,45,0.12) 0%, rgba(255,100,0,0.06) 100%)",
                borderBottom: "1px solid rgba(17,17,17,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                {/* avatar */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #8B1E2D 0%, #6E1521 100%)",
                    boxShadow: "0 4px 12px rgba(139,30,45,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  <Bot className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Knotty AI</p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full bg-emerald-400"
                      style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)", animation: "pulse 2s infinite" }}
                    />
                    <p className="text-[11px] font-medium text-slate-500">Answers about {name}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (streamRef.current) clearTimeout(streamRef.current);
                  setPhase("idle");
                  setStreamText("");
                  setIsOpen(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full transition"
                style={{ background: "rgba(17,17,17,0.06)" }}
                aria-label="Close chat"
              >
                <X className="h-4 w-4 text-slate-500" strokeWidth={2} />
              </button>
            </div>

            {/* ── Messages ── */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(17,17,17,0.1) transparent",
              }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`max-w-[85%] whitespace-pre-line rounded-[18px] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "ai"
                      ? "mr-auto"
                      : "ml-auto"
                  }`}
                  style={
                    msg.role === "ai"
                      ? {
                          background: "rgba(255,255,255,0.9)",
                          border: "1px solid rgba(17,17,17,0.07)",
                          color: "#1e293b",
                          boxShadow: "0 2px 8px rgba(17,17,17,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                        }
                      : {
                          background: "linear-gradient(135deg, #8B1E2D 0%, #6E1521 100%)",
                          color: "#fff",
                          boxShadow: "0 4px 12px rgba(139,30,45,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                        }
                  }
                >
                  {msg.text}
                </motion.div>
              ))}

              {/* Analyzing phase */}
              {phase === "analyzing" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mr-auto flex max-w-[85%] items-center gap-2.5 rounded-[18px] px-4 py-3"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(17,17,17,0.07)",
                    boxShadow: "0 2px 8px rgba(17,17,17,0.06)",
                  }}
                >
                  <Sparkles
                    className="h-3.5 w-3.5 shrink-0 text-amber-500"
                    strokeWidth={2}
                    style={{ animation: "spin 1.6s linear infinite" }}
                  />
                  <span className="text-xs font-medium text-slate-400">Analyzing your question…</span>
                </motion.div>
              )}

              {/* Streaming phase */}
              {phase === "streaming" && streamText && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mr-auto max-w-[85%] whitespace-pre-line rounded-[18px] px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(17,17,17,0.07)",
                    color: "#1e293b",
                    boxShadow: "0 2px 8px rgba(17,17,17,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  {streamText}
                  <span
                    className="ml-0.5 inline-block h-3.5 w-0.5 align-middle"
                    style={{
                      background: "#8B1E2D",
                      animation: "blink 0.7s step-end infinite",
                    }}
                  />
                </motion.div>
              )}
            </div>

            {/* ── Quick questions ── */}
            <AnimatePresence>
              {messages.length <= 1 && phase === "idle" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="shrink-0 overflow-hidden px-4 pb-2"
                >
                  <p
                    className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "rgba(17,17,17,0.35)" }}
                  >
                    Quick questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQuick(q)}
                        className="rounded-full px-3 py-1.5 text-[11px] font-medium transition"
                        style={{
                          background: "rgba(139,30,45,0.08)",
                          border: "1px solid rgba(139,30,45,0.2)",
                          color: "#b45309",
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input bar ── */}
            <div
              className="shrink-0 px-4 py-3"
              style={{ borderTop: "1px solid rgba(17,17,17,0.06)", background: "rgba(255,255,255,0.6)" }}
            >
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(17,17,17,0.1)",
                  boxShadow: "0 2px 8px rgba(17,17,17,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder={`Ask about ${name}…`}
                  disabled={phase !== "idle"}
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || phase !== "idle"}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition disabled:opacity-30"
                  style={{
                    background: "linear-gradient(135deg, #8B1E2D 0%, #6E1521 100%)",
                    boxShadow: "0 2px 8px rgba(139,30,45,0.4)",
                  }}
                  aria-label="Send"
                >
                  <Send className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px]" style={{ color: "rgba(17,17,17,0.25)" }}>
                Powered by Knotty AI · Elite feature
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* keyframe styles injected once */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
