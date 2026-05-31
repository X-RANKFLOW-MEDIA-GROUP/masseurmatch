"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { LaunchCityCard } from "@/lib/marketing/home-data";

type Props = {
  launchCities: LaunchCityCard[];
};

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

// City slugs that ship with a real photo in /public/marketing/cities.
// Others render the branded gradient fallback (no broken image request).
const CITY_PHOTOS = new Set([
  "atlanta",
  "dallas",
  "houston",
  "los-angeles",
  "miami",
  "new-york",
  "washington-dc",
]);

/**
 * A single city card that tilts in 3D toward the cursor and lifts a glare
 * highlight, with the real city photo behind it (gradient fallback if the
 * photo is missing).
 */
function CityTiltCard({ entry, index }: { entry: LaunchCityCard; index: number }) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const hasPhoto = CITY_PHOTOS.has(entry.city.slug);
  const [imgError, setImgError] = useState(false);

  // Raw pointer position (0..1) -> springed rotation for a smooth, weighty feel.
  const px = useMotionValue(0.5);
  const rotX = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const glarePct = useTransform(useSpring(px, { stiffness: 150, damping: 20 }), (v) => `${v * 100}%`);
  const glareBackground = useMotionTemplate`radial-gradient(220px circle at ${glarePct} 30%, rgba(255,255,255,0.18), transparent 60%)`;

  const MAX_TILT = 9; // degrees

  function handleMove(e: React.PointerEvent<HTMLAnchorElement>) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    px.set(nx);
    rotY.set((nx - 0.5) * MAX_TILT * 2);
    rotX.set((0.5 - ny) * MAX_TILT * 2);
  }

  function handleLeave() {
    rotX.set(0);
    rotY.set(0);
    px.set(0.5);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: customEase, delay: index * 0.05 }}
      style={{ perspective: 900 }}
    >
      <Link
        ref={ref}
        href={entry.href}
        className="group block"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <motion.div
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
          whileHover={reducedMotion ? undefined : { scale: 1.03 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative aspect-square overflow-hidden rounded-2xl bg-[#060f1e] ring-1 ring-white/10 transition-shadow duration-300 group-hover:ring-primary/40 group-hover:shadow-[0_18px_60px_-12px_rgba(255,138,31,0.35)]"
        >
          {!hasPhoto || imgError ? (
            // Branded gradient fallback for cities without a photo.
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,138,31,0.35),transparent_55%),linear-gradient(150deg,#0a1a2e,#060d1b)]">
              <span className="absolute bottom-3 left-3 font-display text-3xl font-extrabold text-white/10">
                {entry.city.stateCode}
              </span>
            </div>
          ) : (
            <Image
              src={`/marketing/cities/${entry.city.slug}.jpg`}
              alt={`${entry.city.name} massage therapists`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          )}

          {/* Legibility gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#040912]/85 via-[#040912]/20 to-transparent" />

          {/* Cursor glare */}
          {!reducedMotion && (
            <motion.div
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: glareBackground }}
            />
          )}

          {/* City label, lifted in 3D space */}
          <div
            className="absolute inset-x-0 bottom-0 p-4"
            style={{ transform: "translateZ(40px)" }}
          >
            <p className="font-display text-lg font-bold leading-none text-white lg:text-xl">
              {entry.city.name}
            </p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/60">
              {entry.city.stateCode} · {entry.routeCount} services
            </p>
          </div>

          {/* Hover arrow */}
          <div className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-white/0 bg-white/0 text-xs text-white/0 transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/15 group-hover:text-white">
            ↗
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function CityCaseStudies({ launchCities }: Props) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Top markets
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold leading-[0.95] tracking-tight">
              Find your city.
            </h2>
          </div>
          <Link
            href="/cities"
            className="hidden text-xs font-semibold uppercase tracking-widest text-primary transition hover:opacity-70 sm:block"
          >
            All cities →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {launchCities.map((entry, i) => (
            <CityTiltCard key={entry.href} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
