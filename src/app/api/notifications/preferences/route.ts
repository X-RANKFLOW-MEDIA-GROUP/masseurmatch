import { NextRequest, NextResponse } from "next/server";
import { requireSession, createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

type PreferencePayload = {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  marketingEnabled?: boolean;
  phoneE164?: string | null;
  timezone?: string | null;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
};

const defaultPreferences = (userId: string) => ({
  user_id: userId,
  email_enabled: true,
  sms_enabled: false,
  push_enabled: false,
  marketing_enabled: false,
  phone_e164: null,
  timezone: null,
  quiet_hours_start: null,
  quiet_hours_end: null,
});

const isMissingPreferencesTable = (message = "") =>
  message.includes("user_notification_preferences") ||
  message.includes("does not exist") ||
  message.includes("schema cache");

export async function GET(request: NextRequest) {
  let session;
  try {
    session = await requireSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const fallback = defaultPreferences(session.userId);

  const { data, error } = await supabase
    .from("user_notification_preferences")
    .select("*")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) {
    if (isMissingPreferencesTable(error.message)) {
      return NextResponse.json({ preferences: fallback, migrationPending: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ preferences: data ?? fallback });
}

export async function PUT(request: NextRequest) {
  let session;
  try {
    session = await requireSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body: PreferencePayload = await request.json();
    const supabase = createSupabaseAdminClient();

    const upsertData = {
      ...defaultPreferences(session.userId),
      email_enabled: body.emailEnabled ?? true,
      sms_enabled: body.smsEnabled ?? false,
      push_enabled: body.pushEnabled ?? false,
      marketing_enabled: body.marketingEnabled ?? false,
      phone_e164: body.phoneE164 ?? null,
      timezone: body.timezone ?? null,
      quiet_hours_start: body.quietHoursStart ?? null,
      quiet_hours_end: body.quietHoursEnd ?? null,
    };

    const { data, error } = await supabase
      .from("user_notification_preferences")
      .upsert(upsertData, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) {
      if (isMissingPreferencesTable(error.message)) {
        return NextResponse.json({ preferences: upsertData, migrationPending: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
