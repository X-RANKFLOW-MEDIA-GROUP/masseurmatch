import { US_CITIES } from "@/data/cities";
import { supabase } from "@/integrations/supabase/client";
import { matchBodyTypeKeyword } from "@/lib/physical-profile";

export type TherapistTier = "free" | "standard" | "pro" | "elite";

const PUBLIC_PROFILE_SELECT = `
  id, slug, display_name, full_name, headline, bio, city, state, neighborhood,
  phone, whatsapp_number, email_address, website,
  service_categories, massage_techniques, specialties,
  incall_price, outcall_price, starting_price,
  height_inches, weight_lb, body_type,
  years_experience, languages,
  subscription_tier, verification_status, is_featured,
  promotions, updated_at, profile_status, visibility_status,
  is_suspended, is_banned, available_now, available_now_expires
`;

export interface ProfileFaqItem {
  question: string;
  answer: string;
}

export interface ProfilePromotion {
  title: string;
  description: string;
}

export interface PublicTherapist {
  id: string;
  slug: string | null;
  city: string | null;
  display_name: string | null;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email_address: string | null;
  website: string | null;
  service_categories: string[] | null;
  massage_techniques: string[] | null;
  specialties: string[] | null;
  subscription_tier: TherapistTier | null;
  profile_status: string | null;
  visibility_status: string | null;
  incall_price: number | null;
  outcall_price: number | null;
  starting_price: number | null;
  available_now: boolean | null;
  available_now_expires: string | null;
  verification_status: string | null;
  neighborhood: string | null;
  years_experience: number | null;
  promotions?: ProfilePromotion[] | null;
  height_inches?: number | null;
  weight_lb?: number | null;
  body_type?: string | null;
  languages?: string[] | null;
  profile_photo?: string;
  gallery_photos?: string[];
  is_featured: boolean;
  updated_at: string;
  // Legacy compatibility fields
  modality?: string | null;
  start_year?: number | null;
  avatar_url?: string | null;
  review_count?: number | null;
  _tier?: string | null;
  profile_photo?: string | null;
  pricing_sessions?: any[] | null;
  neighborhood_name?: string | null;
  primary_area?: string | null;
  is_verified_identity?: boolean;
  is_verified_profile?: boolean;
  is_verified_photos?: boolean;
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
  supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_SELECT, {
      count: "exact",
    })
    .eq("visibility_status", "public")
    .eq("profile_status", "approved")
    .eq("is_suspended", false)
    .eq("is_banned", false);

export const getPublicTherapists = async (filters?: {
  city?: string;
  modality?: string;
  keyword?: string;
  session?: "home-visit" | "incall";
  verified?: boolean;
  availableToday?: boolean;
  tier?: TherapistTier;
  page?: number;
  pageSize?: number;
}) => {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.max(1, Math.min(500, filters?.pageSize ?? 12));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = buildPublicTherapistsQuery().range(from, to);

  if (filters?.city) {
    query = query.ilike("city", filters.city);
  }

  if (filters?.modality) {
    query = query.or(`modality.ilike.%${filters.modality}%,specialties.cs.{${filters.modality}},massage_techniques.cs.{${filters.modality}}`);
  }

  if (filters?.keyword) {
    const keyword = `%${filters.keyword}%`;
    const bodyTypeKeyword = matchBodyTypeKeyword(filters.keyword);
    const conditions = [
      `bio.ilike.${keyword}`,
      `display_name.ilike.${keyword}`,
      `full_name.ilike.${keyword}`,
      `headline.ilike.${keyword}`,
      `neighborhood.ilike.${keyword}`,
      ...(bodyTypeKeyword ? [`body_type.eq.${bodyTypeKeyword}`] : []),
    ];
    query = query.or(conditions.join(","));
  }

  if (filters?.verified) {
    query = query.eq("verification_status", "verified");
  }

  if (filters?.availableToday) {
    const nowIso = new Date().toISOString();
    query = query.eq("available_now", true).or(`available_now_expires.is.null,available_now_expires.gt.${nowIso}`);
  }

  if (filters?.tier) {
    query = query.eq("subscription_tier", filters.tier);
  }

  const { data: rawData, error, count } = await query;
  
  if (error) return { items: [], total: 0, page, pageSize };

  const nowMs = Date.now();
  const TIER_RANK: Record<string, number> = { elite: 4, pro: 3, standard: 2, free: 1 };
  const isActivelyAvailable = (p: any): boolean =>
    p.available_now === true &&
    (p.available_now_expires == null || new Date(p.available_now_expires).getTime() > nowMs);

  const data = rawData
    ? [...rawData].sort((a, b) => {
        const aTier = TIER_RANK[a.subscription_tier ?? "free"] ?? 0;
        const bTier = TIER_RANK[b.subscription_tier ?? "free"] ?? 0;
        if (bTier !== aTier) return bTier - aTier;
        const aAvail = isActivelyAvailable(a) ? 1 : 0;
        const bAvail = isActivelyAvailable(b) ? 1 : 0;
        if (bAvail !== aAvail) return bAvail - aAvail;
        return (a.is_featured ? 1 : 0) - (b.is_featured ? 1 : 0);
      })
    : [];

  return {
    items: data as PublicTherapist[],
    total: count || 0,
    page,
    pageSize,
  };
};

export const getPublicTherapistBySlug = async (slug: string): Promise<PublicTherapist | null> => {
  const { data: profile, error } = await buildPublicTherapistsQuery()
    .eq("slug", slug)
    .maybeSingle();

  if (error || !profile) return null;

  // Fetch photos
  const { data: photos } = await supabase
    .from("therapist_photos")
    .select("public_url, photo_type")
    .eq("profile_id", profile.id)
    .eq("status", "approved")
    .order("sort_order", { ascending: true });

  const profile_photo = photos?.find(p => p.photo_type === "profile")?.public_url;
  const gallery_photos = photos?.filter(p => p.photo_type === "gallery").map(p => p.public_url);

  return {
    ...profile,
    profile_photo,
    gallery_photos,
  } as PublicTherapist;
};

export const getImportedReviews = async (profileId: string, limit = 5) => {
  const { data, error } = await supabase
    .from("imported_reviews")
    .select("id, review_text, rating, reviewer_name, review_date")
    .eq("profile_id", profileId)
    .order("review_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  return (data || []) as ImportedReview[];
};

export const getProfilePhotos = async (profileId: string, limit = 6) => {
  const { data, error } = await supabase
    .from("therapist_photos")
    .select("id, public_url, storage_path, photo_type")
    .eq("profile_id", profileId)
    .eq("status", "approved")
    .order("photo_type", { ascending: true })
    .limit(limit);

  if (error) return [];

  return (data || []).map(p => ({
    id: p.id,
    storage_path: p.public_url || p.storage_path,
    is_primary: p.photo_type === 'profile'
  }));
};

export async function getCityInventoryCount(cityName: string): Promise<number> {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("visibility_status", "public")
    .eq("profile_status", "approved")
    .ilike("city", cityName);

  return count || 0;
}

export async function getCityInventoryMap(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const { data, error } = await supabase
    .from("profiles")
    .select("city")
    .eq("visibility_status", "public")
    .eq("profile_status", "approved")
    .not("city", "is", null);

  if (error) return map;

  for (const row of data ?? []) {
    const key = (row.city as string).toLowerCase().trim();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}
