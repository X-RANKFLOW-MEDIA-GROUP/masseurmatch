import { errorResponse, json } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import { normalizeIdentityStatus } from "@/app/_lib/identity-verification";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("identity_verifications")
      .select("id, status, provider, last_error, created_at, updated_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return json({
      ok: true,
      status: normalizeIdentityStatus(data?.status),
      provider: data?.provider ?? (data ? "stripe" : "manual"),
      verificationId: data?.id ?? null,
      lastError: data?.last_error ?? null,
      createdAt: data?.created_at ?? null,
      updatedAt: data?.updated_at ?? null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
