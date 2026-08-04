import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export type AdminPersonPhoto = {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  moderationStatus: string;
  moderationReason: string | null;
};

export type AdminPerson = {
  userId: string;
  profileId: string;
  name: string;
  email: string | null;
  city: string | null;
  role: "admin" | "provider" | null;
  profileStatus: string;
  subscriptionTier: string | null;
  verificationStatus: string | null;
  slug: string | null;
  isFeatured: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  photos: AdminPersonPhoto[];
};

function normalizeRole(role: string | null): AdminPerson["role"] {
  return role === "admin" || role === "provider" ? role : null;
}

export async function loadPeople(): Promise<{ items: AdminPerson[]; error: string | null }> {
  try {
    const supabase = createSupabaseAdminClient();
    const [{ data: profiles, error: profileError }, { data: roles, error: roleError }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,user_id,display_name,full_name,email_address,city,slug,profile_status,subscription_tier,verification_status,is_featured,is_suspended,is_banned,updated_at")
        .order("updated_at", { ascending: false })
        .limit(200),
      supabase.from("user_roles").select("user_id,role,created_at").order("created_at", { ascending: false }),
    ]);

    if (profileError) throw new Error(profileError.message);
    if (roleError) throw new Error(roleError.message);

    const profileRows = profiles ?? [];
    const profileIds = profileRows.map((profile) => profile.id).filter((id): id is string => Boolean(id));
    const userIds = profileRows.map((profile) => profile.user_id).filter((id): id is string => Boolean(id));

    const [{ data: photos, error: photoError }, authUsers] = await Promise.all([
      profileIds.length
        ? supabase
            .from("profile_photos")
            .select("id,profile_id,storage_path,url,is_primary,sort_order,moderation_status,moderation_reason,created_at")
            .in("profile_id", profileIds)
            .order("sort_order", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      Promise.all(
        userIds.map(async (userId) => {
          const { data } = await supabase.auth.admin.getUserById(userId);
          return [userId, data.user?.email ?? null] as const;
        }),
      ),
    ]);

    if (photoError) throw new Error(photoError.message);

    const roleMap = new Map<string, AdminPerson["role"]>();
    for (const role of roles ?? []) {
      if (role.user_id && !roleMap.has(role.user_id)) {
        roleMap.set(role.user_id, normalizeRole(role.role));
      }
    }

    const emailMap = new Map<string, string | null>(authUsers);
    const photosByProfile = new Map<string, AdminPersonPhoto[]>();
    for (const photo of photos ?? []) {
      if (!photo.profile_id || !photo.id) continue;
      const resolvedUrl = photo.url || photo.storage_path || "";
      if (!resolvedUrl) continue;
      const list = photosByProfile.get(photo.profile_id) ?? [];
      list.push({
        id: photo.id,
        url: resolvedUrl,
        isPrimary: Boolean(photo.is_primary),
        sortOrder: photo.sort_order ?? 0,
        moderationStatus: photo.moderation_status || "pending",
        moderationReason: photo.moderation_reason,
      });
      photosByProfile.set(photo.profile_id, list);
    }

    return {
      items: profileRows
        .filter((profile): profile is typeof profile & { id: string } => Boolean(profile.id))
        .map((profile) => {
          const userId = profile.user_id || profile.id;
          return {
            userId,
            profileId: profile.id,
            name: profile.display_name || profile.full_name || "Unknown user",
            email: emailMap.get(userId) || profile.email_address || null,
            city: profile.city,
            role: roleMap.get(userId) || null,
            profileStatus: profile.profile_status || "draft",
            subscriptionTier: profile.subscription_tier,
            verificationStatus: profile.verification_status,
            slug: profile.slug,
            isFeatured: Boolean(profile.is_featured),
            isSuspended: Boolean(profile.is_suspended),
            isBanned: Boolean(profile.is_banned),
            photos: photosByProfile.get(profile.id) ?? [],
          } satisfies AdminPerson;
        }),
      error: null,
    };
  } catch (error) {
    return { items: [], error: error instanceof Error ? error.message : "Unknown error." };
  }
}
