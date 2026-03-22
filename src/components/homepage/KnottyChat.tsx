import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Sparkles, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type MessageRole = "knotty" | "user";

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
};

type QuickOption = {
  label: string;
  action: string;
};

type KnottyChatProps = {
  onFilterAvailableNow?: () => void;
  onFilterMobile?: () => void;
  onFocusSearch?: () => void;
};

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_MESSAGE = "Hey — looking for a massage near you?";

const QUICK_OPTIONS: QuickOption[] = [
  { label: "Find Available Now", action: "available_now" },
  { label: "Find Mobile Massage", action: "mobile" },
  { label: "Help me choose", action: "help" },
];

const RESPONSES: Record<string, string> = {
  available_now:
    "Got it. Showing therapists available right now near you.",
  mobile:
    "Looking for mobile massage options. Let me filter those for you.",
  help:
    "No problem! I'd recommend starting with 'Available Now' to see who's ready, or you can search by specialty using the search bar above.",
};

/* ------------------------------------------------------------------ */
/* Typing hook                                                        */
/* ------------------------------------------------------------------ */

function useTypingEffect(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      setIsTyping(false);
      return;
    }

    setDisplayed("");
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, isTyping };
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

let msgCounter = 0;
function nextId() {
  msgCounter++;
  return `msg-${msgCounter}`;
}

export function KnottyChat({
  onFilterAvailableNow,
  onFilterMobile,
  onFocusSearch,
}: KnottyChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingText, setPendingText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { displayed: typedText, isTyping } = useTypingEffect(pendingText);

  // When typing effect finishes, commit the message
  useEffect(() => {
    if (pendingText && !isTyping && typedText === pendingText) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "knotty", text: pendingText },
      ]);
      setPendingText("");
      setShowOptions(true);
    }
  }, [pendingText, isTyping, typedText]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typedText]);

  const open = useCallback(() => {
    setIsOpen(true);
    if (!hasInteracted) {
      setHasInteracted(true);
      setPendingText(INITIAL_MESSAGE);
      setShowOptions(false);
    }
    trackEvent("knotty_interaction", { action: "open" });
  }, [hasInteracted]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOption = useCallback(
    (option: QuickOption) => {
      // Add user message
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", text: option.label },
      ]);
      setShowOptions(false);

      trackEvent("knotty_interaction", { action: option.action });

      // Trigger response with typing
      const response = RESPONSES[option.action] ?? "Let me look into that for you.";
      setTimeout(() => {
        setPendingText(response);
      }, 400);

      // Trigger actual filter action
      setTimeout(() => {
        if (option.action === "available_now") onFilterAvailableNow?.();
        if (option.action === "mobile") onFilterMobile?.();
        if (option.action === "help") onFocusSearch?.();
      }, 1200);
    },
    [onFilterAvailableNow, onFilterMobile, onFocusSearch],
  );

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={open}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-brand-primary shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition hover:scale-105 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] sm:h-16 sm:w-16"
          aria-label="Open Knotty AI Chat"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex flex-col",
            // Mobile: full screen
            "inset-0 sm:inset-auto",
            // Desktop: bottom-right card
            "sm:bottom-6 sm:right-6 sm:h-[480px] sm:w-[380px]",
            // Glass UI
            "rounded-none border border-white/15 bg-brand-primary/80 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:rounded-[28px]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent/20">
                <Sparkles className="h-4 w-4 text-brand-soft" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Knotty AI</p>
                <p className="text-[11px] text-white/50">Your massage assistant</p>
              </div>
            </div>
            <button
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
              aria-label="Close chat"
            >
              <X className="h-4 w-4 text-white/60" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[85%] rounded-[18px] px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "knotty"
                    ? "mr-auto bg-white/10 text-white"
                    : "ml-auto bg-brand-soft/20 text-brand-soft",
                )}
              >
                {msg.text}
              </div>
            ))}

            {/* Typing indicator */}
            {pendingText && isTyping && (
              <div className="mr-auto max-w-[85%] rounded-[18px] bg-white/10 px-4 py-2.5 text-sm leading-relaxed text-white">
                {typedText}
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-white/60" />
              </div>
            )}
          </div>

          {/* Quick options */}
          {showOptions && (
            <div className="border-t border-white/10 px-5 py-4 space-y-2">
              {QUICK_OPTIONS.map((option) => (
                <button
                  key={option.action}
                  onClick={() => handleOption(option)}
                  className="flex w-full items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:border-brand-accent/30 hover:bg-white/10"
                >
                  {option.label}
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </button>
              ))}
            </div>
          )}

          {/* Subtle glow */}
          <div className="pointer-events-none absolute -bottom-2 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-brand-accent/10 blur-3xl" />
        </div>
      )}
    </>
  );
}
