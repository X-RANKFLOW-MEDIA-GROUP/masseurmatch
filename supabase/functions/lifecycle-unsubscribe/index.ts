import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse, getClientKey } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUCCESS_TEXT = "You have been unsubscribed. You will no longer receive marketing emails from MasseurMatch.";

function toBytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

async function hmacHex(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, toBytes(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rl = checkRateLimit(getClientKey(req), { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const unsubscribeSecret = Deno.env.get("UNSUBSCRIBE_HMAC_SECRET") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!unsubscribeSecret) throw new Error("UNSUBSCRIBE_HMAC_SECRET not configured");
    if (!supabaseUrl || !serviceKey) throw new Error("Supabase service credentials are not configured");

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

    if (!email || !token) {
      return new Response(JSON.stringify({ error: "Missing email or token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expectedToken = await hmacHex(email, unsubscribeSecret);
    if (expectedToken !== token) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { error } = await supabase.rpc("unsubscribe_marketing_email", { p_email: email });
    if (error) throw error;

    if (req.method === "GET") {
      return new Response(SUCCESS_TEXT, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(JSON.stringify({ success: true, message: SUCCESS_TEXT }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
