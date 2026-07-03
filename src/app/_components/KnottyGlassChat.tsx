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
    <div className="relative flex h-[450px] w-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_100px_rgba(2,6,23,0.15)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_34%)]" />

      <div className="relative z-10 flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-sky-600 shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight text-slate-900">
            Knotty AI
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-600">
            Online / Gemini Powered
          </p>
        </div>
      </div>

      <div
        ref={bodyRef}
        className="relative z-10 flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6 bg-white"
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={`flex w-full ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed ${
                message.role === "user"
                  ? "rounded-tr-none border border-sky-200 bg-sky-500 text-white shadow-md"
                  : "rounded-tl-none border border-slate-200 bg-slate-100 text-slate-900"
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
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-none border border-slate-200 bg-slate-100 px-4 py-3">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-slate-400"
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

      <div className="relative z-10 border-t border-slate-100 bg-white p-4">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Type your reply..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-12 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
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
