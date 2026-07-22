import { NextRequest, NextResponse } from "next/server";

import { notifyAdmin } from "@/app/api/_lib/admin-notify";
import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { isRateWithinLimit } from "@/lib/provider-product-rules";

type PricingSessionInput = {
  id?: string;
  minutes?: number;
  incall_rate?: number | null;
  outcall_rate?: number | null;
  incall_ask_me?: boolean;
  outcall_ask_me?: boolean;
  technique?: string | null;
  mode?: "simple" | "technique" | "ask_me" | string | null;
};

type NormalizedPricingSession = {
  id: string;
  minutes: number;
  incall_rate: number | null;
  outcall_rate: number | null;
  incall_ask_me: boolean;
  outcall_ask_me: boolean;
  technique: string | null;
  mode: "simple" | "technique" | "ask_me";
};

function validatePricingSessions(value: unknown): NormalizedPricingSession[] {
  if (!Array.isArray(value) || value.length === 0) return [];

  const sessions = value.filter((item): item is PricingSessionInput => typeof item === "object" && item !== null);
  return sessions.map((session, index) => {
    const mode = session.mode === "technique" || session.mode === "ask_me" ? session.mode : "simple";
    const minutes = Number(session.minutes);
    if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 600) {
      throw new Error(`Rate row ${index + 1} must include a valid session duration.`);
    }

    if (mode === "ask_me") {
      return {
        id: session.id || `rate-${index + 1}`,
        minutes,
        incall_rate: null,
        outcall_rate: null,
        incall_ask_me: true,
        outcall_ask_me: true,
        technique: null,
        mode,
      };
    }

    const incallAskMe = session.incall_ask_me === true;
    const outcallAskMe = session.outcall_ask_me === true;
    const incallRate = typeof session.incall_rate === "number" ? session.incall_rate : null;
    const outcallRate = typeof session.outcall_rate === "number" ? session.outcall_rate : null;

    if (mode === "technique" && !session.technique?.trim()) {
      throw new Error(`Rate row ${index + 1} must include a massage technique.`);
    }
    if (!incallAskMe && incallRate === null) {
      throw new Error(`Enter an Incall rate or select Ask Me for row ${index + 1}.`);
    }
    if (!outcallAskMe && outcallRate === null) {
      throw new Error(`Enter an Outcall rate or select Ask Me for row ${index + 1}.`);
    }
    if (!incallAskMe && !isRateWithinLimit(minutes, incallRate)) {
      throw new Error("An Incall rate exceeds MasseurMatch's maximum of US$3.33 per minute. Lower it or select Ask Me.");
    }
    if (!outcallAskMe && !isRateWithinLimit(minutes, outcallRate)) {
      throw new Error("An Outcall rate exceeds MasseurMatch's maximum of US$3.33 per minute. Lower it or select Ask Me.");
    }

    return {
      id: session.id || `rate-${index + 1}`,
      minutes,
      incall_rate: incallAskMe ? null : incallRate,
      outcall_rate: outcallAskMe ? null : outcallRate,
      incall_ask_me: incallAskMe,
      outcall_ask_me: outcallAskMe,
      technique: mode === "technique" ? session.technique?.trim() || null : null,
      mode,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getRequestSession(request);
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json();
    const { planTier, profile, termsAccepted, complianceAcknowledged, ageAndConductAttested } = body;

    if (!profile) return NextResponse.json({ error: "Missing profile data." }, { status: 400 });
    if (!termsAccepted) return NextResponse.json({ error: "Terms must be accepted." }, { status: 400 });
    if (!complianceAcknowledged) return NextResponse.json({ error: "The Therapist Agreement must be accepted." }, { status: 400 });
    if (!ageAndConductAttested) return NextResponse.json({ error: "You must confirm that you are at least 18 years old." }, { status: 400 });

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
    const incallRates = pricingSessions.map((item) => item.incall_rate).filter((value): value is number => typeof value === "number");
    const outcallRates = pricingSessions.map((item) => item.outcall_rate).filter((value): value is number => typeof value === "number");
    const allRates = [...incallRates, ...outcallRates];

    const editableProfileUpdate = {
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
      incall_price: incallRates.length ? Math.min(...incallRates) : null,
      outcall_price: outcallRates.length ? Math.min(...outcallRates) : null,
      starting_price: allRates.length ? Math.min(...allRates) : null,
      years_experience: profile.yearsExperience ? Number(profile.yearsExperience) : null,
      terms_accepted_at: new Date().toISOString(),
      age_conduct_attested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await adminClient
      .from("profiles")
      .update(editableProfileUpdate)
      .eq("user_id", session.userId);

    if (updateError) {
      console.error("[signup/submit] profile update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to save profile. You can continue from your dashboard." }, { status: 500 });
    }

    let publicationStatus: "pending_identity" | "published" | "pending_sync" = identityVerified
      ? "pending_sync"
      : "pending_identity";

    if (identityVerified) {
      const rpcClient = adminClient as unknown as {
        rpc: (name: string, args: Record<string, unknown>) => Promise<{ error: { message?: string } | null }>;
      };
      const { error: publishError } = await rpcClient.rpc("publish_verified_identity_profile", {
        p_user_id: session.userId,
      });
      if (publishError) {
        console.error("[signup/submit] verified profile publication failed:", publishError.message);
      } else {
        publicationStatus = "published";
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://masseurmatch.com";
    notifyAdmin({
      subject: identityVerified ? "New verified provider profile" : "Provider profile awaiting ID verification",
      heading: identityVerified ? "Verified profile saved" : "Profile saved with identity pending",
      intro: `${profile.fullName || "A provider"} saved a provider profile.`,
      fields: [
        { label: "Name", value: profile.fullName || null },
        { label: "City", value: profile.city || null },
        { label: "State", value: profile.state || null },
        { label: "Requested plan", value: planTier || "Not selected" },
        { label: "Identity", value: identityVerified ? "Verified" : "Pending" },
        { label: "Publication", value: publicationStatus },
        { label: "User ID", value: session.userId },
      ],
      action: { label: "View in admin", url: `${appUrl}/admin/therapists` },
    }).catch((error) => console.error("[signup/submit] admin notification failed:", error));

    return NextResponse.json({
      success: true,
      identityVerified,
      publicationStatus,
      next: identityVerified && publicationStatus === "published"
        ? "/pro/subscription?identity=verified&profile=published"
        : "/pro/dashboard?identity=pending",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
