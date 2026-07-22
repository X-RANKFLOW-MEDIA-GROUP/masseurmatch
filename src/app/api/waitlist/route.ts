import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/integrations/supabase/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set(["visitor", "therapist", "partner", "press"]);
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;

type WaitlistPayload = {
  email?: string;
  role?: string;
  eventName?: string;
  campaign?: string;
  pagePath?: string;
  referrer?: string;
  company?: string;
  startedAt?: number;
  metadata?: Record<string, unknown>;
};

function sanitizeText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, 500);
}

async function parsePayload(request: Request): Promise<WaitlistPayload> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as WaitlistPayload;
  }
  const formData = await request.formData().catch(() => null);
  if (!formData) return {};
  return {
    email: String(formData.get("email") || ""),
    role: String(formData.get("role") || "visitor"),
    eventName: String(formData.get("eventName") || "waitlist_signup"),
    campaign: String(formData.get("campaign") || "prelaunch"),
    pagePath: String(formData.get("pagePath") || "/"),
    referrer: String(formData.get("referrer") || ""),
    company: String(formData.get("company") || ""),
    startedAt: Number(formData.get("startedAt") || 0),
  };
}

function getRequestKey(request: Request, email: string) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `${forwardedFor.split(",")[0]}:${userAgent.slice(0, 140)}:${email || "anonymous"}`.slice(0, 500);
}

async function enforceRateLimit(supabase: ReturnType<typeof createClient>, fingerprint: string) {
  const now = new Date();
  const existing = await supabase
    .from("waitlist_rate_limits")
    .select("window_start, request_count, blocked_until")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (existing.error) {
    console.error("[waitlist] rate-limit check failed:", existing.error.message);
    return { allowed: true };
  }
  if (!existing.data) {
    await supabase.from("waitlist_rate_limits").insert({ fingerprint, window_start: now.toISOString(), request_count: 1 });
    return { allowed: true };
  }

  if (existing.data.blocked_until && new Date(existing.data.blocked_until).getTime() > now.getTime()) {
    return { allowed: false, status: 429, error: "Too many requests. Try again later." };
  }

  const windowStart = new Date(existing.data.window_start).getTime();
  const expired = now.getTime() - windowStart > RATE_LIMIT_WINDOW_MS;
  if (expired) {
    await supabase.from("waitlist_rate_limits").update({ window_start: now.toISOString(), request_count: 1, blocked_until: null }).eq("fingerprint", fingerprint);
    return { allowed: true };
  }

  const nextCount = Number(existing.data.request_count || 0) + 1;
  if (nextCount > MAX_REQUESTS_PER_WINDOW) {
    await supabase.from("waitlist_rate_limits").update({ request_count: nextCount, blocked_until: new Date(now.getTime() + 60 * 60 * 1000).toISOString() }).eq("fingerprint", fingerprint);
    return { allowed: false, status: 429, error: "Too many requests. Try again later." };
  }

  await supabase.from("waitlist_rate_limits").update({ request_count: nextCount }).eq("fingerprint", fingerprint);
  return { allowed: true };
}

export async function POST(request: Request) {
  const payload = await parsePayload(request);
  const supabase = createClient();
  const email = sanitizeText(payload.email).toLowerCase();
  const role = ALLOWED_ROLES.has(payload.role || "") ? payload.role || "visitor" : "visitor";
  const eventName = sanitizeText(payload.eventName, email ? "waitlist_signup" : "coming_soon_event");
  const source = "coming_soon";
  const pagePath = sanitizeText(payload.pagePath, "/");
  const referrer = sanitizeText(payload.referrer || request.headers.get("referer") || "");
  const campaign = sanitizeText(payload.campaign, "prelaunch");
  const userAgent = sanitizeText(request.headers.get("user-agent") || "");
  const metadata = (typeof payload.metadata === "object" && payload.metadata ? payload.metadata : {}) as Json;
  const company = sanitizeText(payload.company);
  const startedAt = typeof payload.startedAt === "number" ? payload.startedAt : 0;
  const timeToSubmitMs = startedAt > 0 ? Date.now() - startedAt : null;

  const rateLimit = await enforceRateLimit(supabase, getRequestKey(request, email));
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, error: rateLimit.error }, { status: rateLimit.status || 429 });
  }

  if (company) {
    await supabase.from("waitlist_events").insert({ event_name: "bot_honeypot_blocked", email: email || null, source, page_path: pagePath, referrer, user_agent: userAgent, metadata: { campaign } });
    return NextResponse.json({ ok: true, blocked: true });
  }

  if (email && timeToSubmitMs !== null && timeToSubmitMs < 1200) {
    await supabase.from("waitlist_events").insert({ event_name: "bot_fast_submit_blocked", email, source, page_path: pagePath, referrer, user_agent: userAgent, metadata: { campaign, timeToSubmitMs } });
    return NextResponse.json({ ok: false, error: "Please try again." }, { status: 400 });
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ ok: false, error: "Valid email is required." }, { status: 400 });
  }

  const eventInsert = await supabase.from("waitlist_events").insert({ event_name: eventName, email: email || null, source, page_path: pagePath, referrer, user_agent: userAgent, metadata: { ...(metadata as Record<string, Json | undefined>), campaign, timeToSubmitMs } });
  if (eventInsert.error) return NextResponse.json({ ok: false, error: "Unable to track event." }, { status: 500 });
  if (!email) return NextResponse.json({ ok: true, tracked: true });

  const normalizedEmail = email.toLowerCase().replace(/\+[^@]*(?=@)/, "").replace(/\.(?=[^@]*@)/g, "");

  const signupInsert = await supabase
    .from("waitlist_signups")
    .upsert({ email, normalized_email: normalizedEmail, role, source, campaign, page_path: pagePath, referrer, user_agent: userAgent, metadata }, { onConflict: "normalized_email" })
    .select("id, email, created_at")
    .single();

  if (signupInsert.error) return NextResponse.json({ ok: false, error: "Unable to save signup." }, { status: 500 });

  await supabase.from("waitlist_events").insert({ event_name: "conversion_waitlist_signup_completed", email, source, page_path: pagePath, referrer, user_agent: userAgent, metadata: { campaign, signup_id: signupInsert.data.id, timeToSubmitMs } });

  return NextResponse.json({ ok: true, signup: signupInsert.data });
}
