import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select(
        "id, user_id, display_name, full_name, bio, city, state, profile_status, visibility_status, " +
        "verification_status, subscription_tier, service_categories, " +
        "incall_price, outcall_price, avatar_url, slug, updated_at"
      )
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);

    // Photo counts
    let approvedPhotos = 0;
    let pendingPhotos = 0;
    if (profile && 'id' in profile) {
      const { data: photoCounts } = await adminClient
        .from("therapist_photos")
        .select("id, status")
        .eq("user_id", session.userId);
      if (photoCounts) {
        approvedPhotos = photoCounts.filter(
          (p: any) => p.status === "approved"
        ).length;
        pendingPhotos = photoCounts.filter(
          (p: any) => p.status === "pending_review"
        ).length;
      }
    }

    // Identity verification status
    let identityStatus = "not_started";
    const { data: identityRow } = await adminClient
      .from("identity_verifications")
      .select("status")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (identityRow?.status) {
      identityStatus = (identityRow as any).status;
    }

    // Text verification status
    let textStatus = "not_started";
    const { data: textRow } = await adminClient
      .from("text_verifications")
      .select("status")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (textRow?.status) {
      textStatus = (textRow as any).status;
    }

    return json({
      ok: true,
      profile: profile ?? null,
      stats: {
        approvedPhotos,
        pendingPhotos,
        identityStatus,
        textStatus,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
