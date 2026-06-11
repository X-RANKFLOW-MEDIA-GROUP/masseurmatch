import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { getRequestSession } from "@/app/api/_lib/session";
import { normalizePhoneNumber } from "@/app/_lib/public-profile";
import { createHash } from "crypto";

type ContactMethod = "call" | "sms" | "whatsapp";

function isContactMethod(value: string | null): value is ContactMethod {
  return value === "call" || value === "sms" || value === "whatsapp";
}

function buildContactUrl(method: ContactMethod, phone: string) {
  const normalized = normalizePhoneNumber(phone);
  const digitsOnly = normalized.replace(/[^\d]/g, "");

  if (!normalized || !digitsOnly) return null;

  if (method === "call") return `tel:${normalized}`;
  if (method === "sms") return `sms:${normalized}`;
  return `https://wa.me/${digitsOnly}`;
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const method = request.nextUrl.searchParams.get("method");

  if (!isContactMethod(method)) {
    return NextResponse.json({ error: "Invalid contact method." }, { status: 400 });
  }

  const { id } = await context.params;
  const adminClient = createSupabaseAdminClient();

  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("id,phone,whatsapp_number,profile_status,visibility_status,is_suspended,is_banned")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Contact is unavailable." }, { status: 500 });
  }

  if (
    !profile ||
    profile.profile_status !== "approved" ||
    profile.visibility_status !== "public" ||
    profile.is_suspended ||
    profile.is_banned
  ) {
    return NextResponse.json({ error: "Contact is unavailable." }, { status: 404 });
  }

  const phone = method === "whatsapp" ? profile.whatsapp_number || profile.phone : profile.phone;

  if (!phone) {
    return NextResponse.json({ error: "Contact is unavailable." }, { status: 404 });
  }

  const redirectUrl = buildContactUrl(method, phone);

  if (!redirectUrl) {
    return NextResponse.json({ error: "Contact is unavailable." }, { status: 404 });
  }

  // Fire-and-forget: analytics + contact event logging
  const session = getRequestSession(request as unknown as Request);
  const ipRaw =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  Promise.allSettled([
    adminClient.rpc("increment_profile_contact_clicks", { p_profile_id: profile.id }),
    adminClient.from("contact_events").insert({
      profile_id: profile.id,
      user_id: session?.userId ?? null,
      method,
      ip_hash: hashIp(ipRaw),
    }),
  ]).catch(() => {
    // Never block the redirect on tracking failures.
  });

  return NextResponse.redirect(redirectUrl, { status: 302 });
}
