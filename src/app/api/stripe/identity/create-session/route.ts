import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // TODO: Create Stripe Identity VerificationSession
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.identity.verificationSessions.create({
    //   type: "document",
    //   metadata: { email },
    //   options: {
    //     document: {
    //       allowed_types: ["driving_license", "passport", "id_card"],
    //       require_matching_selfie: true,
    //     },
    //   },
    // });

    // Placeholder response — replace with actual Stripe call
    return NextResponse.json({
      sessionId: "vs_placeholder",
      clientSecret: "cs_placeholder",
      url: null, // Will be session.url from Stripe
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create identity verification session." },
      { status: 500 },
    );
  }
}
