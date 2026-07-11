import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { sendEmail } from "@/app/api/_lib/email";
import React from "react";

export async function POST(request: NextRequest) {
  try {
    const session = getRequestSession(request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { planTier, profile, termsAccepted } = body;

    if (!profile) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!profile.neighborhood?.trim()) {
      return NextResponse.json({ error: "Neighborhood is required." }, { status: 400 });
    }

    const phone = typeof profile.phone === "string" ? profile.phone.trim() : "";
    if (phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "A valid phone number is required." }, { status: 400 });
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

    const adminClient = createSupabaseAdminClient();

    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(session.userId);
    if (authError || !authUser.user?.email_confirmed_at) {
      return NextResponse.json({ error: "Email must be verified." }, { status: 400 });
    }

    const email = authUser.user.email?.trim();
    if (!email) {
      return NextResponse.json({ error: "An email address is required." }, { status: 400 });
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
        phone,
        email: email,
        email_address: email,
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
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.userId);

    if (updateError) {
      console.error("[signup/submit] profile update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
    }

    await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@masseurmatch.com",
      subject: "New Provider Signup Pending Review",
      react: React.createElement("div", {}, [
        React.createElement("h1", { key: "title" }, "New Signup"),
        React.createElement(
          "p",
          { key: "body" },
          `A new provider (${profile.full_name || session.userId}) has submitted their profile for review.`,
        ),
        React.createElement(
          "a",
          { key: "link", href: "https://masseurmatch.com/admin/therapists" },
          "Review in Admin Dashboard",
        ),
      ]),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
