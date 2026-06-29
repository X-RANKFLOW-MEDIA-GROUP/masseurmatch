"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = "name" | "email" | "city" | "role" | "saved" | "chat";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  typing?: boolean;
};

type Collected = {
  name: string;
  email: string;
  city: string;
  role: "therapist" | "visitor" | "";
};

// ── Constants ─────────────────────────────────────────────────────────────────

const INITIAL_MESSAGE =
  "Hey there! 👋 I'm Knotty — MasseurMatch's AI assistant. We're putting the finishing touches on something way better than MasseurFinder or RentMasseur. Want early access? What's your name?";

const STEP_PLACEHOLDERS: Record<Step, string> = {
  name: "Type your name…",
  email: "Type your email…",
  city: "Type your city…",
  role: "Therapist or client?",
  saved: "Ask me anything…",
  chat: "Ask me anything…",
};

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;

const THERAPIST_RE =
  /therapist|massage|masseur|professional|provider|practitioner|work|offer|practice|\b1\b|one|first/i;

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function extractEmail(text: string): string | null {
  const match = text.match(EMAIL_RE);
  return match ? match[0].toLowerCase() : null;
}

function extractRole(text: string): "therapist" | "visitor" {
  return THERAPIST_RE.test(text) ? "therapist" : "visitor";
}

function sanitize(text: string): string {
  return text.trim().replace(/[<>]/g, "").slice(0, 200);
}

// ── Typing bubble ─────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Knotty is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-current opacity-60"
          style={{ animation: `knotty-dot 1.2s ${i * 0.2}s ease-in-out infinite` }}
        />
      ))}
    </span>
  );
}

// ── Step progress strip ────────────────────────────────────────────────────────

const STEPS: Step[] = ["name", "email", "city", "role"];
const STEP_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  city: "City",
  role: "Role",
};

function StepProgress({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current as Step);
  const doneIdx = current === "saved" || current === "chat" ? 4 : idx;
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={[
              "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold transition-colors",
              i < doneIdx
                ? "bg-emerald-400 text-slate-950"
                : i === doneIdx
                  ? "bg-[#8B1E2D] text-white"
                  : "bg-white/10 text-white/40",
            ].join(" ")}
          >
            {i < doneIdx ? "✓" : i + 1}
          </div>
          <span
            className={[
              "text-[10px] font-medium tracking-wide",
              i < doneIdx
                ? "text-emerald-400"
                : i === doneIdx
                  ? "text-white"
                  : "text-white/30",
            ].join(" ")}
          >
            {STEP_LABELS[s]}
          </span>
          {i < STEPS.length - 1 && (
            <div className={["h-px w-4 transition-colors", i < doneIdx ? "bg-emerald-400/60" : "bg-white/10"].join(" ")} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function WaitlistChat() {
  const [step, setStep] = useState<Step>("name");
  const [collected, setCollected] = useState<Collected>({ name: "", email: "", city: "", role: "" });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [startedAt] = useState(() => Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll page to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Auto-start greeting after a short delay (typing then reveal)
  useEffect(() => {
    const greetingId = uid();
    const t1 = setTimeout(() => {
      setIsTyping(true);
      setMessages([{ id: greetingId, role: "assistant", content: "", typing: true }]);
    }, 1200);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      setMessages([{ id: greetingId, role: "assistant", content: INITIAL_MESSAGE, typing: false }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const raw = input.trim();
    if (!raw || isTyping) return;

    setInput("");
    setEmailError("");

    // Validate email step before sending
    if (step === "email") {
      const extracted = extractEmail(raw);
      if (!extracted) {
        setEmailError("That doesn't look like a valid email — try again.");
        return;
      }
    }

    // Add user message
    const userMsg: Message = { id: uid(), role: "user", content: raw };
    setMessages((prev) => [...prev, userMsg]);

    // Extract data from user input
    const nextCollected = { ...collected };
    let nextStep: Step = step;

    if (step === "name") {
      nextCollected.name = sanitize(raw.split(" ")[0]); // first word as first name
      nextStep = "email";
    } else if (step === "email") {
      nextCollected.email = extractEmail(raw) ?? raw.toLowerCase().trim();
      nextStep = "city";
    } else if (step === "city") {
      nextCollected.city = sanitize(raw);
      nextStep = "role";
    } else if (step === "role") {
      nextCollected.role = extractRole(raw);
      nextStep = "saved";
    }

    setCollected(nextCollected);

    // Build conversation history for the API (exclude typing placeholder)
    const history = [...messages, userMsg]
      .filter((m) => !m.typing)
      .map((m) => ({ role: m.role, content: m.content }));

    // Show typing indicator
    const typingId = uid();
    setIsTyping(true);
    setMessages((prev) => [
      ...prev,
      { id: typingId, role: "assistant", content: "", typing: true },
    ]);

    // Save to waitlist DB when all data collected
    if (nextStep === "saved") {
      void fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nextCollected.email,
          role: nextCollected.role === "therapist" ? "therapist" : "visitor",
          campaign: "knotty_waitlist_chat",
          pagePath: "/waitlist",
          startedAt,
          metadata: {
            name: nextCollected.name,
            city: nextCollected.city,
            source: "knotty_chat",
          },
        }),
      }).catch(() => {
        // silently ignore — don't break the chat experience
      });
    }

    // Get AI response
    try {
      const res = await fetch("/api/knotty-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          step: nextStep,
          collected: nextCollected,
        }),
      });
      const data = (await res.json()) as { ok: boolean; reply?: string };
      const reply = data.reply ?? "Awesome! Keep going — we're almost there.";

      setMessages((prev) =>
        prev.map((m) => (m.id === typingId ? { ...m, content: reply, typing: false } : m)),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? { ...m, content: "Connection blip — but you're still on track! Keep going.", typing: false }
            : m,
        ),
      );
    } finally {
      setIsTyping(false);
      setStep(nextStep === "saved" ? "chat" : nextStep);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  const isDone = step === "chat";
  const placeholder = STEP_PLACEHOLDERS[step] ?? "Type your message…";

  return (
    <>
      {/* Keyframe for typing dots */}
      <style>{`
        @keyframes knotty-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="flex h-[580px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f1a] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B1E2D]/20 text-[#8B1E2D]">
            <Sparkles className="h-4.5 w-4.5" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Knotty</p>
            <p className="text-[10px] text-white/40 tracking-wide">MasseurMatch AI · Waitlist</p>
          </div>
          {isDone && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
              <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              On the list
            </span>
          )}
        </div>

        {/* Step progress */}
        {!isDone && <StepProgress current={step} />}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={[
                "flex gap-2.5",
                msg.role === "user" ? "justify-end" : "justify-start",
              ].join(" ")}
            >
              {msg.role === "assistant" && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#8B1E2D]/15 text-[#8B1E2D]">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                </div>
              )}
              <div
                className={[
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "rounded-tr-sm bg-[#8B1E2D] text-white"
                    : "rounded-tl-sm bg-white/8 text-white/90",
                ].join(" ")}
              >
                {msg.typing ? <TypingDots /> : msg.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Email error */}
        {emailError && (
          <p className="px-4 pb-1 text-xs text-red-400">{emailError}</p>
        )}

        {/* Input */}
        <form
          className="border-t border-white/10 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <div className="flex items-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-2.5 focus-within:border-[#8B1E2D]/60 transition-colors">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              autoComplete={step === "email" ? "email" : "off"}
              disabled={isTyping}
              aria-label={placeholder}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8B1E2D] text-white transition hover:bg-[#6E1521] disabled:opacity-40"
              aria-label="Send message"
            >
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
