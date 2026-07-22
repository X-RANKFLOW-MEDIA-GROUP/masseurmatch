import { NextRequest, NextResponse } from "next/server";

import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { notifyAdmin } from "@/app/api/_lib/admin-notify";
import { isRateWithinLimit } from "@/lib/provider-product-rules";

type PricingSessionInput = {
  minutes?: number;
  incall_rate?: number | null;
  outcall_rate?: number | null;
  incall_ask_me?: boolean;
  outcall_ask_me?: boolean;
  technique?: string | null;
  mode?: string | null;
};

function validatePricingSessions(value: unknown): PricingSessionInput[] {
  if (!Array.isArray(value)) return [];

  const sessions = value.filter((item): item is PricingSessionInput => typeof item === "object" && item !== null);
  for (const session of sessions) {
    const minutes = Number(session.minutes);
    if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 600) {
      throw new Error("Every published rate must include a valid session duration.");
    }
    if (!session.incall_ask_me && !isRateWithinLimit(minutes, session.incall_rate)) {
      throw new Error("An incall rate exceeds MasseurMatch's maximum of US$3.33 per minute. Lower it or select Ask Me.");
    }
    if (!session.outcall_ask_me && !isRateWithinLimit(minutes, session.outcall_rate)) {
      throw new Error("An outcall rate exceeds MasseurMatch's maximum of US$3.33 per minute. Lower it or select Ask Me.");
    }
  }
  return sessions;
}

export async function POST(request: NextRequest) {
  try {
    const session = getRequestSession(request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const {
      planTier,
      profile,
      termsAccepted,
      complianceAcknowledged,
      ageAndConductAttested,
    } = body;

    if (!profile) {
      return NextResponse.json({ error: "Missing profile data." }, { status: 400 });
    }
    if (!termsAccepted) {
      return NextResponse.json({ error: "Terms must be accepted." }, { status: 400 });
    }
    if (!complianceAcknowledged) {
      return NextResponse.json({ error: "The Therapist Agreement must be accepted." }, { status: 400 });
    }
    if (!ageAndConductAttested) {
      return NextResponse.json({ error: "You must confirm that you are at least 18 years old." }, { status: 400 });
    }

    const pricingSessions = validatePricingSessions(profile.pricingSessions);
    const adminClient = createSupabaseAdminClient();

    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(session.userId);
    if (authError || !authUser.user?.email_confirmed_at) {
      return NextResponse.json({ error: "Email must be verified." }, { status: 400 });
    }

    const { data: identityVerification, error: verificationError } = await adminClient
      .from("identity_verifications")
      .select("status")
      .eq("user_id", session.userId)
      .eq("status", "verified")
      .maybeSingle();

    if (verificationError) {
      console.error("[signup/submit] verification lookup failed:", verificationError.message);
      return NextResponse.json({ error: "Unable to check identity status." }, { status: 500 });
    }

    const identityVerified = Boolean(identityVerification);
    const firstNumericRate = pricingSessions.find((item) =>
      typeof item.incall_rate === "number" || typeof item.outcall_rate === "number",
    );
    const startingPrice = firstNumericRate
      ? Math.min(
          ...[firstNumericRate.incall_rate, firstNumericRate.outcall_rate]
            .filter((value): value is number => typeof value === "number"),
        )
      : profile.startingPrice
        ? Number(profile.startingPrice)
        : null;

    const profileUpdate = {
      display_name: profile.displayName || profile.fullName || null,
      full_name: profile.fullName || profile.displayName || null,
      phone: profile.phone || null,
      bio: profile.bio || null,
      city: profile.city || null,
      neighborhood_name: profile.neighborhood?.trim() || null,
      state: profile.state || null,
      specialties: profile.serviceCategories?.length ? profile.serviceCategories : null,
      service_categories: profile.serviceCategories?.length ? profile.serviceCategories : null,
      languages: profile.languages?.length ? profile.languages : null,
      pricing_sessions: pricingSessions.length ? pricingSessions : null,
      incall_price: startingPrice,
      starting_price: startingPrice,
      years_experience: profile.yearsExperience ? Number(profile.yearsExperience) : null,
      _tier: planTier ?? null,
      subscription_tier: planTier ?? "free",
      status: identityVerified ? "approved" : "pending_approval",
      profile_status: identityVerified ? "approved" : "pending_approval",
      visibility_status: identityVerified ? "public" : "hidden",
      is_active: identityVerified,
      is_verified_identity: identityVerified,
      verification_status: identityVerified ? "verified" : "pending",
      terms_accepted_at: new Date().toISOString(),
      age_conduct_attested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await adminClient
      .from("profiles")
      .update(profileUpdate)
      .eq("user_id", session.userId);

    if (updateError) {
      console.error("[signup/submit] profile update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to save profile. You can continue from your dashboard." }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://masseurmatch.com";
    notifyAdmin({
      subject: identityVerified ? "New verified provider profile" : "Provider profile awaiting ID verification",
      heading: identityVerified ? "Verified profile created" : "Profile saved with identity pending",
      intro: `${profile.fullName || "A provider"} saved a provider profile.`,
      fields: [
        { label: "Name", value: profile.fullName || null },
        { label: "City", value: profile.city || null },
        { label: "State", value: profile.state || null },
        { label: "Plan", value: planTier || "Not selected" },
        { label: "Identity", value: identityVerified ? "Verified" : "Pending" },
        { label: "User ID", value: session.userId },
      ],
      action: { label: "View in admin", url: `${appUrl}/admin/therapists` },
    }).catch((error) => {
      console.error("[signup/submit] admin notification failed:", error);
    });

    return NextResponse.json({
      success: true,
      identityVerified,
      next: identityVerified ? "/pro/subscription?identity=verified" : "/pro/dashboard?identity=pending",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
