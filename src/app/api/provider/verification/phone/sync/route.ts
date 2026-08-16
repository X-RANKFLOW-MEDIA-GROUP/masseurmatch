import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

function normalizePhone(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (trimmed.startsWith("+")) return `+${digits}`;
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

async function loadPhoneState(userId: string) {
  const adminClient = createSupabaseAdminClient();
  const [{ data: authData, error: authError }, { data: profile, error: profileError }] = await Promise.all([
    adminClient.auth.admin.getUserById(userId),
    adminClient
      .from("profiles")
      .select("phone, phone_number, is_verified_phone, visibility_status")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (authError || !authData.user) {
    throw new RouteError(404, "Account not found.");
  }
  if (profileError) {
    throw new RouteError(500, "Could not load the provider profile.");
  }
  if (!profile) {
    throw new RouteError(404, "Provider profile not found.");
  }

  return { adminClient, user: authData.user, profile };
}

export async function GET(request: Request) {
  try {
    assertRateLimit(request, "provider-phone-status", { limit: 30, windowMs: 60_000 });

    const session = await requireSession(request);
    const { adminClient, user, profile } = await loadPhoneState(session.userId);

    const profilePhone = normalizePhone(profile.phone) || normalizePhone(profile.phone_number);
    const authPhone = normalizePhone(user.phone);
    const authConfirmedForProfile = Boolean(
      profilePhone &&
      authPhone &&
      user.phone_confirmed_at &&
      profilePhone === authPhone,
    );

    let verified = profile.is_verified_phone === true && authConfirmedForProfile;

    // Legacy profiles may already have the same number confirmed in Supabase Auth
    // but predate the profile-level verification flag. Repair those automatically
    // so the provider is not charged another SMS or interrupted unnecessarily.
    if (!verified && authConfirmedForProfile && authPhone) {
      const now = new Date().toISOString();
      const { error: syncError } = await adminClient
        .from("profiles")
        .update({
          phone: authPhone,
          phone_number: authPhone,
          is_verified_phone: true,
          updated_at: now,
        })
        .eq("user_id", session.userId);

      if (syncError) {
        throw new RouteError(500, "Confirmed phone could not be synchronized to the profile.");
      }
      verified = true;
    }

    return json({
      ok: true,
      phone: profilePhone,
      verified,
      requiresVerification: profile.visibility_status === "public" && !verified,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "provider-phone-sync", { limit: 10, windowMs: 60_000 });

    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient.auth.admin.getUserById(session.userId);

    if (error || !data.user) {
      throw new RouteError(404, "Account not found.");
    }

    const phone = normalizePhone(data.user.phone);
    if (!phone || !data.user.phone_confirmed_at) {
      throw new RouteError(
        409,
        "Phone verification must be completed before the profile can use this number.",
        "PHONE_NOT_VERIFIED",
      );
    }

    const now = new Date().toISOString();
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        phone,
        phone_number: phone,
        is_verified_phone: true,
        updated_at: now,
      })
      .eq("user_id", session.userId);

    if (profileError) {
      throw new RouteError(500, "Phone was verified, but the profile could not be synchronized.");
    }

    return json({
      ok: true,
      phone,
      verifiedAt: data.user.phone_confirmed_at,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
