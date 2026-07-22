export const dynamic = "force-dynamic";
import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";

const adminUserActionSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "provider"]),
});

async function updateUserRole(
  adminUserId: string,
  input: z.infer<typeof adminUserActionSchema>,
) {
  const adminClient = createSupabaseAdminClient();

  const { error: deleteError } = await adminClient.from("user_roles").delete().eq("user_id", input.userId);
  if (deleteError) {
    throw new RouteError(500, deleteError.message);
  }

  const { data, error } = await adminClient
    .from("user_roles")
    .insert({
      user_id: input.userId,
      role: input.role,
    })
    .select("user_id, role")
    .single();

  if (error) {
    throw new RouteError(500, error.message);
  }

  // Mirror the change into app_metadata — the source the middleware and route
  // handlers read for authorization. Without this the new role wouldn't take
  // effect until the user's next login.
  try {
    await adminClient.auth.admin.updateUserById(input.userId, {
      app_metadata: { role: input.role },
    });
  } catch {
    // Best-effort; user_roles remains the source of truth for the API layer.
  }

  await recordAuditLog(adminUserId, "update_user_role", "user", input.userId, {
    role: input.role,
  });

  return data;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-user-role", { limit: 20, windowMs: 60_000 });
    const body = await parseJsonBody(request, adminUserActionSchema);
    const result = await updateUserRole(admin.userId, body);

    return json({
      ok: true,
      role: result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
