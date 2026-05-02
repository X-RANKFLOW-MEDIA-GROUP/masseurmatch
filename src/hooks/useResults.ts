"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { haversineDistance } from "@/lib/distance";
import { trackEvent } from "@/lib/tracking";

export type NearbyTherapist = {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  neighborhood: string | null;
  starting_price: number | null;
  available_now: boolean;
  distance: number | null;
  profile_photo: string | null;
  boost_score: number;
  featured_until: string | null;
  modality: string | null;
  specialties: string[] | null;
  bio: string | null;
  incall_price: number | null;
  outcall_price: number | null;
  _tier: string | null;
};

type UseResultsInput = {
  lat: number | null;
  lng: number | null;
  city: string | null;
};

type FilterState = {
  availableNow: boolean;
  mobileOnly: boolean;
};

const COLUMNS =
  "id, slug, display_name, full_name, city, neighborhood_name, primary_area, incall_price, outcall_price, available_now, avatar_url, modality, specialties, bio, _tier, boost_score, featured_until, latitude, longitude";

function deriveStartingPrice(incall: number | null, outcall: number | null): number | null {
  const prices = [incall, outcall].filter((p): p is number => typeof p === "number" && p > 0);
  return prices.length ? Math.min(...prices) : null;
}

export function useResults({ lat, lng, city }: UseResultsInput) {
  const [results, setResults] = useState<NearbyTherapist[]>([]);
  const [featured, setFeatured] = useState<NearbyTherapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    availableNow: false,
    mobileOnly: false,
  });

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setEmptyState(false);

    try {
      let query = (supabase as any)
        .from("profiles")
        .select(COLUMNS)
        .or("is_active.eq.true,is_active.is.null")
        .in("status", ["active", "approved"])
        .limit(50);

      if (city) {
        query = query.ilike("city", city);
      }

      if (filters.availableNow) {
        query = query.eq("available_now", true);
      }

      if (filters.mobileOnly) {
        query = query.not("outcall_price", "is", null);
      }

      const { data, error } = await query;

      if (error || !data) {
        setResults([]);
        setEmptyState(true);
        trackEvent("empty_state", { city, reason: "query_error" });
        return;
      }

      const mapped: NearbyTherapist[] = (data as any[]).map((row) => {
        const distance =
          lat && lng && row.latitude && row.longitude
            ? haversineDistance(lat, lng, row.latitude, row.longitude)
            : null;

        return {
          id: row.id,
          name: row.display_name || row.full_name || "Therapist",
          slug: row.slug,
          city: row.city,
          neighborhood: row.neighborhood_name || row.primary_area || null,
          starting_price: deriveStartingPrice(row.incall_price, row.outcall_price),
          available_now: row.available_now ?? false,
          distance,
          profile_photo: row.avatar_url || null,
          boost_score: row.boost_score ?? 0,
          featured_until: row.featured_until ?? null,
          modality: row.modality,
          specialties: row.specialties,
          bio: row.bio,
          incall_price: row.incall_price,
          outcall_price: row.outcall_price,
          _tier: row._tier,
        };
      });

      // Sort: available_now DESC, distance ASC, boost_score DESC
      mapped.sort((a, b) => {
        const availDiff = (b.available_now ? 1 : 0) - (a.available_now ? 1 : 0);
        if (availDiff !== 0) return availDiff;

        if (a.distance != null && b.distance != null) {
          const distDiff = a.distance - b.distance;
          if (Math.abs(distDiff) > 0.1) return distDiff;
        }

        return b.boost_score - a.boost_score;
      });

      const now = new Date().toISOString();
      const featuredItems = mapped.filter(
        (t) => t.featured_until && t.featured_until > now,
      ).slice(0, 4);

      setResults(mapped.slice(0, 6));
      setFeatured(featuredItems);
      setEmptyState(mapped.length === 0);

      if (mapped.length === 0) {
        trackEvent("empty_state", { city });
      }
    } catch {
      setResults([]);
      setEmptyState(true);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, city, filters.availableNow, filters.mobileOnly]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const setAvailableNow = useCallback((value: boolean) => {
    setFilters((prev) => ({ ...prev, availableNow: value }));
  }, []);

  const setMobileOnly = useCallback((value: boolean) => {
    setFilters((prev) => ({ ...prev, mobileOnly: value }));
  }, []);

  return {
    results,
    featured,
    loading,
    emptyState,
    filters,
    setAvailableNow,
    setMobileOnly,
    refetch: fetchResults,
  };
}
