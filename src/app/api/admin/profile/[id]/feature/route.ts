export const dynamic = "force-dynamic";
import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";
import { revalidatePublicDirectory } from "@/app/_lib/directory-cache";

const schema = z.object({
  reason: z.string().optional(),
  days: z.coerce.number().int().positive().max(365).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminSession(request);
    const { id: profileId } = await params;
    const body = await parseJsonBody(request, schema);
    const adminClient = createSupabaseAdminClient();

    const { data: profile, error: fetchError } = await adminClient
      .from("profiles")
      .select("id, user_id, city, is_featured")
      .eq("id", profileId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const now = new Date();
    const isFeaturing = !profile.is_featured;

    const profileUpdate = isFeaturing
      ? {
          is_featured: true,
          featured_until: new Date(now.getTime() + (body.days ?? 30) * 24 * 60 * 60 * 1000).toISOString(),
          visibility_status: "public" as const,
          updated_at: now.toISOString(),
        }
      : {
          is_featured: false,
          featured_until: null as string | null,
          updated_at: now.toISOString(),
        };

    const { error: profileUpdateError } = await adminClient
      .from("profiles")
      .update(profileUpdate)
      .eq("id", profileId);

    if (profileUpdateError) throw new RouteError(500, profileUpdateError.message);

    revalidatePublicDirectory();

    // Sync featured_masters — non-critical; errors here are logged but never block the toggle.
    try {
      if (isFeaturing) {
        const { error: featureError } = await adminClient
          .from("featured_masters")
          .upsert(
            {
              profile_id: profileId,
              featured_by: admin.userId,
              city: profile.city ?? null,
              is_active: true,
            },
            { onConflict: "profile_id" },
          );

        if (featureError) {
          console.error("[feature] featured_masters upsert failed:", featureError.message);
        }
      } else {
        const { error: unfeatureError } = await adminClient
          .from("featured_masters")
          .update({ is_active: false })
          .eq("profile_id", profileId);

        if (unfeatureError) {
          console.error("[feature] featured_masters update failed:", unfeatureError.message);
        }
      }
    } catch (syncErr) {
      console.error("[feature] featured_masters sync threw:", syncErr);
    }

    // Audit logging — always non-blocking.
    Promise.allSettled([
      adminClient.from("admin_actions").insert({
        action: isFeaturing ? "feature_profile" : "unfeature_profile",
        action_type: isFeaturing ? "feature_profile" : "unfeature_profile",
        target_table: "profiles",
        admin_id: admin.userId,
        target_user_id: profile.user_id,
        target_profile_id: profileId,
        reason: body.reason ?? null,
      }),
      recordAuditLog(
        admin.userId,
        isFeaturing ? "feature_profile" : "unfeature_profile",
        "profile",
        profileId,
        { reason: body.reason ?? null, days: body.days ?? null },
      ),
    ]).catch(() => { /* best-effort */ });

    return json({ ok: true, profileId, featured: isFeaturing });
  } catch (error) {
    return errorResponse(error);
  }
}
