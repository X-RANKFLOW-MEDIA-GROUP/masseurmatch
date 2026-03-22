import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planTier, profile, verification, termsAccepted, complianceAcknowledged } = body;

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

    // TODO: Persist submission to Supabase:
    // 1. Update user profile with profile data
    // 2. Set submission_status = 'submitted'
    // 3. Set moderation_status = 'under_review'
    // 4. Store plan selection (planTier)
    // 5. Add to moderation queue
    // 6. Upload photos to Supabase storage
    // 7. Send confirmation email

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
