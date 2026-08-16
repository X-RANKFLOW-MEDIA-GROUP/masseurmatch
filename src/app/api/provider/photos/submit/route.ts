import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

const submitSchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = await parseJsonBody(request, submitSchema);
    const adminClient = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const { data: ownPhotos, error: fetchError } = await adminClient
      .from("profile_photos")
      .select("id, moderation_status")
      .eq("profile_id", profile.id)
      .eq("user_id", session.userId)
      .in("id", body.photoIds);

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!ownPhotos?.length) throw new RouteError(404, "No matching photos found.");

    const reviewIds = ownPhotos
      .filter((photo) => photo.moderation_status !== "approved")
      .map((photo) => photo.id);

    if (reviewIds.length > 0) {
      const { error: updateError } = await adminClient
        .from("profile_photos")
        .update({
          moderation_status: "pending",
          moderation_reason: "manual_review_requested",
        })
        .eq("profile_id", profile.id)
        .eq("user_id", session.userId)
        .in("id", reviewIds);

      if (updateError) throw new RouteError(500, updateError.message);
    }

    return json({ ok: true, submitted: reviewIds.length });
  } catch (error) {
    return errorResponse(error);
  }
}
