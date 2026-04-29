import { NextResponse } from "next/server";

import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: verification, error: verificationError } = await adminClient
      .from("identity_verifications")
      .select("status, stripe_session_id, updated_at, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verificationError) {
      throw new Error(verificationError.message);
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("status, stripe_verification_session_id")
      .eq("user_id", session.userId)
      .maybeSingle();

    return NextResponse.json({
      status: verification?.status ?? "not_started",
      profileStatus: profile?.status ?? null,
      stripeSessionId:
        verification?.stripe_session_id ?? profile?.stripe_verification_session_id ?? null,
      updatedAt: verification?.updated_at ?? verification?.created_at ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load verification status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
