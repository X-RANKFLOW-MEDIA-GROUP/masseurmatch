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
          className="h-2 w-2 animate-pulse rounded-full bg-white/70"
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
        "rounded-[20px] border px-4 py-4 backdrop-blur-2xl",
        featured
          ? "border-white/18 bg-white/14 text-white shadow-[0_22px_48px_rgba(0,0,0,0.18)]"
          : "border-white/12 bg-white/[0.08] text-white/88",
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

      <ul className="mt-3 space-y-2 text-sm leading-6 text-white/78">
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
              ? "bg-white text-slate-900 hover:bg-white/90"
              : "border border-white/18 bg-white/10 text-white hover:bg-white/16",
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
        <div className="max-w-[82%] rounded-[20px] rounded-br-sm bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
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
      <div className="w-full max-w-[88%] space-y-3 rounded-[24px] rounded-bl-sm border border-white/12 bg-white/[0.08] px-4 py-4 text-sm leading-relaxed text-white/92 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
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

  const quickActionButtons = quickActions.map((action) => (
    <button
      key={action.key}
      type="button"
      onClick={() => void sendMessage({ quickAction: action.key })}
      className="rounded-full border border-[#2f6098] bg-[#0f315b]/72 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#bfdcff] transition hover:border-[#4f85c2] hover:bg-[#174273] hover:text-[#e4f2ff]"
    >
      {action.label}
    </button>
  ));

  const panel = (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[28px] border border-[#27527f] bg-[linear-gradient(180deg,#133a63_0%,#102f54_52%,#0a223f_100%)] shadow-[0_32px_96px_rgba(1,10,28,0.48)] backdrop-blur-3xl",
        isEmbedded
          ? "h-[620px] w-full"
          : "w-[396px] max-w-[calc(100vw-2rem)] h-[min(620px,calc(100svh-5rem))]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,126,207,0.26),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(18,52,94,0.5),transparent_56%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-32 rounded-full bg-[radial-gradient(circle,rgba(98,166,238,0.22),transparent_70%)] blur-3xl" />

      <div className="relative flex items-center justify-between border-b border-[#204e83] bg-[#0d2a4f]/72 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a5b95] bg-[#12335d] text-[#8ec2f6]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#a9d4ff]">Knotty</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#6f9dcb]">AI concierge closer</p>
          </div>
        </div>
        {!isEmbedded ? (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2a5a93] bg-[#12355f] text-[#94bde7] transition hover:bg-[#174273] hover:text-[#d3e8ff]"
            aria-label="Close Knotty chat"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="relative border-b border-[#204e83] px-4 py-3">
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
            onRecommendationOpen={(recommendation) => trackRecommendationClick(recommendation)}
          />
        ))}

        {isTyping ? (
          <div className="flex justify-start">
            <div className="rounded-[20px] rounded-bl-sm border border-white/12 bg-white/[0.08] px-4 py-3 text-sm text-white/82 backdrop-blur-2xl">
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
        className="relative border-t border-[#204e83] px-4 py-4"
      >
        <div className="flex items-center gap-2 rounded-[22px] border border-[#28568b] bg-[#0c2a4f]/75 px-3 py-2.5 backdrop-blur-2xl">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tell Knotty what matters most..."
            className="flex-1 bg-transparent text-sm text-[#d7e8fa] outline-none placeholder:text-[#b8d4f0]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3f6ea6] bg-[#194679] text-[#e6f3ff] transition hover:bg-[#245890] disabled:cursor-not-allowed disabled:opacity-35"
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
            className="group relative h-16 w-16 rounded-full border border-white/20 bg-[linear-gradient(180deg,#FF8A1F,#e67a10)] shadow-[0_20px_48px_rgba(255,138,31,0.35)]"
            aria-label="Open Knotty chat"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_58%)]" />
            <div className="absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(255,138,31,0.5),transparent_65%)] opacity-75 blur-2xl transition group-hover:opacity-100" />
            <div className="relative flex h-full w-full items-center justify-center text-white">
              <Sparkles className="h-6 w-6" strokeWidth={2.25} />
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
