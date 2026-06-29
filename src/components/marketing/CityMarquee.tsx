"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function CityMarquee() {
  const reduced = useReducedMotion();

  return (
    <div className="border-t border-white/[0.06] bg-[#111111] px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-1 gap-y-1">
        <motion.span
          className="flex items-center gap-1.5 pr-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 sm:text-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.5, ease }}
        >
          <IconMapPin size={10} className="text-[#8B1E2D]" />
          Browse by city
        </motion.span>
        {TOP_CITIES.map((city, i) => (
          <motion.div
            key={city.slug}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: reduced ? 0 : 0.4,
              ease,
              delay: reduced ? 0 : 0.1 + i * 0.04,
            }}
          >
            <Link
              href={`/${city.slug}`}
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/55 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white/90 hover:scale-105"
            >
              {city.name}
            </Link>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: reduced ? 0 : 0.4,
            ease,
            delay: reduced ? 0 : 0.1 + TOP_CITIES.length * 0.04,
          }}
        >
          <Link
            href="/cities"
            className="ml-1 rounded-full border border-[#D4717E]/30 bg-[#D4717E]/[0.06] px-3 py-1 text-[11px] font-semibold text-[#D4717E] transition-all duration-200 hover:bg-[#D4717E]/[0.12] hover:scale-105"
          >
            All cities <ArrowRight className="inline h-3 w-3" strokeWidth={2.5} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default CityMarquee;
