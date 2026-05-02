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

const INTRO_MESSAGES = [
  "Hey there! I'm Knotty, your personal massage concierge.",
  "I can help you find the perfect therapist based on what you're looking for.",
  "What brings you here today?"
];

const QUICK_OPTIONS: QuickOption[] = [
  { label: "Find Available Now", action: "available_now" },
  { label: "Find Mobile Massage", action: "mobile" },
  { label: "Help me choose", action: "help" },
];

const RESPONSES: Record<string, string> = {
  available_now:
    "Great choice! Let me show you therapists who are available right now near you.",
  mobile:
    "Perfect! I'll find mobile massage therapists who can come to you.",
  help:
    "No problem! Tell me what you're looking for — deep tissue, relaxation, sports recovery? Or I can show you who's available now!",
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
      // Play intro messages sequence
      INTRO_MESSAGES.forEach((msg, i) => {
        setTimeout(() => {
          setPendingText(msg);
        }, i * 1800 + 300);
      });
      setTimeout(() => {
        setShowOptions(true);
      }, INTRO_MESSAGES.length * 1800 + 500);
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
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-accent to-brand-secondary shadow-[0_8px_30px_rgba(255,138,31,0.4)] transition hover:scale-110 hover:shadow-[0_12px_40px_rgba(255,138,31,0.5)] sm:h-18 sm:w-18 animate-pulse"
          aria-label="Open Knotty AI Chat"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-accent to-brand-secondary animate-ping opacity-30" />
          <Sparkles className="h-7 w-7 text-white relative z-10" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex flex-col",
            // Mobile: full screen
            "inset-0 sm:inset-auto",
            // Desktop: bottom-right card - BIGGER
            "sm:bottom-6 sm:right-6 sm:h-[560px] sm:w-[420px]",
            // Glass UI with light background
            "rounded-none border border-border bg-card shadow-[0_24px_70px_rgba(0,0,0,0.12),0_0_60px_rgba(255,138,31,0.08)] backdrop-blur-2xl sm:rounded-[32px]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-brand-accent/10 to-transparent px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-accent to-brand-secondary shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Knotty AI</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online now
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:bg-muted hover:border-border"
              aria-label="Close chat"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-background">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[85%] rounded-[20px] px-4 py-3 text-[15px] leading-relaxed shadow-sm",
                  msg.role === "knotty"
                    ? "mr-auto bg-muted text-foreground border border-border"
                    : "ml-auto bg-gradient-to-r from-brand-accent to-brand-secondary text-white font-medium",
                )}
              >
                {msg.text}
              </div>
            ))}

            {/* Typing indicator */}
            {pendingText && isTyping && (
              <div className="mr-auto max-w-[85%] rounded-[20px] bg-muted border border-border px-4 py-3 text-[15px] leading-relaxed text-foreground">
                {typedText}
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-accent" />
              </div>
            )}
          </div>

          {/* Quick options */}
          {showOptions && (
            <div className="border-t border-border px-5 py-4 space-y-2.5 bg-card">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Quick actions</p>
              {QUICK_OPTIONS.map((option) => (
                <button
                  key={option.action}
                  onClick={() => handleOption(option)}
                  className="flex w-full items-center justify-between rounded-[16px] border border-border bg-background px-4 py-3.5 text-[15px] font-semibold text-foreground transition hover:border-brand-accent/50 hover:bg-muted"
                >
                  {option.label}
                  <ChevronRight className="h-5 w-5 text-brand-accent" />
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
