import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim() ?? "";
  if (!value) throw new HttpError(503, `${name} is not configured`);
  return value;
}

function getBearerToken(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

function billingReturnUrl(): string {
  const configured = Deno.env.get("SITE_URL")?.trim() || "https://masseurmatch.com";
  const origin = new URL(configured);
  if (origin.protocol !== "https:" && origin.hostname !== "localhost") {
    throw new HttpError(503, "SITE_URL must use HTTPS");
  }
  return new URL("/pro/billing", origin).toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const stripeKey = requiredEnv("STRIPE_SECRET_KEY");
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    const token = getBearerToken(req);
    if (!token) throw new HttpError(401, "Authentication required");

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new HttpError(401, "Invalid or expired session");
    const user = userData.user;

    const rl = checkRateLimit(`user:${user.id}`, { limit: 10, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError) throw new HttpError(500, "Could not load billing profile");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    let customerId = profile?.stripe_customer_id?.trim() || "";

    if (!customerId && user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = customers.data[0]?.id || "";
    }

    if (!customerId) throw new HttpError(404, "No Stripe customer found. Subscribe to a plan first.");

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: billingReturnUrl(),
    });

    console.log("[CUSTOMER-PORTAL] Portal session created", { userId: user.id });
    return json({ url: portalSession.url });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : String(error);
    if (status >= 500) console.error("[CUSTOMER-PORTAL] Error", { message });
    return json({ error: status >= 500 ? "Billing portal is temporarily unavailable." : message }, status);
  }
});
