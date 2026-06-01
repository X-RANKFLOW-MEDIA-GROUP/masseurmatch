"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Animated marquee of top MasseurMatch cities. Names scroll continuously to the
 * left, each rendered at a different size and brightness to create an editorial
 * "city skyline" sense of depth. Sits on the dark first-fold band.
 */

type City = { name: string; tier: 1 | 2 | 3 };

// tier 1 = hero markets (big & bright), 2 = mid, 3 = supporting (small & dim)
const CITIES: City[] = [
  { name: "New York", tier: 1 },
  { name: "Philadelphia", tier: 3 },
  { name: "Miami", tier: 1 },
  { name: "Sarasota", tier: 3 },
  { name: "Los Angeles", tier: 1 },
  { name: "Orlando", tier: 2 },
  { name: "Houston", tier: 1 },
  { name: "Tampa", tier: 3 },
  { name: "Atlanta", tier: 1 },
  { name: "Las Vegas", tier: 2 },
  { name: "Chicago", tier: 1 },
  { name: "Boston", tier: 2 },
  { name: "Dallas", tier: 1 },
  { name: "Seattle", tier: 3 },
  { name: "Washington DC", tier: 2 },
  { name: "Denver", tier: 3 },
  { name: "San Francisco", tier: 2 },
  { name: "Austin", tier: 3 },
  { name: "Phoenix", tier: 3 },
];

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
    <div className="relative overflow-hidden border-y border-white/10 bg-[#091a31] py-6 lg:py-8">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#091a31] to-transparent lg:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#091a31] to-transparent lg:w-40" />

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
