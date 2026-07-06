"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clock3, MapPinned, Send, MessageCircle, ShieldCheck, X } from "lucide-react";
import { useKnotty } from "@/hooks/useKnotty";
import { cn } from "@/lib/utils";
import type { KnottyRecommendation } from "@/lib/knotty/types";

type KnottyChatProps = {
  mode?: "floating" | "embedded";
  promptExamples?: string[];
  className?: string;
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-[7px] w-[7px] animate-knotty-pulse rounded-full bg-[#8B1E2D]/60"
          style={{ animationDelay: `${index * 180}ms` }}
        />
      ))}
    </div>
  );
}

function useTypewriter(text: string, enabled: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [isDone, setIsDone] = useState(!enabled);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setIsDone(true);
      return;
    }

    setDisplayed("");
    setIsDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setIsDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed + Math.random() * 12);

    return () => clearInterval(interval);
  }, [text, enabled, speed]);

  return { displayed, isDone };
}

function RecommendationCard({
  recommendation,
  featured = false,
  onOpen,
}: {
  recommendation: KnottyRecommendation;
  featured?: boolean;
  onOpen: (recommendation: KnottyRecommendation) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border px-4 py-4",
        featured
          ? "border-[#8B1E2D]/25 bg-[#F8EDEE] text-[#151515]"
          : "border-black/[0.08] bg-[#FAFAFA] text-[#2B3038]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F6F6F]">
            {featured ? "Top Match" : `Alternative ${recommendation.position}`}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#151515]">{recommendation.name}</h3>
          <p className="mt-1 text-sm text-[#6F6F6F]">
            {recommendation.neighborhood || recommendation.city || "Local area"} · {recommendation.specialty}
          </p>
        </div>
        {recommendation.verified ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#8B1E2D]/20 bg-[#8B1E2D]/[0.08] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B1E2D]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Active
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6F6F6F]">
        {recommendation.availableNow ? (
          <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1">
            <Clock3 className="mr-1 inline h-3.5 w-3.5" />
            Available now
          </span>
        ) : null}
        {typeof recommendation.distanceMiles === "number" ? (
          <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1">
            <MapPinned className="mr-1 inline h-3.5 w-3.5" />
            {recommendation.distanceMiles < 10
              ? `${recommendation.distanceMiles.toFixed(1)} mi`
              : `${Math.round(recommendation.distanceMiles)} mi`}
          </span>
        ) : null}
        {typeof recommendation.priceFrom === "number" ? (
          <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1">
            From ${recommendation.priceFrom}
          </span>
        ) : null}
      </div>

      <ul className="mt-3 list-disc list-inside space-y-2 text-sm leading-6 text-[#5F6673]">
        {recommendation.why.map((reason) => (
          <li key={`${recommendation.therapistId}-${reason}`}>{reason}</li>
        ))}
      </ul>

      <div className="mt-4">
        <Link
          href={recommendation.profilePath}
          onClick={() => onOpen(recommendation)}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold uppercase tracking-[0.12em] transition",
            featured
              ? "bg-[#8B1E2D] text-white hover:bg-[#6E1521]"
              : "border border-black/[0.1] bg-white text-[#151515] hover:border-[#8B1E2D]/40 hover:text-[#8B1E2D]",
          )}
        >
          View profile
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  isLatestAssistant,
  onRecommendationOpen,
  reduced,
}: {
  message: ReturnType<typeof useKnotty>["messages"][number];
  isLatestAssistant: boolean;
  onRecommendationOpen: (recommendation: KnottyRecommendation) => void;
  reduced: boolean | null;
}) {
  const isUser = message.role === "user";
  // Don't typewriter the seeded greeting — it should read as already there.
  const shouldAnimate = !isUser && isLatestAssistant && !message.seeded;
  const { displayed, isDone } = useTypewriter(message.content, shouldAnimate);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-[20px] rounded-br-sm bg-[#8B1E2D] px-4 py-3 text-sm leading-relaxed text-white shadow-[0_10px_28px_rgba(139,30,45,0.18)]">
          {message.content}
        </div>
      </div>
    );
  }

  const recommendations = [message.response?.primary, ...(message.response?.alternatives || [])].filter(
    (item): item is KnottyRecommendation => Boolean(item),
  );

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[88%] space-y-3 rounded-[22px] rounded-bl-sm border border-black/[0.06] bg-[#F0F0F0] px-4 py-3.5 text-sm leading-relaxed text-[#2B3038]">
        <p>
          {displayed}
          {!isDone && (
            <span className="ml-0.5 inline-block h-[14px] w-[2px] animate-pulse bg-[#8B1E2D]/70 align-middle" />
          )}
        </p>

        {isDone && recommendations.length > 0 ? (
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.4 }}
            className="space-y-3"
          >
            {recommendations.map((recommendation, index) => (
              <RecommendationCard
                key={`${recommendation.therapistId}-${recommendation.position}`}
                recommendation={recommendation}
                featured={index === 0}
                onOpen={onRecommendationOpen}
              />
            ))}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

function KnottyDisclaimer() {
  return (
    <p className="px-5 pb-4 pt-1 text-[11px] leading-5 text-[#6F6F6F]">
      Knotty is an AI assistant.{" "}
      <Link href="/platform-disclaimer" className="text-[#8B1E2D] underline-offset-2 hover:underline">
        Not medical or legal advice
      </Link>
      . MasseurMatch{" "}
      <Link href="/platform-disclaimer" className="text-[#8B1E2D] underline-offset-2 hover:underline">
        does not verify licenses or take bookings
      </Link>
      .
    </p>
  );
}

// Persists whether the floating chat is open or closed so the user's choice
// survives navigation between pages. Once a visitor closes Knotty we never
// auto-reopen it on subsequent pages.
const STORAGE_KEY = "knotty-chat-state";

export const KnottyChat = ({ mode = "floating", className }: KnottyChatProps) => {
  const isEmbedded = mode === "embedded";
  const reduced = useReducedMotion();
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const { input, isTyping, messages, sendMessage, setInput, trackOpen, trackRecommendationClick } =
    useKnotty();
  const endRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Holds the pending first-visit auto-open timer so an explicit open/close can
  // cancel it — otherwise a late-firing timer could undo a user's close.
  const autoOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True only when the panel was opened by an explicit user action, so we never
  // pull focus on an automatic or persisted ("open") page-load open.
  const userInitiatedOpenRef = useRef(false);

  const clearAutoOpenTimer = useCallback(() => {
    if (autoOpenTimerRef.current) {
      clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
    }
  }, []);

  const persistState = useCallback(
    (value: "open" | "closed") => {
      if (isEmbedded || typeof window === "undefined") return;
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch {
        /* localStorage unavailable (private mode / blocked) — ignore */
      }
    },
    [isEmbedded],
  );

  const openChat = useCallback(() => {
    clearAutoOpenTimer();
    userInitiatedOpenRef.current = true;
    setIsOpen(true);
    persistState("open");
    trackOpen();
  }, [clearAutoOpenTimer, persistState, trackOpen]);

  const closeChat = useCallback(() => {
    clearAutoOpenTimer();
    userInitiatedOpenRef.current = false;
    setIsOpen(false);
    persistState("closed");
    // Return focus to the launcher so keyboard users aren't stranded.
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, [clearAutoOpenTimer, persistState]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isEmbedded) {
      trackOpen();
    }
  }, [isEmbedded, trackOpen]);

  // Restore persisted open state for returning visitors who previously opened the chat.
  // Do NOT auto-open for new visitors — the chat opens only on explicit user action.
  useEffect(() => {
    if (isEmbedded) return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "open") {
        setIsOpen(true);
        trackOpen();
      }
    } catch {
      // localStorage unavailable — default to closed state
      setIsOpen(false);
    }
  }, [isEmbedded, trackOpen]);


  // Allow any part of the app to open the floating chat (optionally with a
  // prefilled prompt) by dispatching a `knotty:open` window event.
  useEffect(() => {
    if (isEmbedded) return;
    const handler = (event: Event) => {
      openChat();
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) {
        void sendMessage({ content: prompt });
      }
    };
    window.addEventListener("knotty:open", handler as EventListener);
    return () => window.removeEventListener("knotty:open", handler as EventListener);
  }, [isEmbedded, openChat, sendMessage]);

  // ESC closes the floating chat while it is open. Focus only moves into the
  // panel for explicit user-initiated opens — an automatic or persisted open
  // must never steal focus from whatever the visitor is doing (e.g. a form).
  useEffect(() => {
    if (isEmbedded || !isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    if (userInitiatedOpenRef.current) {
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEmbedded, isOpen, closeChat]);

  const latestAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages]);

  const panel = (
    <div
      role={isEmbedded ? undefined : "dialog"}
      aria-modal={false}
      aria-label={isEmbedded ? undefined : "Knotty AI concierge chat"}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_32px_96px_rgba(15,23,42,0.22)]",
        isEmbedded
          ? "h-[620px] w-full"
          : "w-[380px] max-w-[calc(100vw-2rem)] h-[min(620px,calc(100svh-5rem))]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0B0B0C] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B1E2D] text-white">
            <Send className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.04em] text-white">
              Knotty <span className="text-[#E0566B]">AI</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
              MasseurMatch concierge
            </p>
          </div>
        </div>
        {!isEmbedded ? (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeChat}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Minimize Knotty chat"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Conversation */}
      <div className="relative flex-1 space-y-4 overflow-y-auto bg-white px-4 py-4">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isLatestAssistant={message.id === latestAssistantId}
            onRecommendationOpen={(recommendation) => trackRecommendationClick(recommendation)}
            reduced={reduced}
          />
        ))}

        {isTyping ? (
          <div className="flex justify-start">
            <div className="rounded-[20px] rounded-bl-sm border border-black/[0.06] bg-[#F0F0F0] px-5 py-3.5">
              <TypingDots />
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage({ content: input });
        }}
        className="border-t border-black/[0.06] bg-white px-4 pb-2 pt-3"
      >
        <div className="flex items-center gap-2 rounded-[20px] border border-black/[0.1] bg-white px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Knotty anything..."
            className="flex-1 bg-transparent text-sm text-[#151515] outline-none placeholder:text-[#98A2B3]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B1E2D] text-white transition hover:bg-[#6E1521] disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>

      <KnottyDisclaimer />
    </div>
  );

  if (isEmbedded) {
    return panel;
  }

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 sm:bottom-6 sm:right-6">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="knotty-launcher"
            ref={launcherRef}
            type="button"
            initial={reduced ? undefined : { opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.86 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={openChat}
            className="group relative h-14 w-14 rounded-full border border-white/20 bg-[#8B1E2D] shadow-[0_20px_48px_rgba(139,30,45,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E2D]/50 focus-visible:ring-offset-2 sm:h-16 sm:w-16"
            aria-label="Open Knotty chat"
            aria-expanded={isOpen}
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_58%)]" />
            <div className="relative flex h-full w-full items-center justify-center text-white">
              <MessageCircle className="h-6 w-6" strokeWidth={2.25} />
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="knotty-panel"
            initial={reduced ? undefined : { opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 28, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="origin-bottom-right"
          >
            {panel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
