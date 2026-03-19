import { US_CITIES } from "@/data/cities";
import { supabase } from "@/integrations/supabase/client";

export type TherapistTier = "free" | "standard" | "pro" | "elite";

const PUBLIC_PROFILE_SELECT =
  "id, slug, city, display_name, full_name, bio, avatar_url, phone, specialties, _tier, modality, status, profile_views, review_count, incall_price, outcall_price, business_hours, custom_faq, pricing_sessions, available_now, available_now_expires, is_verified_identity, is_verified_profile, is_verified_photos";

export interface ProfileFaqItem {
  question: string;
  answer: string;
}

export interface PricingSessionItem {
  name?: string;
  duration?: number;
  incall?: number;
  outcall?: number;
}

export interface ProfilePhoto {
  id: string;
  storage_path: string;
  is_primary: boolean | null;
}

export interface PublicTherapist {
  id: string;
  slug: string | null;
  city: string | null;
  display_name: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  specialties: string[] | null;
  _tier: TherapistTier | null;
  modality: string | null;
  status: string | null;
  profile_views: number | null;
  review_count: number | null;
  incall_price: number | null;
  outcall_price: number | null;
  business_hours: Record<string, unknown> | null;
  custom_faq: ProfileFaqItem[] | null;
  pricing_sessions: PricingSessionItem[] | null;
  available_now: boolean | null;
  available_now_expires: string | null;
  is_verified_identity: boolean | null;
  is_verified_profile: boolean | null;
  is_verified_photos: boolean | null;
}

export interface ImportedReview {
  id: string;
  review_text: string;
  rating: number | null;
  reviewer_name: string | null;
  review_date: string | null;
}

export const getCities = () => US_CITIES;

const buildPublicTherapistsQuery = () =>
  (supabase as any)
    .from("profiles")
    .select(PUBLIC_PROFILE_SELECT, {
      count: "exact",
    })
    .or("is_active.eq.true,is_active.is.null")
    .in("status", ["active", "approved"]);

export const getPublicTherapists = async (filters?: {
  city?: string;
  modality?: string;
  keyword?: string;
  session?: "home-visit" | "incall";
  verified?: boolean;
  tier?: TherapistTier;
  page?: number;
  pageSize?: number;
}) => {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.max(1, Math.min(500, filters?.pageSize ?? 12));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query: any = buildPublicTherapistsQuery()
    .range(from, to);

  if (filters?.city) {
    query = query.ilike("city", filters.city);
  }

  if (filters?.modality) {
    query = query.ilike("modality", `%${filters.modality}%`);
  }

  if (filters?.keyword) {
    const keyword = `%${filters.keyword}%`;
    query = query.or(`modality.ilike.${keyword},bio.ilike.${keyword},display_name.ilike.${keyword},full_name.ilike.${keyword}`);
  }

  if (filters?.session === "home-visit") {
    query = query.not("outcall_price", "is", null);
  }

  if (filters?.session === "incall") {
    query = query.not("incall_price", "is", null);
  }

  if (filters?.verified) {
    query = query.or("_tier.eq.standard,_tier.eq.pro,_tier.eq.elite,is_verified_profile.eq.true,is_verified_identity.eq.true");
  }

  if (filters?.tier) {
    query = query.eq("_tier", filters.tier);
  }

  const { data, error, count } = await query;

  if (error) {
    return { items: [] as PublicTherapist[], total: 0, page, pageSize };
  }

  if ((count || 0) === 0) {
    // Legacy fallback: some older imports may have null/variant status values.
    let relaxedQuery: any = (supabase as any)
      .from("profiles")
      .select(PUBLIC_PROFILE_SELECT, { count: "exact" })
      .or("is_active.eq.true,is_active.is.null")
      .range(from, to);

    if (filters?.city) {
      relaxedQuery = relaxedQuery.ilike("city", filters.city);
    }

    if (filters?.modality) {
      relaxedQuery = relaxedQuery.ilike("modality", `%${filters.modality}%`);
    }

    if (filters?.tier) {
      relaxedQuery = relaxedQuery.eq("_tier", filters.tier);
    }

    const relaxedResult = await relaxedQuery;

    if (!relaxedResult.error) {
      return {
        items: ((relaxedResult.data || []) as unknown) as PublicTherapist[],
        total: relaxedResult.count || 0,
        page,
        pageSize,
      };
    }
  }

  return {
    items: ((data || []) as unknown) as PublicTherapist[],
    total: count || 0,
    page,
    pageSize,
  };
};

export const getPublicTherapistBySlug = async (slug: string) => {
  const slugQuery = buildPublicTherapistsQuery()
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  const slugResult = await slugQuery;

  if (slugResult.data) {
    return (slugResult.data as unknown) as PublicTherapist;
  }

  const idResult = await buildPublicTherapistsQuery()
    .eq("id", slug)
    .limit(1)
    .maybeSingle();

  if (idResult.error) {
    return null;
  }

  return idResult.data ? ((idResult.data as unknown) as PublicTherapist) : null;
};

export const getImportedReviews = async (profileId: string, limit = 5) => {
  const { data, error } = await (supabase as any)
    .from("imported_reviews")
    .select("id, review_text, rating, reviewer_name, review_date")
    .eq("profile_id", profileId)
    .order("review_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    return [] as ImportedReview[];
  }

  return ((data || []) as unknown) as ImportedReview[];
};

export const getProfilePhotos = async (profileId: string, limit = 6) => {
  const { data, error } = await (supabase as any)
    .from("profile_photos")
    .select("id, storage_path, is_primary")
    .eq("profile_id", profileId)
    .order("is_primary", { ascending: false })
    .limit(limit);

  if (error) {
    return [] as ProfilePhoto[];
  }

  return (((data || []) as unknown) as ProfilePhoto[]).filter(
    (photo) => typeof photo.storage_path === "string" && photo.storage_path.startsWith("http"),
  );
};

/** Returns the number of active public profiles in a given city. */
export async function getCityInventoryCount(cityName: string): Promise<number> {
  const { count } = await (supabase as any)
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .or("is_active.eq.true,is_active.is.null")
    .in("status", ["active", "approved"])
    .ilike("city", cityName);
  return count ?? 0;
}

/**
 * Returns a lowercase-city-name → listing-count map for all active profiles.
 * Used by sitemap builders to filter empty cities.
 */
export async function getCityInventoryMap(): Promise<Map<string, number>> {
  const { data } = await (supabase as any)
    .from("profiles")
    .select("city")
    .or("is_active.eq.true,is_active.is.null")
    .in("status", ["active", "approved"])
    .not("city", "is", null);

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const key = (row.city as string).toLowerCase().trim();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}
