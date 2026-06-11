"use client";

import { useCallback, useState } from "react";
import type { HotelSearchResponse } from "@/types/hotel-search";

interface UseHotelSearch {
  data: HotelSearchResponse | null;
  loading: boolean;
  error: string | null;
  search: (city: string, checkIn: string, checkOut: string) => Promise<HotelSearchResponse>;
  reset: () => void;
}

export function useHotelSearch(): UseHotelSearch {
  const [data, setData] = useState<HotelSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (city: string, checkIn: string, checkOut: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/hotel-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, checkIn, checkOut }),
        });

        const json = (await res.json()) as HotelSearchResponse & { error?: string };

        if (!res.ok || !json.success) {
          throw new Error(json.error || `Hotel search failed: ${res.status}`);
        }

        setData(json);
        return json;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Hotel search failed.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, search, reset };
}
