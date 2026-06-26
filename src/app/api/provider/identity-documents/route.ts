import { errorResponse, json } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!profile) return json({ ok: true, documents: [] });

    const { data: documents } = await adminClient
      .from("profile_documents")
      .select("url, type")
      .eq("profile_id", profile.id);

    return json({ ok: true, documents: documents ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}
