import { NextRequest, NextResponse } from "next/server";
import { requireSession, createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

const IMESSAGE_CONSENT_VERSION = "knotty-imessage-profile-v1";

type PreferencePayload = {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  marketingEnabled?: boolean;
  imessageProfileAssistantEnabled?: boolean;
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
  imessage_profile_assistant_enabled: false,
  imessage_profile_assistant_consent_at: null,
  imessage_profile_assistant_consent_version: null,
  imessage_profile_assistant_opted_out_at: null,
  phone_e164: null,
  timezone: null,
  quiet_hours_start: null,
  quiet_hours_end: null,
});

const isMissingPreferencesTable = (message = "") =>
  message.includes("user_notification_preferences") ||
  message.includes("does not exist") ||
  message.includes("schema cache");

const normalizeE164 = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
};

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

    const currentResult = await supabase
      .from("user_notification_preferences")
      .select("*")
      .eq("user_id", session.userId)
      .maybeSingle();
    if (currentResult.error && !isMissingPreferencesTable(currentResult.error.message)) {
      return NextResponse.json({ error: currentResult.error.message }, { status: 500 });
    }

    const current = currentResult.data ?? defaultPreferences(session.userId);
    const requestedImessage = body.imessageProfileAssistantEnabled;
    const existingImessage = Boolean(current.imessage_profile_assistant_enabled);
    const nextImessage = requestedImessage ?? existingImessage;
    const phoneE164 = normalizeE164(body.phoneE164 ?? current.phone_e164);

    if (nextImessage && !phoneE164) {
      return NextResponse.json(
        { error: "A valid phone number is required to enable Knotty via iMessage." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const newlyEnabled = requestedImessage === true && !existingImessage;
    const newlyDisabled = requestedImessage === false && existingImessage;

    const upsertData = {
      ...defaultPreferences(session.userId),
      ...current,
      user_id: session.userId,
      email_enabled: body.emailEnabled ?? current.email_enabled ?? true,
      sms_enabled: body.smsEnabled ?? current.sms_enabled ?? false,
      push_enabled: body.pushEnabled ?? current.push_enabled ?? false,
      marketing_enabled: body.marketingEnabled ?? current.marketing_enabled ?? false,
      imessage_profile_assistant_enabled: nextImessage,
      imessage_profile_assistant_consent_at: newlyEnabled
        ? now
        : current.imessage_profile_assistant_consent_at ?? null,
      imessage_profile_assistant_consent_version: newlyEnabled
        ? IMESSAGE_CONSENT_VERSION
        : current.imessage_profile_assistant_consent_version ?? null,
      imessage_profile_assistant_opted_out_at: newlyDisabled
        ? now
        : newlyEnabled
          ? null
          : current.imessage_profile_assistant_opted_out_at ?? null,
      phone_e164: phoneE164,
      timezone: body.timezone ?? current.timezone ?? null,
      quiet_hours_start: body.quietHoursStart ?? current.quiet_hours_start ?? null,
      quiet_hours_end: body.quietHoursEnd ?? current.quiet_hours_end ?? null,
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
