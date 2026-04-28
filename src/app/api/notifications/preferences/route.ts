import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "http://placeholder.supabase.invalid",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-key",
);

type PreferencePayload = {
  userId: string;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  marketingEnabled?: boolean;
  phoneE164?: string | null;
  timezone?: string | null;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
};

export async function GET(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    preferences: data ?? {
      user_id: userId,
      email_enabled: true,
      sms_enabled: false,
      push_enabled: false,
      marketing_enabled: false,
      phone_e164: null,
      timezone: null,
      quiet_hours_start: null,
      quiet_hours_end: null,
    },
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body: PreferencePayload = await request.json();

    if (!body.userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_notification_preferences")
      .upsert(
        {
          user_id: body.userId,
          email_enabled: body.emailEnabled ?? true,
          sms_enabled: body.smsEnabled ?? false,
          push_enabled: body.pushEnabled ?? false,
          marketing_enabled: body.marketingEnabled ?? false,
          phone_e164: body.phoneE164 ?? null,
          timezone: body.timezone ?? null,
          quiet_hours_start: body.quietHoursStart ?? null,
          quiet_hours_end: body.quietHoursEnd ?? null,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
