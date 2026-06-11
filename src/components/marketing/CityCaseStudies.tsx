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

// City slugs that ship with a real photo in /public/marketing/cities (jpg preferred, svg fallback).
const CITY_PHOTO_EXT: Record<string, "jpg" | "svg"> = {
  atlanta: "jpg",
  chicago: "svg",
  dallas: "jpg",
  houston: "jpg",
  "los-angeles": "jpg",
  miami: "jpg",
  "new-york": "jpg",
  "washington-dc": "jpg",
};

/**
 * A glass "city platform" that tilts in 3D toward the cursor, lifts a glare,
 * and lights a rainbow under-glow — the real city skyline photo behind it
 * (branded gradient fallback when the photo is missing). Tasteful, non-explicit
 * recreation of the cinematic city-diorama concept.
 */
function CityPlatform({
  entry,
  index,
  featured = false,
}: {
  entry: LaunchCityCard;
  index: number;
  featured?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const photoExt = CITY_PHOTO_EXT[entry.city.slug];
  const hasPhoto = Boolean(photoExt);
  const [imgError, setImgError] = useState(false);

  const px = useMotionValue(0.5);
  const rotX = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const glarePct = useTransform(useSpring(px, { stiffness: 150, damping: 20 }), (v) => `${v * 100}%`);
  const glareBackground = useMotionTemplate`radial-gradient(220px circle at ${glarePct} 28%, rgba(255,255,255,0.22), transparent 60%)`;

  const MAX_TILT = 10;

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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: customEase, delay: index * 0.06 }}
      style={{ perspective: 1000 }}
    >
      <Link
        ref={ref}
        href={entry.href}
        className="group relative block"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        {/* Rainbow under-glow beam (LGBTQ+ accent) */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-x-3 -bottom-4 h-12 rounded-full bg-[linear-gradient(90deg,#ff5f6d,#ffc371,#47e891,#3ad0ff,#a17bff)] blur-xl transition-opacity duration-300 group-hover:opacity-90 ${
            featured ? "opacity-70" : "opacity-45"
          }`}
        />

        <motion.div
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
          whileHover={reducedMotion ? undefined : { scale: 1.03 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-[#0a1424] shadow-[0_30px_70px_-22px_rgba(0,0,0,0.85)] ring-1 transition-shadow duration-300 group-hover:ring-primary/50 ${
            featured ? "ring-primary/40" : "ring-white/15"
          }`}
        >
          {!hasPhoto || imgError ? (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,138,31,0.35),transparent_55%),linear-gradient(150deg,#0d2038,#060d1b)]" />
          ) : (
            <Image
              src={`/marketing/cities/${entry.city.slug}.${photoExt ?? "jpg"}`}
              alt={`${entry.city.name} massage therapists`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
              sizes={featured ? "(max-width: 1024px) 100vw, 25vw" : "(max-width: 640px) 50vw, 25vw"}
              onError={() => setImgError(true)}
            />
          )}

          {/* Diagonal rainbow light beam inside the scene */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-300 group-hover:opacity-70"
            style={{
              background:
                "linear-gradient(115deg, transparent 35%, rgba(255,95,109,0.5) 45%, rgba(255,195,113,0.5) 52%, rgba(71,232,145,0.5) 59%, rgba(58,208,255,0.5) 66%, transparent 76%)",
            }}
          />

          {/* Legibility gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#03060d] via-[#03060d]/30 to-transparent" />

          {/* Cursor glare */}
          {!reducedMotion && (
            <motion.div
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: glareBackground }}
            />
          )}

          {featured && (
            <div className="absolute left-3 top-3 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white ring-1 ring-white/20 backdrop-blur">
              ✦ Most listings
            </div>
          )}

          {/* Glowing city name */}
          <div className="absolute inset-x-0 bottom-0 p-4" style={{ transform: "translateZ(45px)" }}>
            <p
              className={`font-display font-extrabold uppercase leading-none tracking-tight text-white ${
                featured ? "text-xl lg:text-2xl" : "text-lg"
              }`}
              style={{ textShadow: "0 0 22px rgba(255,255,255,0.35)" }}
            >
              {entry.city.name}
            </p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
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
  // Feature New York in the center, mirroring the reference layout.
  const featuredSlug = "new-york";

  return (
    <section className="relative overflow-hidden bg-[#070d18] py-20 text-white lg:py-28">
      {/* ── Cinematic night-rooftop backdrop ─────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/marketing/hero/cover.jpg"
          alt=""
          fill
          className="object-cover object-center opacity-25 blur-[2px]"
          sizes="100vw"
        />
        {/* Night wash + rooftop floor */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#070d18_0%,rgba(7,13,24,0.65)_30%,rgba(7,13,24,0.85)_70%,#070d18_100%)]" />
        {/* Rainbow ambient glows */}
        <div className="absolute -left-[10%] top-1/3 h-[40vw] max-h-[480px] w-[40vw] max-w-[480px] rounded-full bg-[radial-gradient(circle,rgba(161,123,255,0.22),transparent_65%)] blur-3xl" />
        <div className="absolute -right-[8%] top-1/4 h-[38vw] max-h-[460px] w-[38vw] max-w-[460px] rounded-full bg-[radial-gradient(circle,rgba(58,208,255,0.2),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[30vw] max-h-[360px] w-[50vw] max-w-[640px] rounded-full bg-[radial-gradient(circle,rgba(255,138,31,0.18),transparent_65%)] blur-3xl" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(3,6,13,0.7)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between lg:mb-14">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">Vibrant Cities</p>
            <h2 className="mt-2 font-display text-[clamp(1.9rem,4vw,3.5rem)] font-extrabold leading-[0.95] tracking-tight text-white">
              Discover Your Urban Connection.
            </h2>
          </div>
          <Link
            href="/cities"
            className="hidden whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-primary transition hover:opacity-70 sm:block"
          >
            Explore all cities →
          </Link>
        </div>

        {/* City platforms */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-5">
          {launchCities.map((entry, i) => (
            <CityPlatform
              key={entry.href}
              entry={entry}
              index={i}
              featured={entry.city.slug === featuredSlug}
            />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/cities"
            className="text-xs font-semibold uppercase tracking-widest text-primary transition hover:opacity-70"
          >
            Explore all cities →
          </Link>
        </div>
      </div>
    </section>
  );
}
