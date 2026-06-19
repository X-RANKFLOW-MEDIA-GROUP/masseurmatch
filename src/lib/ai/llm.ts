import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { envAny } from "@/app/api/_lib/env";

/**
 * Shared text-completion helper for MasseurMatch's AI features (Knotty, the
 * chat route, content moderation). Provider priority: OpenAI (`gpt-4o-mini`) →
 * DeepSeek (`deepseek-chat`) → Google Gemini (`gemini-1.5-flash`). Returns null
 * if no provider key is configured or all fail — callers use their own
 * deterministic fallback. Server-only.
 */

export const OPENAI_MODEL = "gpt-4o-mini";
export const DEEPSEEK_MODEL = "deepseek-chat";
export const GEMINI_MODEL = "gemini-1.5-flash";

export type LlmProvider = "openai" | "deepseek" | "gemini";
export type LlmResult = { text: string; provider: LlmProvider; model: string } | null;

export type CompleteOptions = {
  system: string;
  user: string;
  /** Request a strict JSON object response. */
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

export function hasAnyLlmKey(): boolean {
  return Boolean(envAny(["OPENAI_API_KEY", "DEEPSEEK_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"], ""));
}

async function tryOpenAI(apiKey: string, o: CompleteOptions): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), o.timeoutMs ?? 5000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: o.temperature ?? 0.5,
        max_tokens: o.maxTokens ?? 200,
        ...(o.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: o.system },
          { role: "user", content: o.user },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } finally {
    clearTimeout(timer);
  }
}

async function tryDeepSeek(apiKey: string, o: CompleteOptions): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), o.timeoutMs ?? 5000);
  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: o.temperature ?? 0.5,
        max_tokens: o.maxTokens ?? 200,
        ...(o.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: o.system },
          { role: "user", content: o.user },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } finally {
    clearTimeout(timer);
  }
}

async function tryGemini(apiKey: string, o: CompleteOptions): Promise<string | null> {
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel(
    {
      model: GEMINI_MODEL,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      ...(o.json ? { generationConfig: { responseMimeType: "application/json" } } : {}),
    },
    { timeout: o.timeoutMs ?? 5000 },
  );

  const result = await model.generateContent(`${o.system}\n${o.user}`);
  return result.response.text().trim() || null;
}

// ── Multi-turn chat ──────────────────────────────────────────────────────────

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function tryOpenAIChat(
  apiKey: string,
  messages: ChatMessage[],
  o: { temperature?: number; maxTokens?: number; timeoutMs?: number },
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), o.timeoutMs ?? 8000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: o.temperature ?? 0.7,
        max_tokens: o.maxTokens ?? 400,
        messages,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } finally {
    clearTimeout(timer);
  }
}

async function tryDeepSeekChat(
  apiKey: string,
  messages: ChatMessage[],
  o: { temperature?: number; maxTokens?: number; timeoutMs?: number },
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), o.timeoutMs ?? 8000);
  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: o.temperature ?? 0.7,
        max_tokens: o.maxTokens ?? 400,
        messages,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } finally {
    clearTimeout(timer);
  }
}

async function tryGeminiChat(
  apiKey: string,
  messages: ChatMessage[],
  o: { temperature?: number; maxTokens?: number; timeoutMs?: number },
): Promise<string | null> {
  const systemMsg = messages.find((m) => m.role === "system");
  const turns = messages.filter((m) => m.role !== "system");
  const lastTurn = turns[turns.length - 1];
  if (!lastTurn) return null;

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel(
    {
      model: GEMINI_MODEL,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    },
    { timeout: o.timeoutMs ?? 8000 },
  );

  const historyTurns = turns.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Prepend system context to first user message since Gemini 1.5-flash
  // doesn't have a dedicated systemInstruction field in the SDK version used.
  const firstContent = systemMsg
    ? `${systemMsg.content}\n\n${lastTurn.content}`
    : lastTurn.content;

  const chat = model.startChat({ history: historyTurns });
  const result = await chat.sendMessage(firstContent);
  return result.response.text().trim() || null;
}

/**
 * Send a multi-turn conversation to the LLM. Provider order: OpenAI →
 * DeepSeek → Gemini. Falls through to null if all fail.
 */
export async function chatMessages(
  messages: ChatMessage[],
  o: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {},
): Promise<LlmResult> {
  const openaiKey = envAny(["OPENAI_API_KEY"], "");
  if (openaiKey) {
    try {
      const text = await tryOpenAIChat(openaiKey, messages, o);
      if (text) return { text, provider: "openai", model: OPENAI_MODEL };
    } catch {
      // fall through
    }
  }

  const deepseekKey = envAny(["DEEPSEEK_API_KEY"], "");
  if (deepseekKey) {
    try {
      const text = await tryDeepSeekChat(deepseekKey, messages, o);
      if (text) return { text, provider: "deepseek", model: DEEPSEEK_MODEL };
    } catch {
      // fall through
    }
  }

  const geminiKey = envAny(["GEMINI_API_KEY", "GOOGLE_API_KEY"], "");
  if (geminiKey) {
    try {
      const text = await tryGeminiChat(geminiKey, messages, o);
      if (text) return { text, provider: "gemini", model: GEMINI_MODEL };
    } catch {
      // fall through
    }
  }

  return null;
}

// ── Single-turn completion (kept for moderation / one-shot callers) ──────────

/** Complete a prompt. Provider order: OpenAI → DeepSeek → Gemini. */
export async function completeText(o: CompleteOptions): Promise<LlmResult> {
  const openaiKey = envAny(["OPENAI_API_KEY"], "");
  if (openaiKey) {
    try {
      const text = await tryOpenAI(openaiKey, o);
      if (text) return { text, provider: "openai", model: OPENAI_MODEL };
    } catch {
      // fall through to the next provider
    }
  }

  const deepseekKey = envAny(["DEEPSEEK_API_KEY"], "");
  if (deepseekKey) {
    try {
      const text = await tryDeepSeek(deepseekKey, o);
      if (text) return { text, provider: "deepseek", model: DEEPSEEK_MODEL };
    } catch {
      // fall through
    }
  }

  const geminiKey = envAny(["GEMINI_API_KEY", "GOOGLE_API_KEY"], "");
  if (geminiKey) {
    try {
      const text = await tryGemini(geminiKey, o);
      if (text) return { text, provider: "gemini", model: GEMINI_MODEL };
    } catch {
      // fall through — caller uses its own fallback
    }
  }

  return null;
}
