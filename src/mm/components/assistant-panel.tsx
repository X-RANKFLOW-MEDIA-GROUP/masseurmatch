"use client";

import { useState } from "react";
import { SendHorizontal, Sparkles } from "lucide-react";
import { Button, Card, Input } from "@/mm/components/primitives";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export function AssistantPanel({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Ask about city pages, therapist filters, profile details, or how direct contact works.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitQuestion(): Promise<void> {
    const value = question.trim();

    if (!value) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: value,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setIsLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: value }),
    });

    const payload = (await response.json()) as { answer?: string; error?: string };

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: payload.answer || payload.error || "I could not answer that just now.",
      },
    ]);
    setIsLoading(false);
  }

  return (
    <Card className={compact ? "w-full max-w-sm" : "w-full"}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Knotty
      </div>
      <div className={`mt-4 space-y-3 ${compact ? "max-h-72" : "max-h-[28rem]"} overflow-y-auto pr-1`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
              message.role === "assistant" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {message.text}
          </div>
        ))}
        {isLoading ? <p className="text-sm text-muted-foreground">Thinking...</p> : null}
      </div>
      <div className="mt-4 flex gap-3">
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void submitQuestion();
            }
          }}
          placeholder="Ask about this directory"
        />
        <Button type="button" disabled={isLoading} onClick={() => void submitQuestion()}>
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
