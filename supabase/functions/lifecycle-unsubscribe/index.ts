import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse, getClientKey } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUCCESS_TEXT = "You have been unsubscribed. You will no longer receive marketing emails from MasseurMatch.";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_RE = /^[a-f0-9]{64}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function toBytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

function secureEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

async function hmacHex(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, toBytes(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const rl = checkRateLimit(getClientKey(req), { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  try {
    const unsubscribeSecret = Deno.env.get("UNSUBSCRIBE_HMAC_SECRET")?.trim() ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";

    if (unsubscribeSecret.length < 32 || !supabaseUrl || !serviceKey) {
      console.error("[lifecycle-unsubscribe] Required server configuration is missing");
      return json({ error: "Unsubscribe service is temporarily unavailable" }, 503);
    }

    let email = "";
    let token = "";

    if (req.method === "GET") {
      const url = new URL(req.url);
      email = (url.searchParams.get("email") ?? "").toLowerCase().trim();
      token = (url.searchParams.get("token") ?? "").trim();
    } else {
      const body = await req.json().catch(() => ({}));
      email = String(body?.email ?? "").toLowerCase().trim();
      token = String(body?.token ?? "").trim();
    }

    if (!EMAIL_RE.test(email) || email.length > 254 || !TOKEN_RE.test(token)) {
      return json({ error: "Invalid unsubscribe link" }, 400);
    }

    const expectedToken = await hmacHex(email, unsubscribeSecret);
    if (!secureEquals(expectedToken, token.toLowerCase())) {
      return json({ error: "Invalid unsubscribe link" }, 401);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.rpc("unsubscribe_marketing_email", { p_email: email });
    if (error) throw error;

    if (req.method === "GET") {
      return new Response(SUCCESS_TEXT, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        },
      });
    }

    return json({ success: true, message: SUCCESS_TEXT });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[lifecycle-unsubscribe] Failed", { error: message });
    return json({ error: "Unsubscribe service is temporarily unavailable" }, 500);
  }
});
