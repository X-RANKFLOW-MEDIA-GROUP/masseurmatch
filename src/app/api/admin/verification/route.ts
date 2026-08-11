export const dynamic = "force-dynamic";
import { errorResponse, json } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

type VerificationUser = {
  user_id: string;
  name: string | null;
  email: string | null;
};

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: identityRows, error: idError } = await adminClient
      .from("identity_verifications")
      .select("id, user_id, provider, status, last_error, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (idError) console.warn("[admin/verification] identity_verifications query failed:", idError.message);

    const { data: textRows, error: textError } = await adminClient
      .from("text_verifications")
      .select("id, user_id, phone, status, attempt_count, verified_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (textError) console.warn("[admin/verification] text_verifications query failed:", textError.message);

    const userIds = Array.from(
      new Set(
        [...(identityRows ?? []), ...(textRows ?? [])]
          .map((row) => row.user_id)
          .filter((userId): userId is string => typeof userId === "string" && userId.length > 0),
      ),
    );

    const userMap = new Map<string, VerificationUser>();

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await adminClient
        .from("profiles")
        .select("user_id, display_name, full_name, email_address, email")
        .in("user_id", userIds);

      if (profilesError) console.warn("[admin/verification] profiles enrichment failed:", profilesError.message);

      for (const profile of profiles ?? []) {
        const userId = profile.user_id;
        if (!userId) continue;
        userMap.set(userId, {
          user_id: userId,
          name: profile.display_name || profile.full_name || null,
          email: profile.email_address || profile.email || null,
        });
      }

      await Promise.all(
        userIds.map(async (userId) => {
          const existing = userMap.get(userId);
          if (existing?.email && existing?.name) return;
          const { data, error } = await adminClient.auth.admin.getUserById(userId);
          if (error || !data.user) return;
          const metadata = data.user.user_metadata ?? {};
          const metadataName =
            (typeof metadata.display_name === "string" && metadata.display_name) ||
            (typeof metadata.full_name === "string" && metadata.full_name) ||
            (typeof metadata.name === "string" && metadata.name) ||
            null;
          userMap.set(userId, {
            user_id: userId,
            name: existing?.name || metadataName,
            email: existing?.email || data.user.email || null,
          });
        }),
      );
    }

    const enrich = <T extends { user_id: string | null }>(row: T) => {
      const user = row.user_id ? userMap.get(row.user_id) : undefined;
      return { ...row, user_name: user?.name ?? null, user_email: user?.email ?? null };
    };

    return json({
      ok: true,
      identity: (identityRows ?? []).map(enrich),
      text: (textRows ?? []).map(enrich),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
