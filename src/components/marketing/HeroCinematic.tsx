"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GrainOverlay } from "@/components/motion/GrainOverlay";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function HeroCinematic() {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const dur = reducedMotion ? 0 : 0.8;
  const noDelay = reducedMotion ? 0 : undefined;

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Video background with fallback */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'%3E%3Crect fill='%230F1419' width='1280' height='720'/%3E%3C/svg%3E"
        >
          <source
            src="https://res.cloudinary.com/dyfxkq2nk/video/upload/v1782848462/Untitled_design_tx6pny.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
      </div>

      <GrainOverlay opacity={0.05} className="z-[2]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease: customEase, delay: noDelay }}
            className="flex max-w-3xl flex-col justify-center"
          >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.1 }}
                className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]"
              >
                Premium Directory
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.15 }}
                className="font-display text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                Find Your <span className="text-[#8B1E2D]">Perfect Match</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.2 }}
                className="mt-8 max-w-lg text-lg leading-relaxed text-gray-300 sm:text-xl"
              >
                Discover verified LGBTQ+-affirming male massage therapists across the US. Browse profiles by city, specialty, and availability. Direct contact, no middleman.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.3 }}
                className="mt-10 flex flex-wrap gap-4 sm:gap-6"
              >
                <button
                  type="button"
                  onClick={() => router.push("/search")}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-2xl shadow-[#8B1E2D]/30 transition duration-300 hover:bg-[#6E1521] hover:shadow-[#8B1E2D]/50"
                >
                  Explore Therapists
                  <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-black uppercase tracking-wider text-white backdrop-blur-sm transition duration-300 hover:border-[#8B1E2D]/60 hover:bg-[#8B1E2D]/10"
                >
                  Browse by City
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.4 }}
                className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8"
              >
                <div>
                  <p className="text-2xl font-black text-[#8B1E2D]">500+</p>
                  <p className="mt-1 text-sm text-gray-400">Verified Therapists</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#8B1E2D]">50+</p>
                  <p className="mt-1 text-sm text-gray-400">US Cities</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#8B1E2D]">100%</p>
                  <p className="mt-1 text-sm text-gray-400">LGBTQ+ Affirming</p>
                </div>
              </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          delay: noDelay ?? 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-center"
      >
        <p className="text-xs uppercase tracking-widest text-gray-500">Scroll to explore</p>
        <svg
          className="mx-auto mt-2 h-5 w-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
