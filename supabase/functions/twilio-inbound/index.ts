import { createClient } from "jsr:@supabase/supabase-js@2";

const TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
const E164_RE = /^\+[1-9][0-9]{7,14}$/;
const MAX_BODY_LENGTH = 1600;

function xml(body = TWIML, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/xml; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function secureEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

async function hmacSha1Base64(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function signatureUrl(request: Request): string {
  const configured = Deno.env.get("TWILIO_INBOUND_WEBHOOK_URL")?.trim();
  return configured || request.url;
}

async function verifyTwilioSignature(request: Request, params: URLSearchParams): Promise<boolean> {
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")?.trim() ?? "";
  const provided = request.headers.get("x-twilio-signature")?.trim() ?? "";
  if (!authToken || !provided) return false;

  const sorted = [...params.entries()].sort(([keyA, valueA], [keyB, valueB]) => {
    const keyOrder = keyA.localeCompare(keyB);
    return keyOrder !== 0 ? keyOrder : valueA.localeCompare(valueB);
  });

  let signedValue = signatureUrl(request);
  for (const [key, value] of sorted) signedValue += `${key}${value}`;

  const expected = await hmacSha1Base64(signedValue, authToken);
  return secureEquals(provided, expected);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return xml(TWIML, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN")?.trim() ?? "";

  if (!supabaseUrl || !serviceRoleKey || !twilioAuthToken) {
    console.error("[twilio-inbound] Required server configuration is missing");
    return xml(TWIML, 503);
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/x-www-form-urlencoded")) {
    return xml(TWIML, 415);
  }

  const raw = await request.text();
  if (raw.length > 20_000) return xml(TWIML, 413);

  const params = new URLSearchParams(raw);
  if (!(await verifyTwilioSignature(request, params))) {
    console.warn("[twilio-inbound] Rejected invalid webhook signature");
    return xml(TWIML, 403);
  }

  const from = (params.get("From") || "").trim();
  const body = params.get("Body") || "";
  const messageSid = (params.get("MessageSid") || params.get("SmsSid") || "").trim();

  if (!E164_RE.test(from) || body.length === 0 || body.length > MAX_BODY_LENGTH) {
    console.warn("[twilio-inbound] Rejected invalid signed message", { messageSid: messageSid || null });
    return xml(TWIML, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("bruno_conversations").insert({
    phone: from,
    inbound: body,
  });

  if (error) {
    console.error("[twilio-inbound] Database insert failed", {
      messageSid: messageSid || null,
      code: error.code || null,
    });
    return xml(TWIML, 500);
  }

  console.log("[twilio-inbound] Message accepted", { messageSid: messageSid || null });
  return xml();
});
