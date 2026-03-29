"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { postJson } from "@/app/_lib/client-api";
import {
  getKnottyClientContext,
  getKnottyDeviceType,
  getOrCreateKnottySessionId,
  sendKnottyEvent,
} from "@/lib/knotty/client";
import type {
  KnottyMessage,
  KnottyQuickAction,
  KnottyRecommendation,
  KnottyResponsePayload,
} from "@/lib/knotty/types";

type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: KnottyResponsePayload;
};

type SendMessageOptions = {
  content?: string;
  quickAction?: KnottyQuickAction;
};

function nextMessageId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `knotty-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const INITIAL_ASSISTANT_MESSAGE: ConversationMessage = {
  id: "knotty-intro",
  role: "assistant",
  content:
    "Tell me what matters most right now and I’ll narrow this down into a clear match with the next best backups.",
};

export function useKnotty() {
  const sessionIdRef = useRef(getOrCreateKnottySessionId());
  const [messages, setMessages] = useState<ConversationMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const conversationHistory = useMemo<KnottyMessage[]>(
    () =>
      messages
        .filter((message) => message.id !== INITIAL_ASSISTANT_MESSAGE.id)
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
    [messages],
  );

  const trackOpen = useCallback(() => {
    const context = getKnottyClientContext();

    sendKnottyEvent({
      event: "knotty_open",
      session_id: sessionIdRef.current,
      city: context.city || null,
      neighborhood: context.neighborhood || null,
      device_type: context.deviceType || getKnottyDeviceType(),
      recommendation_source: "knotty",
      metadata: {
        page_path: context.pagePath,
      },
    });
  }, []);

  const sendMessage = useCallback(
    async (options: SendMessageOptions) => {
      const content = (options.content || "").trim();
      const quickActionLabel =
        options.quickAction === "available_now"
          ? "Find Available Now"
          : options.quickAction === "mobile"
            ? "Find Mobile Massage"
            : options.quickAction === "verified"
              ? "Show ID Verified"
              : options.quickAction === "help_choose"
                ? "Help Me Choose"
                : "";
      const displayContent = content || quickActionLabel;

      if (!displayContent && !options.quickAction) {
        return;
      }

      const userMessage: ConversationMessage = {
        id: nextMessageId(),
        role: "user",
        content: displayContent,
      };

      const nextMessages = [...messages, userMessage];
      const outgoingMessages =
        displayContent
          ? [...conversationHistory, { role: "user" as const, content: displayContent }]
          : conversationHistory;

      setMessages(nextMessages);

      setInput("");
      setIsTyping(true);

      try {
        const context = getKnottyClientContext();
        const response = await postJson<KnottyResponsePayload>("/api/knotty", {
          sessionId: sessionIdRef.current,
          messages: outgoingMessages,
          quickAction: options.quickAction,
          context,
        });

        setMessages((current) => [
          ...current,
          {
            id: nextMessageId(),
            role: "assistant",
            content: response.reply,
            response,
          },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: nextMessageId(),
            role: "assistant",
            content: "I hit a connection issue, but I can still guide you if you try that again.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [conversationHistory, messages],
  );

  const trackRecommendationClick = useCallback((recommendation: KnottyRecommendation) => {
    const context = getKnottyClientContext();

    sendKnottyEvent({
      event: "knotty_profile_clicked",
      session_id: sessionIdRef.current,
      therapist_id: recommendation.therapistId,
      city: recommendation.city,
      neighborhood: recommendation.neighborhood,
      intent: recommendation.intent,
      device_type: context.deviceType || getKnottyDeviceType(),
      position_in_results: recommendation.position,
      recommendation_source: "knotty",
      metadata: {
        page_path: context.pagePath,
        profile_path: recommendation.profilePath,
      },
    });
  }, []);

  return {
    input,
    isTyping,
    messages,
    quickActions: [
      { key: "available_now" as const, label: "Find Available Now" },
      { key: "mobile" as const, label: "Find Mobile Massage" },
      { key: "verified" as const, label: "Show ID Verified" },
      { key: "help_choose" as const, label: "Help Me Choose" },
    ],
    setInput,
    sendMessage,
    trackOpen,
    trackRecommendationClick,
  };
}
