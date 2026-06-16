"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { CityGlobe } from "@/components/marketing/CityGlobe";
import { Cta3DButton } from "@/components/marketing/Cta3DButton";
import { HeroMediaBanner } from "@/components/marketing/HeroMediaBanner";
import { LIVE_COVERAGE_CITIES, TOTAL_CITY_PAGES } from "@/lib/site-stats";

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
    <section className="relative overflow-hidden bg-background text-foreground">
      {!reducedMotion && (
        <style>{`
          @keyframes _blink{0%,100%{opacity:1}50%{opacity:0}}
          ._cursor{animation:_blink 0.65s step-end infinite}
          @keyframes _dotping{0%{transform:scale(1);opacity:.55}70%,100%{transform:scale(2.6);opacity:0}}
          ._dotping{animation:_dotping 2.4s cubic-bezier(0,0,.2,1) infinite}
          ._dotping2{animation:_dotping 2.4s cubic-bezier(0,0,.2,1) infinite 1.2s}
          @keyframes _dotglow{0%,100%{box-shadow:0 0 14px 2px rgba(255,138,31,.35)}50%{box-shadow:0 0 24px 6px rgba(255,138,31,.6)}}
          ._dotcore{animation:_dotglow 2.4s ease-in-out infinite}
        `}</style>
      )}

      {/* ── Animated first-fold backdrop ─────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Faint grid, radially masked */}
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(ellipse_at_50%_35%,black,transparent_72%)]" />
        {/* Orange aurora */}
        <motion.div
          className="absolute -right-[12%] -top-[18%] h-[60vw] max-h-[640px] w-[60vw] max-w-[640px] rounded-full blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(255,138,31,0.42), transparent 65%)" }}
          animate={reducedMotion ? undefined : { x: [0, 30, 0], y: [0, 24, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Blue aurora */}
        <motion.div
          className="absolute -bottom-[22%] -left-[10%] h-[55vw] max-h-[580px] w-[55vw] max-w-[580px] rounded-full blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(30,75,143,0.5), transparent 65%)" }}
          animate={reducedMotion ? undefined : { x: [0, -26, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        {/* Soft top glow */}
        <div className="absolute left-1/2 top-0 h-[40vh] w-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,138,31,0.10),transparent_70%)] blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pb-20 lg:pt-28">
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
                    <span className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center text-[10px] font-bold text-white/80" aria-hidden="true">
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
                Professional therapists nationwide
              </motion.span>
            </div>

            <h1
              aria-label="The Safest Massage Directory."
              className="mb-6 font-display text-[clamp(3rem,8.5vw,6.5rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.05em]"
            >
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
                              visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: customEase } },
                            }
                      }
                      className="relative ml-2 inline-flex h-[0.8em] w-[0.8em] align-middle"
                    >
                      {/* Expanding "live signal" rings */}
                      {!reducedMotion && (
                        <>
                          <span className="_dotping absolute inset-0 rounded-full bg-primary/60" />
                          <span className="_dotping2 absolute inset-0 rounded-full bg-primary/40" />
                        </>
                      )}
                      {/* Core dot with a soft breathing glow */}
                      <span className="_dotcore relative inline-block h-full w-full rounded-full bg-primary" />
                    </motion.span>
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
              Premium male massage therapists across the US — real profiles, real reviews,
              and AI-powered search with Knotty. Dallas, Houston, Miami, NYC, and {LIVE_COVERAGE_CITIES}+ cities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: customEase, delay: reducedMotion ? 0 : TYPING_END + 0.2 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Cta3DButton href="/search" variant="primary">
                Find a therapist
              </Cta3DButton>
              <Cta3DButton href="/for-therapists" variant="dark" withIcon={false}>
                List your practice
              </Cta3DButton>
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
                Live coverage · {LIVE_COVERAGE_CITIES}+ cities · drag to explore
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Cinematic cover band (video on desktop, still on mobile) ──── */}
      <motion.div
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        whileInView={{ clipPath: "inset(0% 0 0 0)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: reducedMotion ? 0 : 1.0, ease: customEase }}
        className="relative z-10 w-full overflow-hidden"
      >
        <HeroMediaBanner reducedMotion={!!reducedMotion} />
      </motion.div>
    </section>
  );
}
