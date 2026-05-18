import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import type { Tables } from "@/integrations/supabase/types";

type ProfileRow = Tables<"profiles">;
type ImportedReviewRow = Tables<"imported_reviews">;
type UserRoleRow = {
  user_id: string;
  role: "admin" | "provider" | null;
  created_at?: string | null;
};

export type AdminImportedReview = Pick<
  ImportedReviewRow,
  | "id"
  | "profile_id"
  | "review_text"
  | "reviewer_name"
  | "rating"
  | "review_date"
  | "source_platform"
  | "source_url"
  | "imported_at"
> & {
  profile: Pick<ProfileRow, "id" | "display_name" | "full_name" | "city"> | null;
};

export type AdminTherapist = Pick<
  ProfileRow,
  "id" | "display_name" | "full_name" | "city"
> & {
  user_id: string;
  slug: string | null;
  profile_status: string;
  subscription_tier: string | null;
  verification_status: string | null;
  is_featured: boolean;
  is_suspended: boolean;
  is_banned: boolean;
};

export type AdminUser = {
  profileId: string;
  userId: string;
  fullName: string;
  city: string | null;
  status: string;
  role: UserRoleRow["role"] | null;
  email: string | null;
};

type AdminLoadResult<T> = {
  items: T[];
  error: string | null;
};

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error.";
}

export async function loadImportedReviews(): Promise<AdminLoadResult<AdminImportedReview>> {
  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("imported_reviews")
      .select("id, profile_id, review_text, reviewer_name, rating, review_date, source_platform, source_url, imported_at")
      .order("imported_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }

    const reviewRows = (data || []) as AdminImportedReview[];
    const profileIds = [...new Set(reviewRows.map((review) => review.profile_id))];
    const profileMap = new Map<string, AdminImportedReview["profile"]>();

    if (profileIds.length > 0) {
      const { data: profiles, error: profilesError } = await adminClient
        .from("profiles")
        .select("id, display_name, full_name, city")
        .in("id", profileIds);

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      const profileRows = (profiles || []) as Array<{
        id: string;
        user_id: string;
        display_name: string | null;
        full_name: string | null;
        city: string | null;
        status: string;
      }>;

      for (const profile of profileRows) {
        profileMap.set(profile.id, profile);
      }
    }

    return {
      items: reviewRows.map((review) => ({
        ...review,
        profile: profileMap.get(review.profile_id) || null,
      })),
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      error: toErrorMessage(error),
    };
  }
}

export async function loadTherapists(): Promise<AdminLoadResult<AdminTherapist>> {
  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("profiles")
      .select("id, user_id, display_name, full_name, city, slug, profile_status, subscription_tier, verification_status, is_featured, is_suspended, is_banned, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }

    const profileRows = ((data || []) as Array<AdminTherapist & { user_id: string | null }>).map((profile) => ({
      ...profile,
      user_id: profile.user_id ?? "",
    }));

    return {
      items: profileRows,
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      error: toErrorMessage(error),
    };
  }
}

async function listAllAuthUsers() {
  const adminClient = createSupabaseAdminClient();
  const users: Array<{ id: string; email: string | null }> = [];
  let page = 1;

  try {
    while (page > 0) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage: 20,
      });

      if (error) {
        console.error("Supabase Auth users could not be loaded.", error.message);
        return users;
      }

      for (const user of data.users ?? []) {
        users.push({
          id: user.id,
          email: user.email || null,
        });
      }

      page = data.nextPage || 0;
    }
  } catch (error) {
    console.error("Supabase Auth users fallback triggered.", error);
    return users;
  }

  return users;
}

export async function loadUsers(): Promise<AdminLoadResult<AdminUser>> {
  try {
    const adminClient = createSupabaseAdminClient();
    const [{ data: profiles, error: profilesError }, { data: roles, error: rolesError }] =
      await Promise.all([
        adminClient
          .from("profiles")
          .select("id, user_id, display_name, full_name, city, status, updated_at")
          .order("updated_at", { ascending: false })
          .limit(50),
        adminClient.from("user_roles").select("user_id, role, created_at").order("created_at", { ascending: false }),
      ]);

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    if (rolesError) {
      throw new Error(rolesError.message);
    }

    const authUsers = await listAllAuthUsers();
    const roleRows = (roles || []) as UserRoleRow[];
    const roleMap = new Map<string, UserRoleRow["role"]>();
    for (const role of roleRows) {
      if (!roleMap.has(role.user_id)) {
        roleMap.set(role.user_id, role.role);
      }
    }

    const emailMap = new Map<string, string | null>();
    for (const user of authUsers) {
      emailMap.set(user.id, user.email);
    }

    return {
      items: ((profiles || []) as Array<{ id: string; user_id: string; display_name: string | null; full_name: string | null; city: string | null; status: string }>).map((profile) => ({
        profileId: profile.id,
        userId: profile.user_id,
        fullName: profile.display_name || profile.full_name || "Unknown User",
        city: profile.city,
        status: profile.status,
        role: roleMap.get(profile.user_id) || null,
        email: emailMap.get(profile.user_id) || null,
      })),
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      error: toErrorMessage(error),
    };
  }
}
