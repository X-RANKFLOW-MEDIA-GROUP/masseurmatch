import { US_CITIES } from "@/data/cities";
import { supabase } from "@/integrations/supabase/client";
import { matchBodyTypeKeyword } from "@/lib/physical-profile";

const db = supabase as any;

export type TherapistTier = "free" | "standard" | "pro" | "elite";

export interface ProfileFaqItem { question: string; answer: string; }
export interface ProfilePromotion { title: string; description: string; }
export interface PricingSessionItem { name: string; duration: number; incall?: number | null; outcall?: number | null; }
export interface ProfileTrainingEntry { institution?: string; year?: number; description?: string; label?: string; detail?: string; }
export interface ProfileTravelEntry { city: string; start_date: string; end_date: string; state?: string; detail?: string; }
export interface ProfileAddOn { name: string; price: number; }
export interface ProfilePhoto { id: string; storage_path: string; is_primary: boolean; }

export interface PublicTherapist {
  id: string;
  slug: string | null;
  city: string | null;
  state?: string | null;
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
  status?: string | null;
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
  profile_photo?: string | null;
  gallery_photos?: string[] | null;
  is_featured: boolean;
  updated_at: string;
  modality?: string | null;
  start_year?: number | null;
  avatar_url?: string | null;
  review_count?: number | null;
  profile_views?: number | null;
  _tier?: string | null;
  pricing_sessions?: PricingSessionItem[] | null;
  business_hours?: unknown;
  custom_faq?: ProfileFaqItem[] | unknown;
  latitude?: number | null;
  longitude?: number | null;
  zip_code?: string | null;
  special_offer_text?: string | null;
  neighborhood_name?: string | null;
  primary_area?: string | null;
  is_verified_identity?: boolean | null;
  is_verified_profile?: boolean | null;
  is_verified_photos?: boolean | null;
  lgbtq_affirming?: boolean | null;
  training?: ProfileTrainingEntry[] | string[] | null;
  education?: ProfileTrainingEntry[] | string[] | null;
  areas_served?: string[] | null;
  outcall_radius_miles?: number | null;
  contact_clicks?: number | null;
  travel_schedule?: ProfileTravelEntry[] | unknown;
  add_ons?: ProfileAddOn[] | null;
}

export interface ImportedReview { id: string; review_text: string; rating: number | null; reviewer_name: string | null; review_date: string | null; }

const TIER_RANK: Record<string, number> = { elite: 4, pro: 3, standard: 2, free: 1 };

export const getCities = () => US_CITIES;

const normalizeTier = (value?: string | null): TherapistTier => {
  if (value === "elite" || value === "pro" || value === "standard") return value;
  return "free";
};

const moneyFromCents = (value?: number | null) => (typeof value === "number" ? Math.round(value / 100) : null);

async function getApprovedPhotos(profileIds: string[]) {
  if (profileIds.length === 0) return new Map<string, { profile?: string; gallery: string[] }>();
  const { data } = await db
    .from("therapist_photos")
    .select("id, therapist_profile_id, public_url, storage_path, is_primary, sort_order")
    .in("therapist_profile_id", profileIds)
    .eq("approval_status", "approved")
    .order("sort_order", { ascending: true });

  const map = new Map<string, { profile?: string; gallery: string[] }>();
  for (const photo of data || []) {
    const key = String(photo.therapist_profile_id);
    const entry = map.get(key) || { gallery: [] };
    const url = photo.public_url || photo.storage_path;
    if (photo.is_primary && !entry.profile) entry.profile = url;
    if (url) entry.gallery.push(url);
    map.set(key, entry);
  }
  return map;
}

async function getVisibleServices(profileIds: string[]) {
  if (profileIds.length === 0) return new Map<string, string[]>();
  const { data } = await db
    .from("therapist_services")
    .select("therapist_profile_id, service_name, category, sort_order")
    .in("therapist_profile_id", profileIds)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  const map = new Map<string, string[]>();
  for (const service of data || []) {
    const key = String(service.therapist_profile_id);
    const values = map.get(key) || [];
    if (service.service_name) values.push(String(service.service_name));
    map.set(key, values);
  }
  return map;
}

async function getVisiblePricing(profileIds: string[]) {
  if (profileIds.length === 0) return new Map<string, PricingSessionItem[]>();
  const { data } = await db
    .from("therapist_pricing")
    .select("therapist_profile_id, session_type, duration_minutes, price_cents")
    .in("therapist_profile_id", profileIds)
    .eq("is_visible", true)
    .order("duration_minutes", { ascending: true });

  const map = new Map<string, PricingSessionItem[]>();
  for (const row of data || []) {
    const key = String(row.therapist_profile_id);
    const values = map.get(key) || [];
    const existing = values.find((item) => item.duration === row.duration_minutes);
    const price = moneyFromCents(row.price_cents);
    if (existing) {
      if (row.session_type === "incall" || row.session_type === "either") existing.incall = price;
      if (row.session_type === "outcall" || row.session_type === "either") existing.outcall = price;
    } else {
      values.push({
        name: `${row.duration_minutes} min`,
        duration: row.duration_minutes,
        incall: row.session_type === "incall" || row.session_type === "either" ? price : null,
        outcall: row.session_type === "outcall" || row.session_type === "either" ? price : null,
      });
    }
    map.set(key, values);
  }
  return map;
}

async function getActiveTiers(profileIds: string[]) {
  if (profileIds.length === 0) return new Map<string, TherapistTier>();
  const { data } = await db
    .from("therapist_subscriptions")
    .select("therapist_profile_id, subscription_plans(code)")
    .in("therapist_profile_id", profileIds)
    .in("status", ["trialing", "active"]);

  const map = new Map<string, TherapistTier>();
  for (const row of data || []) {
    const code = Array.isArray(row.subscription_plans)
      ? row.subscription_plans[0]?.code
      : row.subscription_plans?.code;
    map.set(String(row.therapist_profile_id), normalizeTier(code));
  }
  return map;
}

async function hydrateTherapists(rows: any[]): Promise<PublicTherapist[]> {
  const ids = rows.map((row) => String(row.id));
  const [photoMap, serviceMap, pricingMap, tierMap] = await Promise.all([
    getApprovedPhotos(ids),
    getVisibleServices(ids),
    getVisiblePricing(ids),
    getActiveTiers(ids),
  ]);

  return rows.map((row) => {
    const photos = photoMap.get(String(row.id));
    const services = serviceMap.get(String(row.id)) || [];
    const pricing = pricingMap.get(String(row.id)) || [];
    const tier = tierMap.get(String(row.id)) || "free";
    const incallPrice = pricing.map((item) => item.incall).find((value) => typeof value === "number") ?? null;
    const outcallPrice = pricing.map((item) => item.outcall).find((value) => typeof value === "number") ?? null;
    const startingPrice = [incallPrice, outcallPrice].filter((value): value is number => typeof value === "number").sort((a, b) => a - b)[0] ?? null;

    return {
      id: row.id,
      slug: row.slug,
      city: row.city,
      state: row.state,
      display_name: row.display_name,
      full_name: row.display_name,
      headline: row.headline,
      bio: row.bio,
      phone: row.phone,
      whatsapp_number: row.phone,
      email_address: row.contact_email,
      website: row.website_url,
      service_categories: services,
      massage_techniques: services,
      specialties: services,
      subscription_tier: tier,
      profile_status: row.moderation_status === "approved" ? "approved" : row.moderation_status,
      visibility_status: row.is_published ? "public" : "private",
      status: row.moderation_status,
      incall_price: incallPrice,
      outcall_price: outcallPrice,
      starting_price: startingPrice,
      available_now: null,
      available_now_expires: null,
      verification_status: row.verification_status,
      neighborhood: row.neighborhood,
      years_experience: null,
      is_featured: TIER_RANK[tier] >= TIER_RANK.pro,
      updated_at: row.updated_at,
      profile_photo: photos?.profile || photos?.gallery?.[0] || null,
      gallery_photos: photos?.gallery || [],
      _tier: tier,
      pricing_sessions: pricing,
      latitude: row.latitude,
      longitude: row.longitude,
      outcall_radius_miles: row.service_radius_miles,
      is_verified_identity: row.verification_status === "verified",
      is_verified_profile: row.verification_status === "verified",
      is_verified_photos: false,
      lgbtq_affirming: true,
      areas_served: row.city ? [row.city] : [],
      contact_clicks: null,
      add_ons: null,
    } satisfies PublicTherapist;
  });
}

const buildTherapistBaseQuery = () =>
  db
    .from("therapist_profiles")
    .select("id, slug, display_name, headline, bio, city, state, country, neighborhood, latitude, longitude, service_radius_miles, offers_incall, offers_outcall, phone, contact_email, website_url, is_published, moderation_status, verification_status, canonical_city_slug, updated_at", { count: "exact" })
    .eq("is_published", true)
    .eq("moderation_status", "approved");

export const getPublicTherapists = async (filters?: {
  city?: string;
  modality?: string;
  keyword?: string;
  session?: "home-visit" | "incall";
  verified?: boolean;
  availableToday?: boolean;
  lgbtqAffirming?: boolean;
  tier?: TherapistTier;
  page?: number;
  pageSize?: number;
}) => {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.max(1, Math.min(500, filters?.pageSize ?? 12));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = buildTherapistBaseQuery().range(from, to);

  if (filters?.city) {
    query = query.or(`city.ilike.${filters.city},canonical_city_slug.eq.${filters.city.toLowerCase().replace(/\s+/g, "-")}`);
  }

  if (filters?.keyword) {
    const keyword = `%${filters.keyword}%`;
    const bodyTypeKeyword = matchBodyTypeKeyword(filters.keyword);
    const conditions = [`bio.ilike.${keyword}`, `display_name.ilike.${keyword}`, `headline.ilike.${keyword}`, `neighborhood.ilike.${keyword}`];
    if (bodyTypeKeyword) conditions.push(`bio.ilike.%${bodyTypeKeyword}%`);
    query = query.or(conditions.join(","));
  }

  if (filters?.verified) query = query.eq("verification_status", "verified");
  if (filters?.session === "home-visit") query = query.eq("offers_outcall", true);
  if (filters?.session === "incall") query = query.eq("offers_incall", true);

  const { data, error, count } = await query;
  if (error || !data) return { items: [], total: 0, page, pageSize };

  let items = await hydrateTherapists(data);

  if (filters?.modality) {
    const needle = filters.modality.toLowerCase();
    items = items.filter((item) => (item.specialties || []).some((value) => value.toLowerCase().includes(needle)) || item.bio?.toLowerCase().includes(needle));
  }

  if (filters?.tier) items = items.filter((item) => item.subscription_tier === filters.tier);

  items.sort((a, b) => {
    const tierDiff = (TIER_RANK[b.subscription_tier || "free"] || 0) - (TIER_RANK[a.subscription_tier || "free"] || 0);
    if (tierDiff) return tierDiff;
    return Number(b.is_featured) - Number(a.is_featured);
  });

  return { items, total: count || items.length, page, pageSize };
};

export const getPublicTherapistBySlug = async (slug: string): Promise<PublicTherapist | null> => {
  const sanitizedSlug = slug.trim();
  if (!sanitizedSlug) return null;
  const { data, error } = await buildTherapistBaseQuery().or(`slug.eq.${sanitizedSlug},id.eq.${sanitizedSlug}`).maybeSingle();
  if (error || !data) return null;
  const [profile] = await hydrateTherapists([data]);
  return profile || null;
};

export const getImportedReviews = async (profileId: string, limit = 5) => {
  const { data } = await db
    .from("imported_reviews")
    .select("id, review_text, rating, reviewer_name, review_date")
    .eq("profile_id", profileId)
    .order("review_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  return (data || []) as ImportedReview[];
};

export const getProfilePhotos = async (profileId: string, limit = 6): Promise<ProfilePhoto[]> => {
  const { data, error } = await db
    .from("therapist_photos")
    .select("id, public_url, storage_path, is_primary, sort_order")
    .eq("therapist_profile_id", profileId)
    .eq("approval_status", "approved")
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) return [];

  return (data || []).map((photo: any) => ({
    id: photo.id,
    storage_path: photo.public_url || photo.storage_path,
    is_primary: Boolean(photo.is_primary),
  }));
};

export async function getCityInventoryCount(cityName: string): Promise<number> {
  const slug = cityName.toLowerCase().trim().replace(/\s+/g, "-");
  const { count } = await db
    .from("therapist_profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true)
    .eq("moderation_status", "approved")
    .or(`city.ilike.${cityName},canonical_city_slug.eq.${slug}`);

  return count || 0;
}

export async function getCityInventoryMap(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const { data, error } = await db
    .from("therapist_profiles")
    .select("city")
    .eq("is_published", true)
    .eq("moderation_status", "approved")
    .not("city", "is", null);

  if (error) return map;

  data.forEach((row: any) => {
    const key = (row.city as string).toLowerCase().trim();
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return map;
}
