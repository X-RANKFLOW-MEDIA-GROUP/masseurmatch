import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { sendEmail } from "@/app/api/_lib/email";
import React from "react";

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

    if (!profile.neighborhood?.trim()) {
      return NextResponse.json({ error: "Neighborhood is required." }, { status: 400 });
    }

    if (!profile.yearsExperience?.trim()) {
      return NextResponse.json({ error: "Years of experience is required." }, { status: 400 });
    }

    if (!profile.startingPrice?.trim()) {
      return NextResponse.json({ error: "Starting price is required." }, { status: 400 });
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

    const { data: identityVerification, error: identityVerificationError } = await adminClient
      .from("identity_verifications")
      .select("id, status")
      .eq("user_id", session.userId)
      .eq("status", "verified")
      .maybeSingle();

    if (identityVerificationError) {
      return NextResponse.json({ error: "Could not verify identity status." }, { status: 500 });
    }

    if (!identityVerification) {
      return NextResponse.json(
        { error: "Identity verification must be completed." },
        { status: 400 },
      );
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
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.userId);

    if (updateError) {
      console.error("[signup/submit] profile update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
    }

    // Notify Admin of new signup
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@masseurmatch.com",
      subject: "New Provider Signup Pending Review",
      react: React.createElement("div", {}, [
        React.createElement("h1", {}, "New Signup"),
        React.createElement("p", {}, `A new provider (${profile.full_name || session.userId}) has pending_approval their profile for review.`),
        React.createElement("a", { href: "https://masseurmatch.com/admin/therapists" }, "Review in Admin Dashboard")
      ])
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
