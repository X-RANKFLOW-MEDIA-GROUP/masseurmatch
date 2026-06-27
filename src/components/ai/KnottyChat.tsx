"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock3, MapPinned, ArrowUp, MessageCircle, ShieldCheck, X } from "lucide-react";
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
        "rounded-[20px] border px-4 py-4 backdrop-blur-2xl",
        featured
          ? "border-[#8B1E2D]/20 bg-[#8B1E2D]/[0.08] text-white shadow-[0_22px_48px_rgba(0,0,0,0.18)]"
          : "border-white/[0.08] bg-white/[0.04] text-white/88",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {featured ? "Top Match" : `Alternative ${recommendation.position}`}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{recommendation.name}</h3>
          <p className="mt-1 text-sm text-white/72">
            {recommendation.neighborhood || recommendation.city || "Local area"} · {recommendation.specialty}
          </p>
        </div>
        {recommendation.verified ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/18 bg-white/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Active
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
        {recommendation.availableNow ? (
          <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1">
            <Clock3 className="mr-1 inline h-3.5 w-3.5" />
            Available now
          </span>
        ) : null}
        {typeof recommendation.distanceMiles === "number" ? (
          <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1">
            <MapPinned className="mr-1 inline h-3.5 w-3.5" />
            {recommendation.distanceMiles < 10
              ? `${recommendation.distanceMiles.toFixed(1)} mi`
              : `${Math.round(recommendation.distanceMiles)} mi`}
          </span>
        ) : null}
        {typeof recommendation.priceFrom === "number" ? (
          <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1">
            From ${recommendation.priceFrom}
          </span>
        ) : null}
      </div>

      <ul className="mt-3 list-disc list-inside space-y-2 text-sm leading-6 text-white/78">
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
              : "border border-white/[0.1] bg-white/[0.06] text-white hover:bg-white/[0.12]",
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
  const shouldAnimate = !isUser && isLatestAssistant;
  const { displayed, isDone } = useTypewriter(message.content, shouldAnimate);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-[20px] rounded-br-sm bg-gradient-to-br from-[#8B1E2D] to-[#6E1521] px-4 py-3 text-sm leading-relaxed text-white shadow-[0_12px_32px_rgba(139, 30, 45,0.18)]">
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
      <div className="w-full max-w-[88%] space-y-3 rounded-[24px] rounded-bl-sm border border-white/[0.08] bg-white/[0.05] px-4 py-4 text-sm leading-relaxed text-white/90 backdrop-blur-2xl">
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

export const KnottyChat = ({
  mode = "floating",
  promptExamples,
  className,
}: KnottyChatProps) => {
  const isEmbedded = mode === "embedded";
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const { input, isTyping, messages, quickActions, sendMessage, setInput, trackOpen, trackRecommendationClick } =
    useKnotty();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isEmbedded) {
      trackOpen();
    }
  }, [isEmbedded, trackOpen]);

  // Auto-open floating chat after 3 seconds on page load.
  useEffect(() => {
    if (isEmbedded) return;
    const timer = setTimeout(() => {
      setIsOpen(true);
      trackOpen();
    }, 3000);
    return () => clearTimeout(timer);
  }, [isEmbedded, trackOpen]);

  // Allow any part of the app to open the floating chat (optionally with a
  // prefilled prompt) by dispatching a `knotty:open` window event.
  useEffect(() => {
    if (isEmbedded) return;
    const handler = (event: Event) => {
      setIsOpen(true);
      trackOpen();
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

  const quickActionButtons = quickActions.map((action) => (
    <button
      key={action.key}
      type="button"
      onClick={() => void sendMessage({ quickAction: action.key })}
      className="rounded-full border border-[#8B1E2D]/25 bg-[#8B1E2D]/[0.07] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#A52538] transition hover:border-[#8B1E2D]/50 hover:bg-[#8B1E2D]/15 hover:text-[#F8EDEE]"
    >
      {action.label}
    </button>
  ));

  const panel = (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#060E1A] shadow-[0_32px_96px_rgba(1,10,28,0.6)] backdrop-blur-3xl",
        isEmbedded
          ? "h-[620px] w-full"
          : "w-[396px] max-w-[calc(100vw-2rem)] h-[min(620px,calc(100svh-5rem))]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139, 30, 45,0.06),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(6,14,26,0.8),transparent_56%)]" />

      <div className="relative flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8B1E2D]/20 bg-[#8B1E2D]/10 text-[#8B1E2D]">
            <MessageCircle className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">Knotty</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">AI concierge</p>
          </div>
        </div>
        {!isEmbedded ? (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-white/50 transition hover:bg-white/[0.08] hover:text-white/80"
            aria-label="Close Knotty chat"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="relative border-b border-white/[0.06] px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {quickActionButtons}
          {(promptExamples || []).slice(0, 0).map(() => null)}
        </div>
      </div>

      <div className="relative flex-1 space-y-4 overflow-y-auto px-4 py-4">
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
            <div className="rounded-[20px] rounded-bl-sm border border-white/[0.06] bg-white/[0.04] px-5 py-3.5 backdrop-blur-2xl">
              <TypingDots />
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage({ content: input });
        }}
        className="relative border-t border-white/[0.06] px-4 py-4"
      >
        <div className="flex items-center gap-2 rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 backdrop-blur-2xl">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tell Knotty what matters most..."
            className="flex-1 bg-transparent text-sm text-white/85 outline-none placeholder:text-white/35"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1E2D] text-white transition hover:bg-[#6E1521] disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );

  if (isEmbedded) {
    return panel;
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
            className="group relative h-16 w-16 rounded-full border border-white/20 bg-[linear-gradient(180deg,#8B1E2D,#E06B00)] shadow-[0_20px_48px_rgba(139, 30, 45,0.3)]"
            aria-label="Open Knotty chat"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_58%)]" />
            <div className="absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(139, 30, 45,0.45),transparent_65%)] opacity-75 blur-2xl transition group-hover:opacity-100" />
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
