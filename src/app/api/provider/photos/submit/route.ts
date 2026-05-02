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

    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!profile) throw new RouteError(404, "Profile not found.");

    // Only allow submitting own photos
    const { data: ownPhotos, error: fetchError } = await adminClient
      .from("therapist_photos")
      .select("id")
      .eq("user_id", session.userId)
      .in("id", body.photoIds);

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!ownPhotos?.length) throw new RouteError(404, "No matching photos found.");

    const ownIds = ownPhotos.map((p) => p.id);
    const { error: updateError } = await adminClient
      .from("therapist_photos")
      .update({ status: "pending_review" })
      .eq("user_id", session.userId)
      .in("id", ownIds);

    if (updateError) throw new RouteError(500, updateError.message);

    return json({ ok: true, pending_approval: ownIds.length });
  } catch (error) {
    return errorResponse(error);
  }
}
