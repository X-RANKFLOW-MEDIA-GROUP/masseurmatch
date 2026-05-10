import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

const METHOD_TARGETS = {
  call: "tel",
  sms: "sms",
  whatsapp: "https://wa.me/",
} as const;

function normalizePhoneNumber(phone: string | null | undefined) {
  return (phone || "").replace(/[^\d]/g, "");
}

export async function GET(
  request: Request,
  context: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await context.params;
  const { searchParams } = new URL(request.url);
  const method = searchParams.get("method") as keyof typeof METHOD_TARGETS;

  if (!method || !(method in METHOD_TARGETS)) {
    return NextResponse.json({ error: "Invalid contact method" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, whatsapp_number, visibility_status, profile_status")
    .eq("id", profileId)
    .eq("visibility_status", "public")
    .eq("profile_status", "approved")
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const phone = normalizePhoneNumber(
    method === "whatsapp" ? profile.whatsapp_number || profile.phone : profile.phone,
  );

  if (!phone) {
    return NextResponse.json({ error: "Contact unavailable" }, { status: 404 });
  }

  const redirectTarget =
    method === "whatsapp"
      ? `${METHOD_TARGETS.whatsapp}${phone}`
      : `${METHOD_TARGETS[method]}:${phone}`;

  return NextResponse.redirect(redirectTarget, { status: 302 });
}
