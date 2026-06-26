"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PublicTherapistCard } from "@/app/_components/PublicTherapistCard";
import type { PublicTherapist } from "@/app/_lib/directory";
import { MapPin, Loader2, Search, X, SlidersHorizontal } from "lucide-react";

type TherapistsPageClientProps = {
  items: PublicTherapist[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    city: string;
    modality: string;
    tier: string;
  };
};

export default function TherapistsPageClient({
  items,
  total,
  page,
  totalPages,
  filters,
}: TherapistsPageClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [city, setCity] = useState(filters.city);
  const [modality, setModality] = useState(filters.modality);
  const [tier, setTier] = useState(filters.tier);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [detectedCity, setDetectedCity] = useState<string>("");
  const didRequestLocation = useRef(false);

  useEffect(() => {
    setCity(filters.city);
    setModality(filters.modality);
    setTier(filters.tier);
  }, [filters.city, filters.modality, filters.tier]);

  // Request location immediately on mount (only when no city filter is active)
  useEffect(() => {
    if (didRequestLocation.current || filters.city || !("geolocation" in navigator)) return;
    didRequestLocation.current = true;
    setLocationStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en-US,en" } }
          );
          const data = (await res.json()) as { address?: { city?: string; town?: string; municipality?: string } };
          const detected =
            data.address?.city ||
            data.address?.town ||
            data.address?.municipality ||
            "";
          if (detected) {
            setDetectedCity(detected);
            setCity(detected);
            setLocationStatus("granted");
            const next = new URLSearchParams({ city: detected });
            router.push(`${pathname}?${next.toString()}`);
          } else {
            setLocationStatus("denied");
          }
        } catch {
          setLocationStatus("denied");
        }
      },
      () => setLocationStatus("denied"),
      { timeout: 10000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams();

    if (key === "city" ? value : city) {
      next.set("city", key === "city" ? value : city);
    }
    if (key === "modality" ? value : modality) {
      next.set("modality", key === "modality" ? value : modality);
    }
    if (key === "tier" ? value : tier) {
      next.set("tier", key === "tier" ? value : tier);
    }
    const nextPage = key === "page" ? value : "1";
    if (nextPage && nextPage !== "1") next.set("page", nextPage);

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname || "/therapists");
  };

  const clearAll = () => {
    setCity("");
    setModality("");
    setTier("");
    setDetectedCity("");
    setLocationStatus("idle");
    router.push(pathname || "/therapists");
  };

  const hasFilters = Boolean(city || modality || tier);

  return (
    <section>
      {/* ── Location banner ──────────────────────────────────────────────── */}
      {locationStatus === "requesting" && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3.5 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-blue-500" strokeWidth={2.5} />
          <span>Finding therapists near you&hellip;</span>
        </div>
      )}
      {locationStatus === "granted" && detectedCity && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-700">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-emerald-600" strokeWidth={2.25} />
            Showing therapists near <strong>{detectedCity}</strong>
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto flex-shrink-0 text-emerald-500 hover:text-emerald-700"
            aria-label="Clear location filter"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ── Search & filter bar ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#e8e0d8] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#FF8A1F]" strokeWidth={2.25} />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a1927f]">Filter directory</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1927f]" strokeWidth={2} />
            <label htmlFor="therapists-filter-city" className="sr-only">Filter by city</label>
            <input
              id="therapists-filter-city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setParam("city", e.target.value);
              }}
              placeholder="City or area…"
              className="w-full rounded-xl border border-[#e8e0d8] bg-[#FAF8F5] py-2.5 pl-9 pr-3 text-sm text-[#1a1a1a] placeholder:text-[#a1927f] focus:border-[#FF8A1F]/50 focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/20"
            />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1927f]" strokeWidth={2} />
            <label htmlFor="therapists-filter-specialty" className="sr-only">Filter by specialty</label>
            <input
              id="therapists-filter-specialty"
              value={modality}
              onChange={(e) => {
                setModality(e.target.value);
                setParam("modality", e.target.value);
              }}
              placeholder="Specialty or technique…"
              className="w-full rounded-xl border border-[#e8e0d8] bg-[#FAF8F5] py-2.5 pl-9 pr-3 text-sm text-[#1a1a1a] placeholder:text-[#a1927f] focus:border-[#FF8A1F]/50 focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/20"
            />
          </div>
        </div>
      </div>

      {/* ── Result count + reset ─────────────────────────────────────────── */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-[#5a5147]" aria-live="polite">
          <span className="font-semibold text-[#1a1a1a]">{total}</span>
          {" "}public {total === 1 ? "listing" : "listings"}
          {city ? <> near <span className="font-medium text-[#FF8A1F]">{city}</span></> : ""}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#FF8A1F] hover:text-[#e67600]"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Cards grid ──────────────────────────────────────────────────── */}
      {items.length > 0 ? (
        <div className="mt-5 grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {items.map((item, index) => (
            <PublicTherapistCard key={item.id} therapist={item} priority={index < 6} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-[#e8e0d8] px-6 py-12 text-center">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-[#FF8A1F]/40" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-[#1a1a1a]">No listings matched this view.</h2>
          <p className="mt-2 text-sm leading-6 text-[#5a5147]">
            Clear the filters to return to the full directory or try a broader city or specialty.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FF8A1F] px-5 py-2 text-sm font-semibold text-[#1a0a00]"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Clear filters
          </button>
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            aria-label="Go to previous directory page"
            onClick={() => setParam("page", String(Math.max(1, page - 1)))}
            className="rounded-xl border border-[#e8e0d8] bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] shadow-sm disabled:opacity-40 hover:border-[#FF8A1F]/40"
          >
            Prev
          </button>
          <span className="text-sm text-[#5a5147]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            aria-label="Go to next directory page"
            onClick={() => setParam("page", String(Math.min(totalPages, page + 1)))}
            className="rounded-xl border border-[#e8e0d8] bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] shadow-sm disabled:opacity-40 hover:border-[#FF8A1F]/40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
