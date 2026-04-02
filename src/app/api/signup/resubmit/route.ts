import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/app/api/_lib/session";
import { persistSubmittedProfile } from "../_lib/profile-submission";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, stripeIdentitySessionId } = body;

    if (!profile) {
      return NextResponse.json({ error: "Missing profile data." }, { status: 400 });
    }

    // Require an authenticated session to persist the resubmission
    const session = getRequestSession(request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const persistError = await persistSubmittedProfile(session.userId, profile);
    if (persistError) {
      console.error("[signup/resubmit] Profile update failed:", persistError);
      return NextResponse.json({ error: "Could not update your profile. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
