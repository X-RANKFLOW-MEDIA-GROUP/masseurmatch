import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export type AdminAccount = {
  profileId: string;
  userId: string;
  email: string | null;
  role: "admin" | "provider" | null;
  displayName: string;
  city: string | null;
  slug: string | null;
  profileStatus: string;
  subscriptionTier: string | null;
  verificationStatus: string | null;
  isFeatured: boolean;
  isSuspended: boolean;
  isBanned: boolean;
};

export async function loadAccounts(): Promise<{ items: AdminAccount[]; error: string | null }> {
  try {
    const admin = createSupabaseAdminClient();
    const [{ data: profiles, error: profileError }, { data: roles, error: roleError }] = await Promise.all([
      admin
        .from("profiles")
        .select("id, user_id, email, email_address, display_name, full_name, city, slug, profile_status, subscription_tier, verification_status, is_featured, is_suspended, is_banned, updated_at")
        .not("user_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(200),
      admin.from("user_roles").select("user_id, role, created_at").order("created_at", { ascending: false }),
    ]);

    if (profileError) throw new Error(profileError.message);
    if (roleError) throw new Error(roleError.message);

    const roleMap = new Map<string, "admin" | "provider" | null>();
    for (const row of roles ?? []) {
      if (!roleMap.has(row.user_id)) {
        roleMap.set(row.user_id, row.role as "admin" | "provider" | null);
      }
    }

    const authEmailMap = new Map<string, string | null>();
    let page = 1;
    while (page > 0) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
      if (error) break;
      for (const user of data.users ?? []) authEmailMap.set(user.id, user.email ?? null);
      page = data.nextPage || 0;
    }

    const items: AdminAccount[] = (profiles ?? []).map((profile) => ({
      profileId: profile.id,
      userId: profile.user_id as string,
      email: authEmailMap.get(profile.user_id as string) || profile.email_address || profile.email || null,
      role: roleMap.get(profile.user_id as string) || "provider",
      displayName: profile.display_name || profile.full_name || "Unknown account",
      city: profile.city,
      slug: profile.slug,
      profileStatus: profile.profile_status || "draft",
      subscriptionTier: profile.subscription_tier,
      verificationStatus: profile.verification_status,
      isFeatured: Boolean(profile.is_featured),
      isSuspended: Boolean(profile.is_suspended),
      isBanned: Boolean(profile.is_banned),
    }));

    return { items, error: null };
  } catch (error) {
    return { items: [], error: error instanceof Error ? error.message : "Unknown error." };
  }
}
