export const dynamic = "force-dynamic";

import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";

const schema = z.object({
  userId: z.string().uuid(),
  profileId: z.string().uuid(),
  action: z.enum(["deactivate", "reactivate", "delete"]),
  confirmation: z.string().optional(),
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-people-account-action", { limit: 20, windowMs: 60_000 });
    const body = await parseJsonBody(request, schema);

    if (body.userId === admin.userId) {
      throw new RouteError(400, "You cannot deactivate or delete your own admin account.");
    }

    const supabase = createSupabaseAdminClient();
    const { data: targetProfile, error: targetError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("id", body.profileId)
      .eq("user_id", body.userId)
      .maybeSingle();

    if (targetError) throw new RouteError(500, targetError.message);
    if (!targetProfile) throw new RouteError(404, "The selected account and profile no longer match.");

    if (body.action === "deactivate") {
      const { error: authError } = await supabase.auth.admin.updateUserById(body.userId, {
        ban_duration: "876000h",
      });
      if (authError) throw new RouteError(500, authError.message);

      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({ is_active: false, is_suspended: true })
        .eq("id", body.profileId)
        .eq("user_id", body.userId)
        .select("id")
        .maybeSingle();

      if (profileError || !updatedProfile) {
        await supabase.auth.admin.updateUserById(body.userId, { ban_duration: "0s" });
        throw new RouteError(500, profileError?.message || "The profile could not be deactivated.");
      }

      await recordAuditLog(admin.userId, "deactivate_account", "user", body.userId, {
        profile_id: body.profileId,
        reason: body.reason || null,
      });
      return json({ ok: true });
    }

    if (body.action === "reactivate") {
      const { error: authError } = await supabase.auth.admin.updateUserById(body.userId, {
        ban_duration: "0s",
      });
      if (authError) throw new RouteError(500, authError.message);

      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({ is_active: true, is_suspended: false, is_banned: false })
        .eq("id", body.profileId)
        .eq("user_id", body.userId)
        .select("id")
        .maybeSingle();

      if (profileError || !updatedProfile) {
        await supabase.auth.admin.updateUserById(body.userId, { ban_duration: "876000h" });
        throw new RouteError(500, profileError?.message || "The profile could not be reactivated.");
      }

      await recordAuditLog(admin.userId, "reactivate_account", "user", body.userId, {
        profile_id: body.profileId,
      });
      return json({ ok: true });
    }

    if (body.confirmation !== "DELETE") {
      throw new RouteError(400, "Type DELETE to permanently remove this account.");
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(body.userId);
    if (authError) throw new RouteError(500, authError.message);

    await recordAuditLog(admin.userId, "delete_account", "user", body.userId, {
      profile_id: body.profileId,
      reason: body.reason || null,
    });

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
