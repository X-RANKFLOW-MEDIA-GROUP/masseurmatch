"use client";

import { motion, useReducedMotion } from "framer-motion";
import { US_CITIES } from "@/data/cities";

/**
 * Animated marquee of top MasseurMatch cities. Names scroll continuously to the
 * left, each rendered at a different size and brightness to create an editorial
 * "city skyline" sense of depth. Sits on the dark first-fold band.
 */

type CityTier = 1 | 2 | 3;
type City = { name: string; tier: CityTier };

// tier 1 = hero markets (big & bright), 2 = mid, 3 = supporting (small & dim).
// Driven by slug so display names resolve from the canonical city dataset and
// any city dropped from the directory automatically disappears from the marquee.
const CITY_TIERS: { slug: string; tier: CityTier }[] = [
  { slug: "new-york", tier: 1 },
  { slug: "philadelphia", tier: 3 },
  { slug: "miami", tier: 1 },
  { slug: "sarasota", tier: 3 },
  { slug: "los-angeles", tier: 1 },
  { slug: "orlando", tier: 2 },
  { slug: "houston", tier: 1 },
  { slug: "tampa", tier: 3 },
  { slug: "atlanta", tier: 1 },
  { slug: "las-vegas", tier: 2 },
  { slug: "chicago", tier: 1 },
  { slug: "boston", tier: 2 },
  { slug: "dallas", tier: 1 },
  { slug: "seattle", tier: 3 },
  { slug: "washington-dc", tier: 2 },
  { slug: "denver", tier: 3 },
  { slug: "san-francisco", tier: 2 },
  { slug: "austin", tier: 3 },
  { slug: "phoenix", tier: 3 },
];

const CITIES: City[] = CITY_TIERS.flatMap(({ slug, tier }) => {
  const city = US_CITIES.find((c) => c.slug === slug);
  return city ? [{ name: city.name, tier }] : [];
});

const TIER_STYLES: Record<City["tier"], string> = {
  1: "text-[clamp(1.75rem,4vw,3.25rem)] text-white",
  2: "text-[clamp(1.25rem,2.6vw,2.1rem)] text-white/55",
  3: "text-[clamp(0.95rem,1.8vw,1.4rem)] text-white/30",
};

function Row() {
  return (
    <div className="flex shrink-0 items-baseline gap-8 px-4 lg:gap-12">
      {CITIES.map((city, i) => (
        <span
          key={`${city.name}-${i}`}
          className={`flex items-baseline whitespace-nowrap font-display font-extrabold uppercase tracking-tight ${TIER_STYLES[city.tier]}`}
        >
          {city.name}
          {city.tier === 1 && (
            <span className="ml-2 inline-block h-[0.35em] w-[0.35em] translate-y-[-0.15em] rounded-full bg-primary" />
          )}
        </span>
      ))}
    </div>
  );
}

export function CityMarquee() {
  const reduced = useReducedMotion();

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#1A1A1A] py-6 lg:py-8">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#1A1A1A] to-transparent lg:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#1A1A1A] to-transparent lg:w-40" />

      {reduced ? (
        <div className="flex">
          <Row />
        </div>
      ) : (
        <motion.div
          className="flex"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
        >
          <Row />
          <Row />
        </motion.div>
      )}
    </div>
  );
}

export default CityMarquee;
