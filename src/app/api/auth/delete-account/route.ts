import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function DELETE(request: Request) {
  try {
    const session = requireRequestSession(request);

    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(session.userId);

    if (error) {
      throw new RouteError(500, error.message);
    }

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
