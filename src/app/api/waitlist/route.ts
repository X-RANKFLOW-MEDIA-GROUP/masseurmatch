import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set(["visitor", "therapist", "partner", "press"]);

type WaitlistPayload = {
  email?: string;
  role?: string;
  eventName?: string;
  source?: string;
  campaign?: string;
  pagePath?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
};

function sanitizeText(value: unknown, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim().slice(0, 500);
}

async function parsePayload(request: Request): Promise<WaitlistPayload> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as WaitlistPayload;
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return {};
  }

  return {
    email: String(formData.get("email") || ""),
    role: String(formData.get("role") || "visitor"),
    eventName: String(formData.get("eventName") || "waitlist_signup"),
    source: String(formData.get("source") || "coming_soon"),
    campaign: String(formData.get("campaign") || "prelaunch"),
    pagePath: String(formData.get("pagePath") || "/"),
    referrer: String(formData.get("referrer") || ""),
  };
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
  const metadata = typeof payload.metadata === "object" && payload.metadata ? payload.metadata : {};

  if (email && !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ ok: false, error: "Valid email is required." }, { status: 400 });
  }

  const eventInsert = await supabase.from("waitlist_events").insert({
    event_name: eventName,
    email: email || null,
    source,
    page_path: pagePath,
    referrer,
    user_agent: userAgent,
    metadata: {
      ...metadata,
      campaign,
    },
  });

  if (eventInsert.error) {
    return NextResponse.json({ ok: false, error: "Unable to track event." }, { status: 500 });
  }

  if (!email) {
    return NextResponse.json({ ok: true, tracked: true });
  }

  const signupInsert = await supabase
    .from("waitlist_signups")
    .upsert(
      {
        email,
        role,
        source,
        campaign,
        page_path: pagePath,
        referrer,
        user_agent: userAgent,
        metadata,
      },
      { onConflict: "normalized_email" },
    )
    .select("id, email, created_at")
    .single();

  if (signupInsert.error) {
    return NextResponse.json({ ok: false, error: "Unable to save signup." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, signup: signupInsert.data });
}
