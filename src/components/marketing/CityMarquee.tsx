"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

const TOP_CITIES = [
  { name: "New York", slug: "new-york" },
  { name: "Los Angeles", slug: "los-angeles" },
  { name: "Miami", slug: "miami" },
  { name: "Chicago", slug: "chicago" },
  { name: "Dallas", slug: "dallas" },
  { name: "Houston", slug: "houston" },
  { name: "Atlanta", slug: "atlanta" },
  { name: "Las Vegas", slug: "las-vegas" },
];

export function CityMarquee() {
  return (
    <div className="border-t border-white/[0.06] bg-[#060E1A] px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-1 gap-y-1">
        <span className="flex items-center gap-1.5 pr-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 sm:text-[10px]">
          <MapPin size={10} className="text-[#8B1E2D]" />
          Browse by city
        </span>
        {TOP_CITIES.map((city, i) => (
          <Link
            key={city.slug}
            href={`/${city.slug}`}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/55 transition hover:border-white/20 hover:text-white/90"
          >
            {city.name}
          </Link>
        ))}
        <Link
          href="/cities"
          className="ml-1 rounded-full border border-[#8B1E2D]/30 bg-[#8B1E2D]/[0.06] px-3 py-1 text-[11px] font-semibold text-[#8B1E2D] transition hover:bg-[#8B1E2D]/[0.12]"
        >
          All cities →
        </Link>
      </div>
    </div>
  );
}

export default CityMarquee;
