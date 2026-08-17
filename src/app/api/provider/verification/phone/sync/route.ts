import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import {
  getProviderPhoneVerificationState,
  normalizeProviderPhone,
} from "@/lib/provider-phone-verification";

async function loadPhoneState(userId: string) {
  const adminClient = createSupabaseAdminClient();
  const [{ data: authData, error: authError }, { data: profile, error: profileError }] = await Promise.all([
    adminClient.auth.admin.getUserById(userId),
    adminClient
      .from("profiles")
      .select("phone, phone_number, is_verified_phone")
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

    const state = getProviderPhoneVerificationState({
      profilePhone: profile.phone,
      profilePhoneNumber: profile.phone_number,
      isVerifiedPhone: profile.is_verified_phone,
      authPhone: user.phone,
      phoneConfirmedAt: user.phone_confirmed_at,
    });

    let verified = state.verified;

    // Legacy profiles may already have the same number confirmed in Supabase Auth
    // but predate the profile-level verification flag. Repair those automatically
    // so the provider is not charged another SMS or interrupted unnecessarily.
    if (!verified && state.authConfirmedForProfile && state.authPhone) {
      const now = new Date().toISOString();
      const { error: syncError } = await adminClient
        .from("profiles")
        .update({
          phone: state.authPhone,
          phone_number: state.authPhone,
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
      phone: state.profilePhone,
      verified,
      requiresVerification: !verified,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "provider-phone-sync", { limit: 10, windowMs: 60_000 });

    const session = await requireSession(request);
    const { adminClient, user } = await loadPhoneState(session.userId);

    const phone = normalizeProviderPhone(user.phone);
    if (!phone || !user.phone_confirmed_at) {
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
      verified: true,
      verifiedAt: user.phone_confirmed_at,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
