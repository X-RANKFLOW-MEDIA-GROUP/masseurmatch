import { RouteError } from "@/app/api/_lib/http";
import { createSupabaseWebhookAdminClient } from "@/app/api/_lib/supabase-server";

const DEFAULT_ASSISTANT_ID = "dee0ea0f-721b-4ad1-8ab6-2ee981851189";
const MAX_SMS_REPLY_CHARS = 1_200;
const VAPI_CHAT_TIMEOUT_MS = 10_000;

type CreateVapiSmsChatInput = {
  from: string;
  to: string;
  message: string;
};

type VapiChatResult = {
  reply: string;
  chatId: string;
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

export function extractVapiChatResult(payload: unknown): VapiChatResult {
  const root = record(payload);
  const chatId = text(root.id) ?? text(root.chatId);
  if (!chatId) throw new RouteError(502, "Vapi Chat returned no chat ID.");

  const output = Array.isArray(root.output) ? root.output : [];
  let reply: string | null = null;

  for (const item of [...output].reverse()) {
    const row = record(item);
    const role = text(row.role);
    if (role && role !== "assistant") continue;
    reply = contentText(row.content) ?? text(row.text) ?? text(row.output_text);
    if (reply) break;
  }

  reply ??= text(root.outputText)
    ?? text(root.output_text)
    ?? contentText(root.content)
    ?? text(root.response)
    ?? text(root.message);

  if (!reply) throw new RouteError(502, "Vapi Chat returned no assistant reply.");
  return { reply: cleanReply(reply), chatId };
}

async function getPreviousChatId(from: string, to: string, assistantId: string): Promise<string | null> {
  const admin = createSupabaseWebhookAdminClient();
  const { data, error } = await admin
    .from("vapi_sms_sessions" as never)
    .select("last_chat_id")
    .eq("from_number", from)
    .eq("to_number", to)
    .eq("assistant_id", assistantId)
    .maybeSingle();

  if (error) throw new RouteError(500, error.message);
  return text((data as { last_chat_id?: unknown } | null)?.last_chat_id);
}

async function saveChatId(from: string, to: string, assistantId: string, chatId: string): Promise<void> {
  const admin = createSupabaseWebhookAdminClient();
  const { error } = await admin
    .from("vapi_sms_sessions" as never)
    .upsert({
      from_number: from,
      to_number: to,
      assistant_id: assistantId,
      last_chat_id: chatId,
      updated_at: new Date().toISOString(),
    } as never, { onConflict: "from_number,to_number,assistant_id" });

  if (error) throw new RouteError(500, error.message);
}

export async function generateVapiSmsReply({ from, to, message }: CreateVapiSmsChatInput): Promise<VapiChatResult> {
  const apiKey = process.env.VAPI_PRIVATE_API_KEY?.trim() || process.env.VAPI_API_KEY?.trim();
  if (!apiKey) throw new RouteError(503, "VAPI_PRIVATE_API_KEY is not configured.");

  const assistantId = process.env.VAPI_CHAT_ASSISTANT_ID?.trim() || DEFAULT_ASSISTANT_ID;
  const previousChatId = await getPreviousChatId(from, to, assistantId);
  const payload = {
    assistantId,
    input: message.slice(0, 4_000),
    ...(previousChatId ? { previousChatId } : {}),
  };

  const response = await fetch("https://api.vapi.ai/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(VAPI_CHAT_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new RouteError(502, `Vapi Chat request failed with status ${response.status}.`);
  }

  const result = extractVapiChatResult(await response.json());
  await saveChatId(from, to, assistantId, result.chatId);
  return result;
}
