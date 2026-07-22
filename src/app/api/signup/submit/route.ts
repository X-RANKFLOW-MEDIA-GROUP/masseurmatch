import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { notifyAdmin } from "@/app/api/_lib/admin-notify";

export async function POST(request: NextRequest) {
  try {
    const session = await getRequestSession(request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { planTier, profile, termsAccepted, ageAndConductAttested } = body;

    if (!profile) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Neighborhood and years of experience are optional in the profile step, so
    // they must not be hard-required here — the previous mismatch 400'd users
    // who followed the UI. Starting price stays required for a usable listing.
    if (!profile.startingPrice?.trim()) {
      return NextResponse.json({ error: "Starting price is required." }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ error: "Terms must be accepted." }, { status: 400 });
    }

    if (!ageAndConductAttested) {
      return NextResponse.json(
        { error: "You must confirm you are 18+ and provide non-sexual massage therapy only." },
        { status: 400 },
      );
    }

    const adminClient = createSupabaseAdminClient();

    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(session.userId);
    if (authError || !authUser.user?.email_confirmed_at) {
      return NextResponse.json({ error: "Email must be verified." }, { status: 400 });
    }

    const { data: identityVerification, error: verificationError } = await adminClient
      .from("identity_verifications")
      .select("status")
      .eq("user_id", session.userId)
      .eq("status", "verified")
      .maybeSingle();

    if (verificationError) {
      console.error("[signup/submit] verification lookup failed:", verificationError.message);
      return NextResponse.json({ error: "Unable to verify identity status." }, { status: 500 });
    }

    if (!identityVerification) {
      return NextResponse.json({ error: "Identity verification must be completed." }, { status: 400 });
    }

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        bio: profile.bio || null,
        city: profile.city || null,
        neighborhood_name: profile.neighborhood?.trim() || null,
        state: profile.state || null,
        specialties: profile.serviceCategories?.length ? profile.serviceCategories : null,
        incall_price: profile.startingPrice ? Number(profile.startingPrice) : null,
        years_experience: profile.yearsExperience ? Number(profile.yearsExperience) : null,
        _tier: planTier ?? null,
        status: "pending_approval",
        profile_status: "pending_approval",
        is_active: false,
        age_conduct_attested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.userId);

    if (updateError) {
      console.error("[signup/submit] profile update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://masseurmatch.com";
    // Notify admin but don't block on failure (email system is separate from profile submission)
    notifyAdmin({
      subject: "New provider profile submitted for review",
      heading: "Profile submitted for review",
      intro: `${profile.fullName || "A provider"} submitted their profile and is awaiting approval.`,
      fields: [
        { label: "Name", value: profile.fullName || null },
        { label: "City", value: profile.city || null },
        { label: "State", value: profile.state || null },
        { label: "Plan", value: planTier || null },
        { label: "User ID", value: session.userId },
      ],
      action: { label: "Review in admin", url: `${appUrl}/admin/therapists` },
    }).catch((err) => {
      console.error("[signup/submit] admin notification failed:", err);
      // Don't throw - email failure shouldn't block signup
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
