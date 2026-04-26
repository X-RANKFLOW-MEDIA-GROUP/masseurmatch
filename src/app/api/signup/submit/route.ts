import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const session = getRequestSession(request as unknown as Request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { planTier, profile, verification, termsAccepted } = body;

    if (!profile || !verification) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ error: "Terms must be accepted." }, { status: 400 });
    }

    if (!verification.emailVerified) {
      return NextResponse.json({ error: "Email must be verified." }, { status: 400 });
    }

    if (verification.identityVerificationStatus !== "verified") {
      return NextResponse.json(
        { error: "Identity verification must be completed." },
        { status: 400 },
      );
    }

    const adminClient = createSupabaseAdminClient();

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        bio: profile.bio || null,
        city: profile.city || null,
        state: profile.state || null,
        specialties: profile.serviceCategories?.length ? profile.serviceCategories : null,
        incall_price: profile.startingPrice ? Number(profile.startingPrice) : null,
        _tier: planTier ?? null,
        status: "pending_approval",
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.userId);

    if (updateError) {
      console.error("[signup/submit] profile update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
