"use client";

import Link from "next/link";
import { IconMapPin } from "@/components/icons";

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
    <div className="border-t border-white/[0.06] bg-[#111111] px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-1 gap-y-1">
        <span className="flex items-center gap-1.5 pr-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 sm:text-[10px]">
          <IconMapPin size={10} className="text-[#8B1E2D]" />
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
          className="ml-1 rounded-full border border-[#D4717E]/30 bg-[#D4717E]/[0.06] px-3 py-1 text-[11px] font-semibold text-[#D4717E] transition hover:bg-[#D4717E]/[0.12]"
        >
          All cities →
        </Link>
      </div>
    </div>
  );
}

export default CityMarquee;
