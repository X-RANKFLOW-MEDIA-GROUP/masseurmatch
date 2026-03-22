import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, stripeIdentitySessionId } = body;

    if (!profile) {
      return NextResponse.json({ error: "Missing profile data." }, { status: 400 });
    }

    // TODO: Persist updated profile to Supabase:
    // 1. Update profile fields
    // 2. Re-upload any new photos
    // 3. Set submission_status = 'submitted'
    // 4. Re-add to moderation queue

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
