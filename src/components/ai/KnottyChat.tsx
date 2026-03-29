"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock3, MapPinned, Send, ShieldCheck, Sparkles, X } from "lucide-react";
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
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-2 w-2 animate-pulse rounded-full bg-slate-400"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  );
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
        "rounded-[20px] border px-4 py-4",
        featured
          ? "border-slate-200 bg-white text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          : "border-slate-200/80 bg-slate-50 text-slate-800",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {featured ? "Top Match" : `Alternative ${recommendation.position}`}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{recommendation.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {recommendation.neighborhood || recommendation.city || "Local area"} · {recommendation.specialty}
          </p>
        </div>
        {recommendation.verified ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {recommendation.availableNow ? (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
            <Clock3 className="mr-1 inline h-3.5 w-3.5" />
            Available now
          </span>
        ) : null}
        {typeof recommendation.distanceMiles === "number" ? (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
            <MapPinned className="mr-1 inline h-3.5 w-3.5" />
            {recommendation.distanceMiles < 10
              ? `${recommendation.distanceMiles.toFixed(1)} mi`
              : `${Math.round(recommendation.distanceMiles)} mi`}
          </span>
        ) : null}
        {typeof recommendation.priceFrom === "number" ? (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
            From ${recommendation.priceFrom}
          </span>
        ) : null}
      </div>

      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {recommendation.why.map((reason) => (
          <li key={`${recommendation.therapistId}-${reason}`}>• {reason}</li>
        ))}
      </ul>

      <div className="mt-4">
        <Link
          href={recommendation.profilePath}
          onClick={() => onOpen(recommendation)}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold uppercase tracking-[0.12em] transition",
            featured
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
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
  onRecommendationOpen,
}: {
  message: ReturnType<typeof useKnotty>["messages"][number];
  onRecommendationOpen: (recommendation: KnottyRecommendation) => void;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-[20px] rounded-br-sm bg-blue-500 px-4 py-3 text-sm leading-relaxed text-white shadow-[0_4px_16px_rgba(59,130,246,0.25)]">
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
      <div className="w-full max-w-[88%] space-y-3 rounded-[24px] rounded-bl-sm border border-slate-200/60 bg-white px-4 py-4 text-sm leading-relaxed text-slate-700 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <p>{message.content}</p>

        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <RecommendationCard
                key={`${recommendation.therapistId}-${recommendation.position}`}
                recommendation={recommendation}
                featured={index === 0}
                onOpen={onRecommendationOpen}
              />
            ))}
          </div>
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

  useEffect(() => {
    if (isEmbedded) return;
    const handler = () => {
      setIsOpen(true);
      trackOpen();
    };
    window.addEventListener("knotty:open", handler);
    return () => window.removeEventListener("knotty:open", handler);
  }, [isEmbedded, trackOpen]);

  const quickActionButtons = quickActions.map((action) => (
    <button
      key={action.key}
      type="button"
      onClick={() => void sendMessage({ quickAction: action.key })}
      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
    >
      {action.label}
    </button>
  ));

  const panel = (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden border border-white/60 bg-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-2xl",
        isEmbedded
          ? "h-[620px] w-full rounded-[28px]"
          : "h-[100dvh] w-screen rounded-none sm:h-[620px] sm:w-[396px] sm:rounded-[28px]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-32 rounded-full bg-[radial-gradient(circle,rgba(122,198,255,0.08),transparent_70%)] blur-3xl" />

      <div className="relative flex items-center justify-between border-b border-slate-200/60 bg-white/50 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Knotty</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">AI concierge</p>
          </div>
        </div>
        {!isEmbedded ? (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close Knotty chat"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="relative border-b border-slate-200/60 bg-white/30 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2">
          {quickActionButtons}
          {(promptExamples || []).slice(0, 0).map(() => null)}
        </div>
      </div>

      <div className="relative flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white/30 px-4 py-4">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            onRecommendationOpen={(recommendation) => trackRecommendationClick(recommendation)}
          />
        ))}

        {isTyping ? (
          <div className="flex justify-start">
            <div className="rounded-[20px] rounded-bl-sm border border-slate-200/60 bg-white px-4 py-3 text-sm text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
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
        className="relative border-t border-slate-200/60 bg-white/50 px-4 py-4 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 rounded-[22px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tell Knotty what matters most..."
            className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );

  if (isEmbedded) {
    return panel;
  }

  return (
    <>
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
            className="group fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full border border-white/40 bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_8px_32px_rgba(59,130,246,0.35)]"
            aria-label="Open Knotty chat"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_58%)]" />
            <div className="absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.2),transparent_65%)] opacity-75 blur-2xl transition group-hover:opacity-100" />
            <div className="relative flex h-full w-full items-center justify-center text-white">
              <Sparkles className="h-6 w-6" />
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="knotty-panel"
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="fixed inset-0 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:origin-bottom-right"
          >
            {panel}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
