"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
}: {
  message: ReturnType<typeof useKnotty>["messages"][number];
  isLatestAssistant: boolean;
  onRecommendationOpen: (recommendation: KnottyRecommendation) => void;
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
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

// Routes where the floating concierge should NOT render at all — focused app
// surfaces (provider dashboard, admin) own their own chrome.
const HIDDEN_ROUTE_PREFIXES = ["/pro", "/admin"];

// Routes where the chat must never auto-open: it would cover primary form
// fields, CTAs, or results. The user can still open it manually.
const NO_AUTO_OPEN_PREFIXES = [
  "/signup",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/pricing",
  "/search",
  "/checkout",
  "/verification",
];

const DISMISS_STORAGE_KEY = "mm_knotty_dismissed";

function matchesPrefix(pathname: string | null, prefixes: string[]): boolean {
  if (!pathname) return false;
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const KnottyChat = ({ mode = "floating", className }: KnottyChatProps) => {
  const isEmbedded = mode === "embedded";
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const { input, isTyping, messages, sendMessage, setInput, trackOpen, trackRecommendationClick } =
    useKnotty();
  const endRef = useRef<HTMLDivElement>(null);

  const isHiddenRoute = !isEmbedded && matchesPrefix(pathname, HIDDEN_ROUTE_PREFIXES);

  // Close = minimize and remember the choice for the rest of the session so the
  // auto-open timer never re-covers content after the user dismissed it.
  const handleClose = useCallback(() => {
    setIsOpen(false);
    try {
      window.sessionStorage.setItem(DISMISS_STORAGE_KEY, "1");
    } catch {
      /* storage unavailable — best effort */
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isEmbedded) {
      trackOpen();
    }
  }, [isEmbedded, trackOpen]);

  // Auto-open floating chat after a short delay — but only when the user hasn't
  // already dismissed it this session and the current route isn't one where the
  // panel would obscure important content (signup, login, pricing, search, …).
  useEffect(() => {
    if (isEmbedded || isHiddenRoute) return;
    if (matchesPrefix(pathname, NO_AUTO_OPEN_PREFIXES)) return;
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem(DISMISS_STORAGE_KEY) === "1";
    } catch {
      /* storage unavailable — proceed with default behavior */
    }
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      trackOpen();
    }, 4000);
    return () => clearTimeout(timer);
  }, [isEmbedded, isHiddenRoute, pathname, trackOpen]);

  // Allow any part of the app to open the floating chat (optionally with a
  // prefilled prompt) by dispatching a `knotty:open` window event. Explicit
  // intent clears the dismissed flag.
  useEffect(() => {
    if (isEmbedded) return;
    const handler = (event: Event) => {
      setIsOpen(true);
      trackOpen();
      try {
        window.sessionStorage.removeItem(DISMISS_STORAGE_KEY);
      } catch {
        /* storage unavailable */
      }
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) {
        void sendMessage({ content: prompt });
      }
    };
    window.addEventListener("knotty:open", handler as EventListener);
    return () => window.removeEventListener("knotty:open", handler as EventListener);
  }, [isEmbedded, trackOpen, sendMessage]);

  const latestAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages]);

  const panel = (
    <div
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
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
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

  // Don't render the floating concierge on focused app surfaces.
  if (isHiddenRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="knotty-launcher"
            type="button"
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.86 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => {
              setIsOpen(true);
              trackOpen();
            }}
            className="group relative h-16 w-16 rounded-full border border-white/20 bg-[#8B1E2D] shadow-[0_20px_48px_rgba(139,30,45,0.3)]"
            aria-label="Open Knotty chat"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_58%)]" />
            <div className="relative flex h-full w-full items-center justify-center text-white">
              <MessageCircle className="h-6 w-6" strokeWidth={2.25} />
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="knotty-panel"
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.95 }}
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
