import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
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
  const adminClient = createSupabaseAdminClient() as any;

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

  await recordAuditLog(adminUserId, "update_user_role", "user", input.userId, {
    role: input.role,
  });

  return data;
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const { loadUsers } = await import("@/app/admin/_lib/loaders");
    const result = await loadUsers();
    return json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
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
