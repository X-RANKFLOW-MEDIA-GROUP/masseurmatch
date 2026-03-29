import { US_CITIES } from "@/data/cities";
import { supabase } from "@/integrations/supabase/client";
import {
  getFallbackPublicTherapistBySlug,
  getFallbackPublicTherapists,
} from "@/app/_lib/directory-fallback";
import { matchBodyTypeKeyword } from "@/lib/physical-profile";

export type TherapistTier = "free" | "standard" | "pro" | "elite";

const PUBLIC_PROFILE_SELECT =
  "id, slug, city, display_name, full_name, bio, avatar_url, phone, specialties, _tier, modality, status, profile_views, review_count, incall_price, outcall_price, business_hours, custom_faq, pricing_sessions, available_now, available_now_expires, is_verified_identity, is_verified_profile, is_verified_photos, neighborhood_name, primary_area, years_experience, start_year, add_ons, promotions, travel_schedule, areas_served, training, outcall_radius_miles, contact_clicks, education, lgbtq_affirming, accepts_all_genders, languages_spoken, accessibility_features, height_inches, weight_lb, body_type";

export interface ProfileFaqItem {
  question: string;
  answer: string;
}

export interface ProfileAddOn {
  name: string;
  price: number;
}

export interface ProfilePromotion {
  title: string;
  description: string;
}

export interface ProfileTravelEntry {
  city: string;
  state?: string;
  start_date: string;
  end_date: string;
}

export interface ProfileTrainingEntry {
  label: string;
  detail?: string;
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
  /** Fine-grained neighborhood name from the profile (e.g. "Oak Lawn"). */
  neighborhood_name: string | null;
  /** Broader area tag (e.g. "Uptown"), used as fallback when neighborhood_name is absent. */
  primary_area: string | null;
  /** Self-reported years of professional experience. */
  years_experience: number | null;
  /** Year the therapist started practice — used to derive experience when years_experience is absent. */
  start_year: number | null;
  latitude?: number | null;
  longitude?: number | null;
  zip_code?: string | null;
  special_offer_text?: string | null;
  add_ons?: ProfileAddOn[] | null;
  promotions?: ProfilePromotion[] | null;
  travel_schedule?: ProfileTravelEntry[] | null;
  areas_served?: string[] | null;
  training?: ProfileTrainingEntry[] | null;
  outcall_radius_miles?: number | null;
  contact_clicks?: number | null;
  education?: string | null;
  lgbtq_affirming?: boolean | null;
  accepts_all_genders?: boolean | null;
  languages_spoken?: string[] | null;
  accessibility_features?: string[] | null;
  height_inches?: number | null;
  weight_lb?: number | null;
  body_type?: string | null;
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
  availableToday?: boolean;
  tier?: TherapistTier;
  lgbtqAffirming?: boolean;
  language?: string;
  page?: number;
  pageSize?: number;
}) => {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.max(1, Math.min(500, filters?.pageSize ?? 12));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const fallbackResult = getFallbackPublicTherapists({
    city: filters?.city,
    modality: filters?.modality,
    keyword: filters?.keyword,
    session: filters?.session,
    verified: filters?.verified,
    availableToday: filters?.availableToday,
    tier: filters?.tier,
    page,
    pageSize,
  });

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
    const bodyTypeKeyword = matchBodyTypeKeyword(filters.keyword);
    const conditions = [
      `modality.ilike.${keyword}`,
      `bio.ilike.${keyword}`,
      `display_name.ilike.${keyword}`,
      `full_name.ilike.${keyword}`,
      `body_type.ilike.${keyword}`,
      ...(bodyTypeKeyword ? [`body_type.eq.${bodyTypeKeyword}`] : []),
    ];

    query = query.or(conditions.join(","));
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

  if (filters?.availableToday) {
    query = query.eq("available_now", true).gt("available_now_expires", new Date().toISOString());
  }

  if (filters?.tier) {
    query = query.eq("_tier", filters.tier);
  }

  if (filters?.lgbtqAffirming) {
    query = query.eq("lgbtq_affirming", true);
  }

  if (filters?.language) {
    query = query.contains("languages_spoken", [filters.language]);
  }

  const { data, error, count } = await query;

  if (error) {
    return fallbackResult;
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
      if ((relaxedResult.count || 0) === 0) {
        return fallbackResult;
      }

      return {
        items: ((relaxedResult.data || []) as unknown) as PublicTherapist[],
        total: relaxedResult.count || 0,
        page,
        pageSize,
      };
    }

    return fallbackResult;
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
    return getFallbackPublicTherapistBySlug(slug);
  }

  if (idResult.data) {
    return (idResult.data as unknown) as PublicTherapist;
  }

  return getFallbackPublicTherapistBySlug(slug);
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
  const fallbackCount = getFallbackPublicTherapists({ city: cityName, pageSize: 500 }).total;
  const { count, error } = await (supabase as any)
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .or("is_active.eq.true,is_active.is.null")
    .in("status", ["active", "approved"])
    .ilike("city", cityName);

  if (error) {
    return fallbackCount;
  }

  return count && count > 0 ? count : fallbackCount;
}

/**
 * Returns a lowercase-city-name → listing-count map for all active profiles.
 * Used by sitemap builders to filter empty cities.
 */
export async function getCityInventoryMap(): Promise<Map<string, number>> {
  const map = new Map<string, number>();

  for (const city of getCities()) {
    const fallbackCount = getFallbackPublicTherapists({ city: city.name, pageSize: 500 }).total;
    if (fallbackCount > 0) {
      map.set(city.name.toLowerCase().trim(), fallbackCount);
    }
  }

  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("city")
    .or("is_active.eq.true,is_active.is.null")
    .in("status", ["active", "approved"])
    .not("city", "is", null);

  if (error) {
    return map;
  }

  for (const row of data ?? []) {
    const key = (row.city as string).toLowerCase().trim();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}
