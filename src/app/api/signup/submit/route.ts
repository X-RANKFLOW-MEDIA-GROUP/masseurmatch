import { NextRequest, NextResponse } from "next/server";

import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { persistSubmittedProfile } from "../_lib/profile-submission";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planTier, profile, termsAccepted, complianceAcknowledged } = body;

    if (!profile) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ error: "Terms must be accepted." }, { status: 400 });
    }

    if (!complianceAcknowledged) {
      return NextResponse.json({ error: "Platform compliance must be acknowledged." }, { status: 400 });
    }

    const session = getRequestSession(request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const adminClient = createSupabaseAdminClient();
    const [{ data: authUserData, error: authUserError }, { data: profileRow, error: profileError }, { data: verificationRow, error: verificationError }] =
      await Promise.all([
        adminClient.auth.admin.getUserById(session.userId),
        adminClient
          .from("profiles")
          .select("is_verified_identity")
          .eq("user_id", session.userId)
          .maybeSingle(),
        adminClient
          .from("identity_verifications")
          .select("status")
          .eq("user_id", session.userId)
          .maybeSingle(),
      ]);

    if (authUserError || !authUserData.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (profileError) {
      console.error("[signup/submit] Could not load profile verification state:", profileError.message);
      return NextResponse.json({ error: "Could not verify your profile state." }, { status: 500 });
    }

    if (verificationError && verificationError.code !== "PGRST116") {
      console.error("[signup/submit] Could not load identity verification state:", verificationError.message);
      return NextResponse.json({ error: "Could not verify your identity state." }, { status: 500 });
    }

    const emailVerified = Boolean(authUserData.user.email_confirmed_at);
    const phoneVerified = Boolean(authUserData.user.phone_confirmed_at);
    const identityVerified =
      Boolean(profileRow?.is_verified_identity) || verificationRow?.status === "verified";

    if (!emailVerified) {
      return NextResponse.json({ error: "Email must be verified." }, { status: 400 });
    }

    if (!identityVerified) {
      return NextResponse.json({ error: "Identity verification must be completed." }, { status: 400 });
    }

    const persistError = await persistSubmittedProfile(
      session.userId,
      {
        ...profile,
        termsAccepted: Boolean(termsAccepted),
        complianceAcknowledged: Boolean(complianceAcknowledged),
        emailVerified,
        phoneVerified,
        identityVerified,
      },
      planTier,
    );

    if (persistError) {
      console.error("[signup/submit] Profile update failed:", persistError);
      return NextResponse.json({ error: "Could not save your profile. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
