export const dynamic = "force-dynamic";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: identityRows, error: idError } = await adminClient
      .from("identity_verifications")
      .select("id, user_id, status, stripe_session_id, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (idError) throw new RouteError(500, idError.message);

    const { data: textRows, error: textError } = await adminClient
      .from("text_verifications")
      .select("id, user_id, phone, status, attempt_count, verified_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (textError) throw new RouteError(500, textError.message);

    return json({
      ok: true,
      identity: identityRows ?? [],
      text: textRows ?? [],
    });
  } catch (error) {
    return errorResponse(error);
  }
}
