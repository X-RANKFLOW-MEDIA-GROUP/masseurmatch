import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { resolveCityStateFromZip } from "@/app/api/_lib/zip-location";

export async function POST(request: NextRequest) {
  try {
    const session = await getRequestSession(request as unknown as Request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: "Missing profile data." }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    const location = await resolveCityStateFromZip(profile);

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        bio: profile.bio || null,
        city: location.city,
        state: location.state,
        zip_code: location.zip,
        specialties: profile.serviceCategories?.length ? profile.serviceCategories : null,
        incall_price: profile.startingPrice ? Number(profile.startingPrice) : null,
        lgbtq_affirming: true,
        status: "pending_approval",
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.userId);

    if (updateError) {
      console.error("[signup/resubmit] profile update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
