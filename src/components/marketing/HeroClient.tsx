"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { CityGlobe } from "@/components/marketing/CityGlobe";

const avatarStack = [
  { id: 1, src: "/marketing/hero/avatar-1.jpg", alt: "Verified therapist", initials: "JM", color: "from-orange-500 to-amber-600" },
  { id: 2, src: "/marketing/hero/avatar-2.jpg", alt: "Verified therapist", initials: "RK", color: "from-blue-600 to-indigo-700" },
  { id: 3, src: "/marketing/hero/avatar-3.jpg", alt: "Verified therapist", initials: "AL", color: "from-teal-500 to-cyan-600" },
  { id: 4, src: "/marketing/hero/avatar-4.jpg", alt: "Verified therapist", initials: "DV", color: "from-violet-600 to-purple-700" },
];

const headlineLines = ["The", "Safest", "Massage", "Directory."];
const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CHAR_STAGGER = 0.045;
const TYPE_START = 0.3;

// Pre-compute per-line start delays and total typing duration
const lineStartDelays: number[] = [];
let _charCount = 0;
for (const line of headlineLines) {
  lineStartDelays.push(TYPE_START + _charCount * CHAR_STAGGER);
  _charCount += line.length;
}
const TYPING_END = TYPE_START + _charCount * CHAR_STAGGER;

export default function HeroClient() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative bg-background text-foreground">
      {!reducedMotion && (
        <style>{`@keyframes _blink{0%,100%{opacity:1}50%{opacity:0}}._cursor{animation:_blink 0.65s step-end infinite}`}</style>
      )}
      <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pb-20 lg:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* ── Left: copy ─────────────────────────────────────────────── */}
          <div>
            <div className="mb-8 flex items-center gap-3 lg:mb-10">
              <div className="flex -space-x-3">
                {avatarStack.map((avatar, index) => (
                  <motion.div
                    key={avatar.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reducedMotion ? 0 : 0.7,
                      ease: customEase,
                      delay: reducedMotion ? 0 : 0.1 + index * 0.08,
                    }}
                    className={`relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br ring-2 ring-background ${avatar.color} flex items-center justify-center`}
                  >
                    <span className="absolute inset-0 z-0 flex select-none items-center justify-center text-[10px] font-bold text-white/80">
                      {avatar.initials}
                    </span>
                    <Image src={avatar.src} alt={avatar.alt} fill className="z-10 object-cover" sizes="44px" />
                  </motion.div>
                ))}
              </div>

              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.7,
                  ease: customEase,
                  delay: reducedMotion ? 0 : 0.1 + avatarStack.length * 0.08,
                }}
                className="text-sm font-medium text-muted-foreground md:text-base"
              >
                500+ professional therapists nationwide
              </motion.span>
            </div>

            <h1 className="mb-6 font-display text-[clamp(3rem,8.5vw,6.5rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.05em]">
              {headlineLines.map((line, i) => (
                <motion.span
                  key={`${line}-${i}`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: reducedMotion ? 0 : CHAR_STAGGER,
                        delayChildren: reducedMotion ? 0 : lineStartDelays[i],
                      },
                    },
                  }}
                  className="block"
                >
                  {line.split("").map((char, j) => (
                    <motion.span
                      key={j}
                      variants={{
                        hidden: { opacity: reducedMotion ? 1 : 0 },
                        visible: { opacity: 1, transition: { duration: 0 } },
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}

                  {line === "Massage" && (
                    <motion.span
                      aria-hidden="true"
                      variants={
                        reducedMotion
                          ? {}
                          : {
                              hidden: { opacity: 0, scale: 0 },
                              visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: customEase } },
                            }
                      }
                      className="ml-2 inline-flex h-[0.9em] w-[0.9em] rounded-full bg-primary align-middle"
                    />
                  )}

                  {i === headlineLines.length - 1 && !reducedMotion && (
                    <motion.span
                      aria-hidden="true"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 1, 0] }}
                      transition={{ delay: TYPING_END, duration: 2.0, times: [0, 0.04, 0.85, 1], ease: "linear" }}
                      className="relative -top-[0.04em] ml-2 inline-block align-middle"
                    >
                      <span className="_cursor inline-block h-[0.8em] w-[0.055em] bg-current" />
                    </motion.span>
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: customEase, delay: reducedMotion ? 0 : TYPING_END + 0.1 }}
              className="speakable-intro mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:text-xl"
            >
              Premium male massage therapists across the US. Screened profiles, licensed
              professionals, real reviews — in Dallas, Houston, Miami, NYC, and 80+ cities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: customEase, delay: reducedMotion ? 0 : TYPING_END + 0.2 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/search"
                className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 font-semibold text-primary-foreground transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              >
                Find a therapist
              </Link>
              <Link
                href="/for-therapists"
                className="inline-flex h-14 items-center justify-center rounded-full border border-border bg-transparent px-8 font-semibold text-foreground transition-all duration-200 hover:border-foreground hover:bg-accent/50"
              >
                List your practice
              </Link>
            </motion.div>
          </div>

          {/* ── Right: interactive 3D globe ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 1.1, ease: customEase, delay: reducedMotion ? 0 : 0.2 }}
            className="relative"
          >
            <CityGlobe />
            <div className="pointer-events-none mt-2 flex items-center justify-center gap-2 text-center">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Live coverage · 57+ cities · drag to explore
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Cinematic cover band (scroll reward) ─────────────────────── */}
      <motion.div
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        whileInView={{ clipPath: "inset(0% 0 0 0)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: reducedMotion ? 0 : 1.0, ease: customEase }}
        className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-video lg:aspect-[21/9]"
      >
        <Image
          src="/marketing/hero/cover.jpg"
          alt="Professional massage therapy — editorial hero"
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
      </motion.div>
    </section>
  );
}
