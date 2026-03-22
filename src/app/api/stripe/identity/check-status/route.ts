import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  try {
    // TODO: Retrieve Stripe Identity VerificationSession status
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.identity.verificationSessions.retrieve(sessionId);
    // return NextResponse.json({ status: session.status });

    // Placeholder — replace with actual Stripe call
    return NextResponse.json({ status: "processing" });
  } catch {
    return NextResponse.json(
      { error: "Failed to check verification status." },
      { status: 500 },
    );
  }
}
