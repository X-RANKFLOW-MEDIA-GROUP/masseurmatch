import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/app/api/_lib/session";
import { persistSubmittedProfile } from "../_lib/profile-submission";

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

    // Require an authenticated session to persist the submission
    const session = getRequestSession(request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const persistError = await persistSubmittedProfile(session.userId, profile, planTier);
    if (persistError) {
      console.error("[signup/submit] Profile update failed:", persistError);
      return NextResponse.json({ error: "Could not save your profile. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
