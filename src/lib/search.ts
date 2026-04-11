import type { SupabaseClient } from "@supabase/supabase-js";

import { haversineDistance } from "@/lib/distance";

export type TherapistSearchFilters = {
  query?: string;
  specialties?: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: "today" | "this_week" | "any";
  minRating?: number;
  verifiedOnly?: boolean;
  languages?: string[];
  radiusMiles?: number;
  lat?: number;
  lng?: number;
  limit?: number;
};

export type TherapistSearchRow = {
  id: string;
  slug: string;
  display_name: string;
  city: string | null;
  state: string | null;
  bio: string | null;
  massage_techniques: string[] | null;
  languages: string[] | null;
  rates: Record<string, unknown> | null;
  profile_verified: boolean | null;
  rating_average: number | null;
  latitude: number | null;
  longitude: number | null;
};

export function parseSearchFilters(searchParams: URLSearchParams): TherapistSearchFilters {
  const numberValue = (value: string | null) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return {
    query: searchParams.get("query") ?? undefined,
    specialties: (searchParams.get("specialties") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    minPrice: numberValue(searchParams.get("minPrice")),
    maxPrice: numberValue(searchParams.get("maxPrice")),
    availability: (searchParams.get("availability") as TherapistSearchFilters["availability"]) ?? "any",
    minRating: numberValue(searchParams.get("minRating")),
    verifiedOnly: searchParams.get("verifiedOnly") === "true",
    languages: (searchParams.get("languages") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    radiusMiles: numberValue(searchParams.get("radiusMiles")),
    lat: numberValue(searchParams.get("lat")),
    lng: numberValue(searchParams.get("lng")),
    limit: numberValue(searchParams.get("limit")) ?? 25,
  };
}

function extractPrice(rates: Record<string, unknown> | null | undefined): number {
  if (!rates || typeof rates !== "object") return 0;

  const priceCandidates = [rates.session_60, rates.incall_60, rates.base_price];
  for (const candidate of priceCandidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === "string") {
      const parsed = Number(candidate.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

export function applyInMemoryFilters(items: TherapistSearchRow[], filters: TherapistSearchFilters) {
  return items
    .filter((item) => {
      if (filters.specialties?.length) {
        const specialties = (item.massage_techniques ?? []).map((value) => value.toLowerCase());
        const hasSpecialty = filters.specialties.some((specialty) => specialties.includes(specialty.toLowerCase()));
        if (!hasSpecialty) return false;
      }

      if (filters.languages?.length) {
        const languages = (item.languages ?? []).map((value) => value.toLowerCase());
        const hasLanguage = filters.languages.some((language) => languages.includes(language.toLowerCase()));
        if (!hasLanguage) return false;
      }

      if (filters.verifiedOnly && !item.profile_verified) {
        return false;
      }

      if (typeof filters.minRating === "number") {
        if ((item.rating_average ?? 0) < filters.minRating) return false;
      }

      const price = extractPrice(item.rates ?? {});
      if (typeof filters.minPrice === "number" && price < filters.minPrice) return false;
      if (typeof filters.maxPrice === "number" && price > filters.maxPrice) return false;

      if (
        typeof filters.radiusMiles === "number" &&
        typeof filters.lat === "number" &&
        typeof filters.lng === "number" &&
        typeof item.latitude === "number" &&
        typeof item.longitude === "number"
      ) {
        const distance = haversineDistance(filters.lat, filters.lng, item.latitude, item.longitude);
        if (distance > filters.radiusMiles) return false;
      }

      return true;
    })
    .slice(0, filters.limit ?? 25);
}

export async function fetchTherapistSearchResults(
  client: SupabaseClient,
  filters: TherapistSearchFilters,
): Promise<TherapistSearchRow[]> {
  let query = client
    .from("profiles")
    .select(
      "id,slug,display_name,city,state,bio,massage_techniques,languages,rates,profile_verified,rating_average,latitude,longitude",
    )
    .eq("status", "active")
    .limit((filters.limit ?? 25) * 4);

  if (filters.query) {
    query = query.or(
      `display_name.ilike.%${filters.query}%,bio.ilike.%${filters.query}%,city.ilike.%${filters.query}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return applyInMemoryFilters((data ?? []) as TherapistSearchRow[], filters);
}
