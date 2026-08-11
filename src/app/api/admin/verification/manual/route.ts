export const dynamic = "force-dynamic";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const admin = createSupabaseAdminClient();

    const { data: rows, error } = await admin
      .from("identity_verifications")
      .select("id,user_id,profile_id,status,verification_method,last_error,metadata,created_at,updated_at")
      .eq("verification_method", "manual")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new RouteError(500, error.message);

    const userIds = Array.from(new Set((rows ?? []).map((row) => row.user_id).filter((id): id is string => Boolean(id))));
    const profiles = new Map<string, { name: string | null; email: string | null }>();

    if (userIds.length > 0) {
      const { data: profileRows } = await admin
        .from("profiles")
        .select("user_id,display_name,full_name,email_address,email")
        .in("user_id", userIds);

      for (const profile of profileRows ?? []) {
        if (!profile.user_id) continue;
        profiles.set(profile.user_id, {
          name: profile.display_name || profile.full_name || null,
          email: profile.email_address || profile.email || null,
        });
      }
    }

    return json({
      ok: true,
      verifications: (rows ?? []).map((row) => ({
        ...row,
        user_name: row.user_id ? profiles.get(row.user_id)?.name ?? null : null,
        user_email: row.user_id ? profiles.get(row.user_id)?.email ?? null : null,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
