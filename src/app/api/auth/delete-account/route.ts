import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/_lib/session";
import {
  createSupabaseAdminClient,
  createSupabasePublicClient,
} from "@/app/api/_lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase/server";
import { assertRateLimit } from "@/app/_lib/security";
import { z } from "zod";

const deleteSchema = z.object({ password: z.string().min(1, "Password is required.") });

export async function DELETE(request: Request) {
  try {
    assertRateLimit(request, "auth-delete-account", { limit: 5, windowMs: 60_000 });

    const session = await requireRequestSession(request);
    const { password } = await parseJsonBody(request, deleteSchema);

    if (!session.email) {
      throw new RouteError(400, "Account cannot be deleted without a verified email.");
    }

    // Re-authenticate before an irreversible action: confirm the caller knows
    // the current password, not just that they hold a live cookie.
    const publicClient = createSupabasePublicClient();
    const { error: reauthError } = await publicClient.auth.signInWithPassword({
      email: session.email,
      password,
    });
    if (reauthError) {
      throw new RouteError(401, "Password is incorrect.", "REAUTH_FAILED");
    }

    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(session.userId);
    if (error) {
      throw new RouteError(500, error.message);
    }

    // Clear the auth cookies for this browser too.
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
