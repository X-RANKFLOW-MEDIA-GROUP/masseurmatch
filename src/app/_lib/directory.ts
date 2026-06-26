import { US_CITIES } from "@/data/cities";
import { supabase } from "@/integrations/supabase/client";
import { matchBodyTypeKeyword } from "@/lib/physical-profile";
import { FALLBACK_PUBLIC_THERAPISTS } from "@/app/_lib/directory-fallback";

export type TherapistTier = "free" | "standard" | "pro" | "elite";

const PUBLIC_PROFILE_SELECT = `
  id, slug, display_name, full_name, headline, bio, city, state, neighborhood,
  phone, whatsapp_number, email_address, show_email, website,
  service_categories, massage_techniques, specialties,
  incall_price, outcall_price, starting_price,
  offers_incall, offers_outcall, outcall_radius,
  height_inches, weight_lb, body_type,
  years_experience, languages,
  subscription_tier, verification_status, is_featured,
  promotions, updated_at, status, profile_status, visibility_status,
  is_suspended, is_banned, available_now, available_now_expires,
  lgbtq_affirming, business_hours, custom_faq, pricing_sessions, areas_served,
  outcall_radius_miles, travel_schedule, add_ons, training, education, contact_clicks,
  seo_title, seo_description, seo_keywords, created_at
`;

export interface ProfileFaqItem {
  question: string;
  answer: string;
}

export interface ProfilePromotion {
  title: string;
  description: string;
}

export interface PricingSessionItem {
  name?: string | null;
  duration?: number | null;
  incall?: number | null;
  outcall?: number | null;
}

export interface ProfilePhoto {
  id: string;
  storage_path: string;
  is_primary: boolean;
}

export interface ProfileAddOn {
  name: string;
  price?: number | null;
}

export interface ProfileTrainingEntry {
  label: string;
  detail?: string | null;
  institution?: string | null;
}

export interface ProfileTravelEntry {
  city: string;
  state?: string | null;
  start_date: string;
  end_date: string;
}

export type ProfileEducationEntry = string | {
  label?: string | null;
  institution?: string | null;
};

export type BusinessHours = Record<string, unknown> | null;

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
  show_email: boolean;
  website: string | null;
  service_categories: string[] | null;
  massage_techniques: string[] | null;
  specialties: string[] | null;
  subscription_tier: TherapistTier | null;
  status?: string | null;
  profile_status: string | null;
  visibility_status: string | null;
  incall_price: number | null;
  outcall_price: number | null;
  starting_price: number | null;
  offers_incall?: boolean | null;
  offers_outcall?: boolean | null;
  outcall_radius?: number | null;
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
  lgbtq_affirming?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  special_offer_text?: string | null;
  profile_views?: number | null;
  is_featured: boolean;
  updated_at: string;
  modality?: string | null;
  start_year?: number | null;
  avatar_url?: string | null;
  review_count?: number | null;
  _tier?: string | null;
  neighborhood_name?: string | null;
  primary_area?: string | null;
  is_verified_identity?: boolean;
  is_verified_profile?: boolean;
  is_verified_photos?: boolean;
  business_hours?: BusinessHours;
  custom_faq?: ProfileFaqItem[] | null;
  pricing_sessions?: PricingSessionItem[] | null;
  areas_served?: string[] | null;
  outcall_radius_miles?: number | null;
  travel_schedule?: ProfileTravelEntry[] | null;
  add_ons?: ProfileAddOn[] | null;
  training?: Array<ProfileTrainingEntry | string> | null;
  education?: ProfileEducationEntry[] | string | null;
  contact_clicks?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | string | null;
  created_at?: string | null;
  is_demo?: boolean | null;
  identity_verified_at?: string | null;
}

export interface ImportedReview {
  id: string;
  review_text: string;
  rating: number | null;
  reviewer_name: string | null;
  review_date: string | null;
}

export const getCities = () => US_CITIES;

const showDemoProfiles = process.env.SHOW_DEMO_PROFILES === "true";

const buildPublicTherapistsQuery = () => {
  const q = supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_SELECT, { count: "exact" })
    .eq("visibility_status", "public")
    .eq("profile_status", "approved")
    .eq("is_suspended", false)
    .eq("is_banned", false)
    .or("email_address.is.null,not.email_address.ilike.%@example%")
    .or("email_address.is.null,not.email_address.ilike.%admin.dev@%")
    .not("display_name", "ilike", "%test%")
    .not("display_name", "ilike", "%debug%")
    .not("display_name", "ilike", "%admin%")
    .not("display_name", "ilike", "%example%")
    .not("display_name", "ilike", "%demo%")
    .not("slug", "ilike", "%admin%")
    .not("slug", "ilike", "%test%")
    .not("slug", "ilike", "%example%")
    .not("slug", "ilike", "%dev%")
    .not("phone", "ilike", "%555%");
  return q;
};

function isActivelyAvailable(profile: PublicTherapist) {
  return profile.available_now === true &&
    (profile.available_now_expires == null || new Date(profile.available_now_expires).getTime() > Date.now());
}

function sortPublicTherapists(items: PublicTherapist[]) {
  const tierRank: Record<string, number> = { elite: 4, pro: 3, standard: 2, free: 1 };
  return [...items].sort((a, b) => {
    const aTier = tierRank[a.subscription_tier ?? "free"] ?? 0;
    const bTier = tierRank[b.subscription_tier ?? "free"] ?? 0;
    if (bTier !== aTier) return bTier - aTier;
    const aAvail = isActivelyAvailable(a) ? 1 : 0;
    const bAvail = isActivelyAvailable(b) ? 1 : 0;
    if (bAvail !== aAvail) return bAvail - aAvail;
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
  });
}

function applyFallbackFilters(items: PublicTherapist[], filters?: Parameters<typeof getPublicTherapists>[0]) {
  return items.filter((profile) => {
    // Exclude test/debug profiles from public listings
    const name = profile.display_name?.toLowerCase() ?? "";
    if (name.includes("debug") || name.includes("test")) return false;
    if (profile.phone?.includes("555")) return false;

    if (filters?.city && profile.city?.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters?.verified && profile.verification_status !== "verified") return false;
    if (filters?.availableToday && !isActivelyAvailable(profile)) return false;
    if (filters?.tier && profile.subscription_tier !== filters.tier) return false;
    if (filters?.lgbtqAffirming && profile.lgbtq_affirming !== true) return false;
    if (filters?.keyword) {
      const keyword = filters.keyword.toLowerCase();

      // If keyword is a known city name, treat as city filter in fallback too
      const matchedCity = US_CITIES.find(
        (c) => c.name.toLowerCase() === keyword,
      );
      if (matchedCity && !filters?.city) {
        if (profile.city?.toLowerCase() !== matchedCity.name.toLowerCase()) return false;
      }

      const searchable = [
        profile.bio,
        profile.display_name,
        profile.full_name,
        profile.headline,
        profile.neighborhood,
        profile.neighborhood_name,
        profile.city,
        ...(profile.specialties ?? []),
        ...(profile.massage_techniques ?? []),
        ...(profile.service_categories ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(keyword)) return false;
    }
    return true;
  });
}

export const getPublicTherapists = async (filters?: {
  city?: string;
  modality?: string;
  keyword?: string;
  session?: "home-visit" | "incall";
  verified?: boolean;
  availableToday?: boolean;
  tier?: TherapistTier;
  lgbtqAffirming?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.max(1, Math.min(500, filters?.pageSize ?? 12));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = buildPublicTherapistsQuery().range(from, to);

  if (filters?.city) query = query.ilike("city", filters.city);
  if (filters?.modality) query = query.or(`modality.ilike.%${filters.modality}%,specialties.cs.{${filters.modality}},massage_techniques.cs.{${filters.modality}}`);
  if (filters?.keyword) {
    const keyword = `%${filters.keyword}%`;
    const bodyTypeKeyword = matchBodyTypeKeyword(filters.keyword);

    // Check if the keyword matches a known city name — if so, also filter by city
    const matchedCity = US_CITIES.find(
      (c) => c.name.toLowerCase() === filters.keyword!.toLowerCase(),
    );
    if (matchedCity && !filters?.city) {
      query = query.ilike("city", matchedCity.name);
    }

    const conditions = [
      `bio.ilike.${keyword}`,
      `display_name.ilike.${keyword}`,
      `full_name.ilike.${keyword}`,
      `headline.ilike.${keyword}`,
      `neighborhood.ilike.${keyword}`,
      `city.ilike.${keyword}`,
      `specialties.cs.{"${filters.keyword}"}`,
      `massage_techniques.cs.{"${filters.keyword}"}`,
      `service_categories.cs.{"${filters.keyword}"}`,
      ...(bodyTypeKeyword ? [`body_type.eq.${bodyTypeKeyword}`] : []),
    ];

    // When matching a city, use AND (city + text match) so only that city's
    // therapists are returned. Otherwise use OR across all text fields.
    if (matchedCity && !filters?.city) {
      // City filter already applied above; the OR here is for ranking/display
      // but the city ilike narrows the result set.
    }
    query = query.or(conditions.join(","));
  }
  if (filters?.verified) query = query.eq("verification_status", "verified");
  if (filters?.availableToday) {
    const nowIso = new Date().toISOString();
    query = query.eq("available_now", true).or(`available_now_expires.is.null,available_now_expires.gt.${nowIso}`);
  }
  if (filters?.tier) query = query.eq("subscription_tier", filters.tier);
  if (filters?.lgbtqAffirming) query = query.eq("lgbtq_affirming", true);

  const { data: rawData, error, count } = await query;
  const data = rawData ? sortPublicTherapists(rawData as unknown as PublicTherapist[]) : [];

  if (!error) {
    return { items: data, total: count ?? data.length, page, pageSize };
  }

  const fallbackItems = sortPublicTherapists(
    applyFallbackFilters(FALLBACK_PUBLIC_THERAPISTS as PublicTherapist[], filters),
  );
  return {
    items: fallbackItems.slice(from, to + 1),
    total: fallbackItems.length,
    page,
    pageSize,
  };
};

export const getPublicTherapistBySlug = async (slug: string): Promise<PublicTherapist | null> => {
  const sanitizedSlug = slug.trim();

  // Reject anything that is not a plain slug or UUID before interpolating into
  // the PostgREST `.or()` filter, so characters like "," "." or ")" cannot
  // break out of the intended expression and alter the matching logic.
  if (!/^[a-z0-9-]+$/i.test(sanitizedSlug)) {
    return null;
  }

  // The `id` column is a UUID. Only compare against it when the input is a
  // valid UUID — otherwise Postgres raises `invalid input syntax for type uuid`
  // (22P02), which fails the whole request and makes every slug-based profile
  // page return 404. For plain slugs, match by `slug` only.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    sanitizedSlug,
  );
  const orFilter = isUuid
    ? `slug.eq.${sanitizedSlug},id.eq.${sanitizedSlug}`
    : `slug.eq.${sanitizedSlug}`;

  const { data: profile, error } = await buildPublicTherapistsQuery()
    .or(orFilter)
    .maybeSingle();

  if (!error && profile) {
    const { data: photos } = await supabase
      .from("profile_photos")
      .select("storage_path, is_primary")
      .eq("profile_id", profile.id)
      .eq("moderation_status", "approved")
      .order("sort_order", { ascending: true });

    const profile_photo = photos?.find((p) => p.is_primary)?.storage_path ?? undefined;
    const gallery_photos = photos
      ?.filter((p) => !p.is_primary && p.storage_path)
      .map((p) => p.storage_path as string);

    const therapist = profile as unknown as PublicTherapist;

    return { ...therapist, profile_photo, gallery_photos };
  }

  return (FALLBACK_PUBLIC_THERAPISTS as PublicTherapist[]).find(
    (profile) => profile.slug === sanitizedSlug || profile.id === sanitizedSlug,
  ) ?? null;
};

export const getImportedReviews = async (profileId: string, limit = 5) => {
  const { data } = await supabase
    .from("imported_reviews")
    .select("id, review_text, rating, reviewer_name, review_date")
    .eq("profile_id", profileId)
    .order("review_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  return (data || []) as unknown as ImportedReview[];
};

export const getProfilePhotos = async (profileId: string, limit = 6) => {
  const fallback = (FALLBACK_PUBLIC_THERAPISTS as PublicTherapist[]).find((profile) => profile.id === profileId);
  const { data, error } = await supabase
    .from("profile_photos")
    .select("id, storage_path, is_primary, sort_order")
    .eq("profile_id", profileId)
    .eq("moderation_status", "approved")
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error || !data?.length) {
    if (!fallback?.avatar_url) return [];
    return [{ id: `${fallback.id}-avatar`, storage_path: fallback.avatar_url, is_primary: true }];
  }

  return data
    .filter((p): p is typeof p & { storage_path: string } => p.storage_path != null)
    .map((p) => ({
      id: p.id,
      storage_path: p.storage_path,
      is_primary: p.is_primary ?? false,
    }));
};

export async function getCityInventoryCount(cityName: string): Promise<number> {
  let q = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("visibility_status", "public")
    .eq("profile_status", "approved")
    .ilike("city", cityName);
  if (!showDemoProfiles) {
    q = q.or("is_demo.is.null,is_demo.eq.false");
  }
  const { count, error } = await q;

  if (!error && count && count > 0) return count;

  return (FALLBACK_PUBLIC_THERAPISTS as PublicTherapist[]).filter(
    (profile) => profile.city?.toLowerCase() === cityName.toLowerCase(),
  ).length;
}

export async function getCityInventoryMap(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const { data, error } = await supabase
    .from("profiles")
    .select("city")
    .eq("visibility_status", "public")
    .eq("profile_status", "approved")
    .not("city", "is", null);

  if (!error) {
    for (const row of data ?? []) {
      const key = (row.city as string).toLowerCase().trim();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  for (const profile of FALLBACK_PUBLIC_THERAPISTS as PublicTherapist[]) {
    const key = profile.city?.toLowerCase().trim();
    if (key && !map.has(key)) map.set(key, 0);
    if (key) map.set(key, (map.get(key) ?? 0) + 1);
  }

  return map;
}
