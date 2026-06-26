"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Building2 } from "lucide-react";
import { US_CITIES } from "@/data/cities";

/**
 * Slim popular-cities strip for the first fold. It keeps the editorial movement
 * from the old marquee but uses a shorter conversion-focused bar so the hero
 * profile cards and AI match assistant remain the primary visual focus.
 */

type City = { name: string; slug: string };

const CITY_SLUGS = [
  "dallas",
  "miami",
  "los-angeles",
  "new-york",
  "houston",
  "atlanta",
  "orlando",
  "chicago",
  "las-vegas",
  "washington-dc",
];

const CITIES: City[] = CITY_SLUGS.flatMap((slug) => {
  const city = US_CITIES.find((c) => c.slug === slug);
  return city ? [{ name: city.name, slug: city.slug }] : [];
});

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-4 px-4 text-sm font-black uppercase tracking-[0.08em] text-white/80 lg:gap-7">
      {CITIES.map((city, index) => (
        <Link
          key={`${city.slug}-${index}`}
          href={`/${city.slug}`}
          className="whitespace-nowrap transition hover:text-white"
        >
          <span className={index === 0 ? "text-[#CC2424]" : ""}>{city.name}</span>
        </Link>
      ))}
    </div>
  );
}

export function CityMarquee() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;

  return (
    <div className="bg-white px-5 pb-10 sm:px-8 lg:px-10">
      <div className="relative mx-auto flex max-w-[1500px] items-center overflow-hidden rounded-2xl border border-white/10 bg-[#181818] py-4 shadow-[0_16px_45px_rgba(15,23,42,0.18)]">
        <div className="z-20 flex shrink-0 items-center gap-3 border-r border-white/15 bg-[#181818] px-5 text-xs font-black uppercase tracking-[0.12em] text-white/75 lg:px-7">
          <Building2 size={17} className="text-white/65" />
          Popular Cities
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-36 z-10 w-16 bg-gradient-to-r from-[#181818] to-transparent lg:left-48" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#181818] to-transparent" />

        {reduced ? (
          <div className="flex min-w-0 overflow-hidden">
            <Row />
          </div>
        ) : (
          <motion.div
            className="flex min-w-0"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 42 }}
          >
            <Row />
            <Row />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CityMarquee;
