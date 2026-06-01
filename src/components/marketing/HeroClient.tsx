"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Globe, Search } from "lucide-react";
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
    // Deep-navy first fold tuned to match the site footer (#060E1A).
    <section className="relative overflow-hidden bg-[#060E1A] text-foreground">
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

      {/* ── Premium first-fold backdrop (footer-matched, restrained) ──── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Fine dot grid, radially masked */}
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_55%_30%,black,transparent_70%)]" />
        {/* Warm orange glow behind the globe — breathes slowly */}
        <motion.div
          className="absolute -right-[6%] top-[4%] h-[46vw] max-h-[560px] w-[46vw] max-w-[560px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(255,138,31,0.24), transparent 65%)" }}
          animate={reducedMotion ? undefined : { opacity: [0.65, 1, 0.65], scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Cool depth glow, very subtle */}
        <div className="absolute -bottom-[15%] -left-[8%] h-[40vw] max-h-[460px] w-[40vw] max-w-[460px] rounded-full bg-[radial-gradient(circle,rgba(30,75,143,0.18),transparent_65%)] blur-[100px]" />
        {/* Top hairline + vignette */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,transparent_55%,rgba(3,6,13,0.55)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pb-20 lg:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* ── Left: copy ─────────────────────────────────────────────── */}
          <div>
            {/* Trust chip — glass + mono micro-label, mirrors the footer */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: customEase, delay: reducedMotion ? 0 : 0.1 }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4 backdrop-blur lg:mb-10"
            >
              <div className="flex -space-x-2.5">
                {avatarStack.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`relative flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ring-2 ring-[#060E1A] ${avatar.color}`}
                  >
                    <span className="absolute inset-0 z-0 flex select-none items-center justify-center text-[8px] font-bold text-white/80">
                      {avatar.initials}
                    </span>
                    <Image src={avatar.src} alt={avatar.alt} fill className="z-10 object-cover" sizes="28px" />
                  </div>
                ))}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-300">
                500+ therapists nationwide
              </span>
            </motion.div>

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
                              visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: customEase } },
                            }
                      }
                      className="relative ml-2 inline-flex h-[0.8em] w-[0.8em] align-middle"
                    >
                      {!reducedMotion && (
                        <>
                          <span className="_dotping absolute inset-0 rounded-full bg-primary/60" />
                          <span className="_dotping2 absolute inset-0 rounded-full bg-primary/40" />
                        </>
                      )}
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
              className="speakable-intro mb-8 max-w-xl text-lg leading-relaxed text-slate-300 lg:text-xl"
            >
              Premium male massage therapists across the US — real profiles, real reviews,
              and AI-powered search with Knotty. Dallas, Houston, Miami, NYC, and 80+ cities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: customEase, delay: reducedMotion ? 0 : TYPING_END + 0.2 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/search"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 font-semibold text-primary-foreground transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/25"
              >
                <Search className="h-5 w-5" strokeWidth={2.25} />
                Find a therapist
              </Link>
              <Link
                href="/for-therapists"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-8 font-semibold text-foreground backdrop-blur transition-all duration-200 hover:border-white/25 hover:bg-white/[0.08]"
              >
                Join the network
                <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
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
            <div className="pointer-events-none mt-3 flex items-center justify-center gap-2 text-center">
              <Globe className="h-3.5 w-3.5 text-primary" strokeWidth={2.25} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
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
        className="relative z-10 aspect-[4/3] w-full overflow-hidden sm:aspect-video lg:aspect-[21/9]"
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060E1A]" />
      </motion.div>
    </section>
  );
}
