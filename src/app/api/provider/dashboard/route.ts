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

    let approvedPhotos = 0;
    let pendingPhotos = 0;
    if (profile?.id) {
      const { data: photoCounts, error: photoError } = await adminClient
        .from("profile_photos")
        .select("id, moderation_status")
        .eq("profile_id", profile.id);

      if (photoError) throw new RouteError(500, photoError.message);
      if (photoCounts) {
        approvedPhotos = photoCounts.filter((photo) => photo.moderation_status === "approved").length;
        pendingPhotos = photoCounts.filter(
          (photo) => !photo.moderation_status || photo.moderation_status === "pending"
        ).length;
      }
    }

    let identityStatus = "not_started";
    const { data: identityRow } = await adminClient
      .from("identity_verifications")
      .select("status")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (identityRow?.status) {
      identityStatus = identityRow.status;
    }

    let textStatus = "not_started";
    const { data: textRow } = await adminClient
      .from("text_verifications")
      .select("status")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (textRow?.status) {
      textStatus = textRow.status;
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
