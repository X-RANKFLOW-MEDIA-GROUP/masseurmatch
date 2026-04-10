"use client";

import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FALLBACK_REPLY =
  "I'm having trouble reaching my search layer right now. Please try again in a moment.";

export default function KnottyGlassChat({
  userLocation,
}: {
  userLocation: string | null;
}) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "intro-1", role: "ai", text: "Hi, I'm Knotty." },
  ]);
  const [isTyping, setIsTyping] = useState(true);

  const bodyRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(2);
  const timersRef = useRef<number[]>([]);

  const queueTimer = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timersRef.current.push(id);
  };

  useEffect(() => {
    queueTimer(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: "intro-2",
          role: "ai",
          text: "I'm your personal wellness concierge. What's your name?",
        },
      ]);
      setIsTyping(false);
    }, 1500);

    return () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedValue = inputValue.trim();

    if (!trimmedValue || isTyping) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg-${nextIdRef.current++}`,
      role: "user",
      text: trimmedValue,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          userLocation,
        }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${nextIdRef.current++}`,
          role: "ai",
          text: payload.reply?.trim() || payload.error || FALLBACK_REPLY,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${nextIdRef.current++}`,
          role: "ai",
          text: FALLBACK_REPLY,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative flex h-[450px] w-full flex-col overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-br from-white/[0.12] to-white/[0.08] shadow-[0_32px_100px_rgba(2,6,23,0.55)] backdrop-blur-3xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.4),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      <div className="relative z-10 flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-white/10 via-white/[0.03] to-transparent px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-300/20 bg-sky-400/15 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.18)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-medium tracking-tight text-white">
            Knotty AI
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/90">
            Online / Gemini Powered
          </p>
        </div>
      </div>

      <div
        ref={bodyRef}
        className="relative z-10 flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6 bg-gradient-to-b from-white/[0.04] to-white/[0.02]"
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={`flex w-full ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed ${
                message.role === "user"
                  ? "rounded-tr-none border border-sky-300/10 bg-sky-500/85 text-white shadow-[0_10px_30px_rgba(14,165,233,0.22)]"
                  : "rounded-tl-none border border-white/10 bg-white/[0.08] text-slate-100"
              }`}
            >
              {message.text}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-none border border-white/10 bg-white/[0.06] px-4 py-3">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-slate-300/80"
                  animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: index * 0.14,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative z-10 border-t border-white/15 bg-white/[0.08] p-4">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Type your reply..."
            className="w-full rounded-xl border border-white/20 bg-white/[0.12] py-3 pl-4 pr-12 font-sans text-sm text-white placeholder:text-slate-300 focus:border-sky-400/70 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-sky-500"
            aria-label="Send message"
          >
            <Send className="ml-0.5 h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
