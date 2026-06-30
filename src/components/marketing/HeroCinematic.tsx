"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BreathingGlow } from "@/components/motion/BreathingGlow";
import { GrainOverlay } from "@/components/motion/GrainOverlay";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function HeroCinematic() {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const dur = reducedMotion ? 0 : 0.8;
  const noDelay = reducedMotion ? 0 : undefined;

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0F1419] via-[#1a1f2e] to-[#0F1419]">
      <GrainOverlay opacity={0.03} className="z-[2]" />
      <BreathingGlow
        color="rgba(139, 30, 45, 0.08)"
        size={600}
        duration={8}
        className="right-[5%] top-[10%] z-[1]"
      />

      {/* Grid texture background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(139, 30, 45, 0.05) 25%, rgba(139, 30, 45, 0.05) 26%, transparent 27%, transparent 74%, rgba(139, 30, 45, 0.05) 75%, rgba(139, 30, 45, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(139, 30, 45, 0.05) 25%, rgba(139, 30, 45, 0.05) 26%, transparent 27%, transparent 74%, rgba(139, 30, 45, 0.05) 75%, rgba(139, 30, 45, 0.05) 76%, transparent 77%, transparent)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: Headline & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur, ease: customEase, delay: noDelay }}
              className="flex flex-col justify-center"
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

            {/* Right: Cinematic Visual (Premium interface mockup) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: dur + 0.2, ease: customEase, delay: noDelay ?? 0.25 }}
              className="relative"
            >
              {/* Glassmorphism card with interface mockup */}
              <div className="relative h-[500px] overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-8 backdrop-blur-md sm:h-[600px]">
                {/* Decorative glow circles */}
                <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#8B1E2D]/20 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[#8B1E2D]/10 blur-3xl" />

                {/* Interface content */}
                <div className="relative z-10 flex h-full flex-col">
                  {/* Header */}
                  <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-[#8B1E2D]">
                        Knotty AI Discovery
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Smart therapist matching
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8B1E2D]/20 text-[#8B1E2D]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                        <path d="M12 11h-1v-1h1v1zm2 0h-1v-1h1v1z" />
                      </svg>
                    </div>
                  </div>

                  {/* Conversation preview */}
                  <div className="flex-1 space-y-4 overflow-hidden">
                    <div className="flex items-end gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#8B1E2D]/30" />
                      <div className="rounded-2xl rounded-bl-none bg-[#8B1E2D]/15 px-4 py-3 text-sm text-gray-200">
                        <p className="font-semibold">What's your ideal massage style?</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-br-none bg-[#8B1E2D] px-4 py-3 text-sm text-white">
                        <p className="font-semibold">Deep tissue, preferably outcall</p>
                      </div>
                    </div>

                    <div className="flex items-end gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#8B1E2D]/30" />
                      <div className="rounded-2xl rounded-bl-none bg-[#8B1E2D]/15 px-4 py-3 text-sm text-gray-200">
                        <p className="font-semibold">Found 3 perfect matches for you</p>
                      </div>
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="mt-6 flex gap-2 border-t border-white/10 pt-6">
                    <input
                      type="text"
                      placeholder="Ask anything..."
                      disabled
                      className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 placeholder-gray-500 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      disabled
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8B1E2D] text-white transition hover:bg-[#6E1521]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.9429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.01449553 C3.34915502,0.9999968 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99047222 L3.03521743,10.4314652 C3.03521743,10.5885626 3.19218622,10.7456601 3.50612381,10.7456601 L16.6915026,11.5311469 C16.6915026,11.5311469 17.1624089,11.5311469 17.1624089,11.0598548 L17.1624089,12.0024392 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.5 }}
                className="absolute -bottom-8 right-8 rounded-full border border-white/20 bg-[#0F1419]/80 px-6 py-3 backdrop-blur-md"
              >
                <p className="text-center text-xs font-semibold text-gray-300">
                  Powered by <span className="text-[#8B1E2D]">Knotty AI</span>
                </p>
              </motion.div>
            </motion.div>
          </div>
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
