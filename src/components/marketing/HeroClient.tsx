"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

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
    <section className="bg-background text-foreground">
      {!reducedMotion && (
        <style>{`@keyframes _blink{0%,100%{opacity:1}50%{opacity:0}}._cursor{animation:_blink 0.65s step-end infinite}`}</style>
      )}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="flex items-center gap-3 mb-12 lg:mb-16">
          <div className="flex -space-x-3">
            {avatarStack.map((avatar, index) => (
              <motion.div
                key={avatar.id}
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.8,
                  ease: customEase,
                  delay: reducedMotion ? 0 : 0.1 + index * 0.08,
                }}
                className={`relative w-12 h-12 rounded-full ring-2 ring-background overflow-hidden flex-shrink-0 bg-gradient-to-br ${avatar.color} flex items-center justify-center`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80 select-none z-0">
                  {avatar.initials}
                </span>
                <Image
                  src={avatar.src}
                  alt={avatar.alt}
                  fill
                  className="object-cover z-10"
                  sizes="48px"
                />
              </motion.div>
            ))}
          </div>

          <motion.span
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.8,
              ease: customEase,
              delay: reducedMotion ? 0 : 0.1 + avatarStack.length * 0.08,
            }}
            className="text-sm md:text-base text-muted-foreground font-medium whitespace-nowrap"
          >
            500+ Professional Therapists nationwide
          </motion.span>
        </div>

        <h1 className="font-display font-extrabold uppercase leading-[0.85] tracking-[-0.05em] text-[clamp(3.5rem,12vw,9.75rem)] mb-8 lg:mb-10">
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
                          visible: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.25, ease: customEase },
                          },
                        }
                  }
                  className="inline-flex align-middle ml-2 w-[0.9em] h-[0.9em] rounded-full bg-primary"
                />
              )}

              {i === headlineLines.length - 1 && !reducedMotion && (
                <motion.span
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    delay: TYPING_END,
                    duration: 2.0,
                    times: [0, 0.04, 0.85, 1],
                    ease: "linear",
                  }}
                  className="inline-block ml-2 align-middle relative -top-[0.04em]"
                >
                  <span className="_cursor inline-block w-[0.055em] h-[0.8em] bg-current" />
                </motion.span>
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.8,
            ease: customEase,
            delay: reducedMotion ? 0 : TYPING_END + 0.1,
          }}
          className="max-w-xl text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 lg:mb-12"
        >
          Premium male massage therapists across the US. Screened profiles, licensed professionals, real reviews. Find your therapist in Dallas, Houston, Miami, NYC, and 80+ cities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.8,
            ease: customEase,
            delay: reducedMotion ? 0 : TYPING_END + 0.25,
          }}
          className="flex flex-wrap gap-3 mb-12 lg:mb-16"
        >
          <Link
            href="/search"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary text-primary-foreground font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            Find a therapist
          </Link>
          <Link
            href="/for-therapists"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-border bg-transparent text-foreground font-semibold transition-all duration-200 hover:border-foreground hover:bg-accent/50"
          >
            List your practice
          </Link>
        </motion.div>

        <motion.div
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{
            duration: reducedMotion ? 0 : 1.0,
            ease: customEase,
            delay: reducedMotion ? 0 : 1.0,
          }}
          className="relative w-screen -mx-[calc(50vw-50%)] aspect-[4/3] sm:aspect-video lg:aspect-[21/9] overflow-hidden"
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
      </div>
    </section>
  );
}
