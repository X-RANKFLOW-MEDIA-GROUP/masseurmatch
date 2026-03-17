"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { postJson } from "@/app/_lib/client-api";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type KnottyChatProps = {
  mode?: "floating" | "embedded";
  promptExamples?: string[];
  className?: string;
};

const DEFAULT_PROMPTS = [
  "Find therapists in Miami",
  "What do Pro tiers mean?",
  "How do I contact someone?",
];

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border border-border bg-card text-foreground"
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <div className="prose prose-sm max-w-none text-foreground [&>p]:m-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function KnottyChatPanel({
  className,
  close,
  input,
  isEmbedded,
  isTyping,
  messages,
  onInputChange,
  onPromptSelect,
  onSubmit,
  promptExamples,
}: {
  className?: string;
  close?: () => void;
  input: string;
  isEmbedded: boolean;
  isTyping: boolean;
  messages: Message[];
  onInputChange: (value: string) => void;
  onPromptSelect: (prompt: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  promptExamples: string[];
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[24px] border border-border bg-background shadow-2xl",
        isEmbedded ? "h-[560px] w-full" : "h-[540px] w-[380px]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div>
          <p className="text-sm font-semibold">Knotty</p>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Directory Assistant
          </p>
        </div>
        {!isEmbedded && close ? (
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
            aria-label="Close Knotty chat"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="border-b border-border px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {promptExamples.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPromptSelect(prompt)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isTyping ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              Thinking...
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Ask Knotty anything..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export const KnottyChat = ({
  mode = "floating",
  promptExamples = DEFAULT_PROMPTS,
  className,
}: KnottyChatProps) => {
  const isEmbedded = mode === "embedded";
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "Hey, I'm Knotty. Ask about cities, pricing, tiers, or how to contact a therapist.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (forcedPrompt?: string) => {
    const content = (forcedPrompt ?? input).trim();
    if (!content || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const data = await postJson<{ ok: boolean; reply: string }>("/api/chat", {
        messages: nextMessages
          .filter((message) => message.id !== 0)
          .map((message) => ({
            role: message.role,
            content: message.content,
          })),
      });

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply || "I couldn't find an answer for that yet.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "I hit a connection problem. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const panel = (
    <KnottyChatPanel
      className={className}
      close={isEmbedded ? undefined : () => setIsOpen(false)}
      input={input}
      isEmbedded={isEmbedded}
      isTyping={isTyping}
      messages={messages}
      onInputChange={setInput}
      onPromptSelect={(prompt) => void handleSend(prompt)}
      onSubmit={(event) => {
        event.preventDefault();
        void handleSend();
      }}
      promptExamples={promptExamples}
    />
  );

  if (isEmbedded) {
    return panel;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="launcher"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="group relative h-16 w-16 rounded-full border border-border bg-card shadow-xl"
            aria-label="Open Knotty chat"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" />
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground">
              AI
            </div>
            <div className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              Knotty
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="origin-bottom-right"
          >
            {panel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
