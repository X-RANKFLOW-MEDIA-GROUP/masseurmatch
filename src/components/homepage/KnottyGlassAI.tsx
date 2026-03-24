"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import Link from "next/link";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const QUICK_ACTIONS = [
  { label: "Deep Tissue", query: "Deep Tissue" },
  { label: "Available Now", query: "Available Now" },
  { label: "Outcall / Mobile", query: "Outcall" },
  { label: "Near Me", query: "Near Me" },
] as const;

const GREETING_LINES = [
  "Looking for massage in {city}?",
  "Deep tissue or relaxation?",
  "Available now?",
];

function useTypingEffect(text: string, speed = 32) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-[3px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-[5px] w-[5px] rounded-full bg-white/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

function ChatBubble({
  message,
  isLast,
}: {
  message: Message;
  isLast: boolean;
}) {
  const isAssistant = message.role === "assistant";
  const { displayed, done } = useTypingEffect(
    isAssistant && isLast ? message.text : message.text,
    isAssistant && isLast ? 28 : 0,
  );

  const text = isAssistant && isLast ? displayed : message.text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
          isAssistant
            ? "rounded-bl-md bg-white/[0.08] text-white/90"
            : "rounded-br-md bg-brand-accent/80 text-white"
        }`}
      >
        {text}
        {isAssistant && isLast && !done && (
          <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-white/60" />
        )}
      </div>
    </motion.div>
  );
}

type KnottyGlassAIProps = {
  city: string | null;
};

export function KnottyGlassAI({ city }: KnottyGlassAIProps) {
  const cityName = city || "your area";
  const [messages, setMessages] = useState<Message[]>([]);
  const [showGreeting, setShowGreeting] = useState(true);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-play greeting sequence
  useEffect(() => {
    const lines = GREETING_LINES.map((l) => l.replace("{city}", cityName));
    const timers: NodeJS.Timeout[] = [];

    lines.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: `greeting-${i}`, role: "assistant", text: line },
          ]);
          setGreetingIndex(i);
        }, i * 1800 + 600),
      );
    });

    timers.push(
      setTimeout(() => {
        setShowGreeting(false);
      }, lines.length * 1800 + 1200),
    );

    return () => timers.forEach(clearTimeout);
  }, [cityName]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const handleQuickAction = useCallback(
    (query: string) => {
      // Navigate to search
      window.location.href = `/search?keyword=${encodeURIComponent(query)}${city ? `&city=${encodeURIComponent(city)}` : ""}`;
    },
    [city],
  );

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: trimmed },
    ]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response then redirect to search
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          text: `Let me find the best options for "${trimmed}"…`,
        },
      ]);
      setTimeout(() => {
        window.location.href = `/search?keyword=${encodeURIComponent(trimmed)}${city ? `&city=${encodeURIComponent(city)}` : ""}`;
      }, 1200);
    }, 1400);
  }, [input, city]);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="flex w-full max-w-sm flex-col overflow-hidden glass-card-light"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-white/20 px-4 py-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-lg shadow-md">
            K
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">Meet Knotty</p>
            <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online AI Assistant
            </p>
          </div>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex flex-col gap-2 overflow-y-auto px-3 py-3" style={{ maxHeight: 220, minHeight: 140 }}>
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1}
              />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl rounded-bl-sm bg-gray-100 text-gray-800 px-3.5 py-2.5">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick actions */}
        <AnimatePresence>
          {!showGreeting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1.5 border-t border-white/20 px-3 py-2.5"
            >
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.query)}
                  className="rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 text-xs font-medium transition"
                >
                  {action.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-white/20 px-3 py-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Knotty anything…"
            className="min-w-0 flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition hover:bg-gray-800 disabled:opacity-30"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </motion.div>
      {/* Decorative shadow behind card */}
      <div className="absolute -bottom-6 -right-6 w-full h-full bg-gradient-to-br from-gray-200 to-gray-50 rounded-3xl -z-10 transform rotate-3"></div>
    </div>
  );
}
