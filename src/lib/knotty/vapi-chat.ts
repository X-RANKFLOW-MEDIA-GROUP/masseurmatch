import { createHash } from "node:crypto";

import { RouteError } from "@/app/api/_lib/http";

const DEFAULT_ASSISTANT_ID = "dee0ea0f-721b-4ad1-8ab6-2ee981851189";
const MAX_HISTORY_MESSAGES = 14;
const MAX_SMS_REPLY_CHARS = 1_200;
const VAPI_CHAT_TIMEOUT_MS = 10_000;

type SmsChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type CreateVapiSmsChatInput = {
  from: string;
  to: string;
  history: SmsChatMessage[];
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function contentText(value: unknown): string | null {
  const direct = text(value);
  if (direct) return direct;

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => {
        const row = record(item);
        return text(row.text) ?? text(row.content);
      })
      .filter((item): item is string => Boolean(item))
      .join("\n")
      .trim();
    return joined || null;
  }

  const row = record(value);
  return text(row.text) ?? text(row.content);
}

function cleanReply(value: string): string {
  const cleaned = value.replace(/\u0000/g, "").trim();
  if (cleaned.length <= MAX_SMS_REPLY_CHARS) return cleaned;

  const truncated = cleaned.slice(0, MAX_SMS_REPLY_CHARS - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${lastSpace > 900 ? truncated.slice(0, lastSpace) : truncated}…`;
}

export function extractVapiChatReply(payload: unknown): string {
  const root = record(payload);
  const collections = [root.output, root.messages];

  for (const collection of collections) {
    if (!Array.isArray(collection)) continue;
    for (const item of [...collection].reverse()) {
      const row = record(item);
      const role = text(row.role);
      if (role && role !== "assistant") continue;
      const reply = contentText(row.content) ?? text(row.text) ?? text(row.output_text);
      if (reply) return cleanReply(reply);
    }
  }

  const direct = text(root.outputText)
    ?? text(root.output_text)
    ?? contentText(root.content)
    ?? text(root.response)
    ?? text(root.message);

  if (!direct) {
    throw new RouteError(502, "Vapi Chat returned no assistant reply.");
  }

  return cleanReply(direct);
}

export function buildVapiSmsChatPayload({ from, to, history }: CreateVapiSmsChatInput) {
  const assistantId = process.env.VAPI_CHAT_ASSISTANT_ID?.trim() || DEFAULT_ASSISTANT_ID;
  const conversationHash = createHash("sha256").update(`${from}|${to}`).digest("hex").slice(0, 20);
  const input = history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 4_000),
    }));

  if (!input.length) {
    throw new RouteError(422, "At least one SMS message is required for Vapi Chat.");
  }

  return {
    assistantId,
    input,
    stream: false,
    name: `knotty-sms-${conversationHash}`,
    assistantOverrides: {
      variableValues: {
        channel: "sms",
        customer_number: from,
        twilio_number: to,
      },
    },
  };
}

export async function generateVapiSmsReply(input: CreateVapiSmsChatInput): Promise<string> {
  const apiKey = process.env.VAPI_PRIVATE_API_KEY?.trim() || process.env.VAPI_API_KEY?.trim();
  if (!apiKey) {
    throw new RouteError(503, "VAPI_PRIVATE_API_KEY is not configured.");
  }

  const response = await fetch("https://api.vapi.ai/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(buildVapiSmsChatPayload(input)),
    cache: "no-store",
    signal: AbortSignal.timeout(VAPI_CHAT_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new RouteError(502, `Vapi Chat request failed with status ${response.status}.`);
  }

  return extractVapiChatReply(await response.json());
}
