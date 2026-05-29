"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const avatarStack = [
  { id: 1, src: "/marketing/hero/avatar-1.jpg", alt: "Avatar 1" },
  { id: 2, src: "/marketing/hero/avatar-2.jpg", alt: "Avatar 2" },
  { id: 3, src: "/marketing/hero/avatar-3.jpg", alt: "Avatar 3" },
  { id: 4, src: "/marketing/hero/avatar-4.jpg", alt: "Avatar 4" },
];

const headlineLines = ["The", "Safest", "Massage", "Directory"];

// Animation config
const customEase = [0.22, 1, 0.36, 1] as any;

export function HeroMotionIsland() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Avatar Stack + Label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            ease: customEase,
          }}
          className="flex items-center gap-3 mb-12 lg:mb-16"
        >
          {/* Avatar Stack */}
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
                className="relative w-12 h-12 rounded-full ring-2 ring-background overflow-hidden flex-shrink-0"
              >
                <Image
                  src={avatar.src}
                  alt={avatar.alt}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </motion.div>
            ))}
          </div>

          {/* Label */}
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
            500+ Verified Therapists nationwide
          </motion.span>
        </motion.div>

        {/* Headline */}
        <div className="mb-8 lg:mb-10">
          {headlineLines.map((line, i) => (
            <motion.h1
              key={`${line}-${i}`}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.8,
                ease: customEase,
                delay: reducedMotion ? 0 : 0.2 + i * 0.12,
              }}
              className="font-display font-800 uppercase leading-[0.85] tracking-[-0.05em] text-[clamp(3.5rem,12vw,9.75rem)] block"
            >
              {line === "Massage" ? (
                <>
                  {line}
                  <span className="inline-flex align-middle ml-2 w-[0.9em] h-[0.9em] rounded-full bg-primary" />
                </>
              ) : (
                line
              )}
            </motion.h1>
          ))}
        </div>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.8,
            ease: customEase,
            delay: reducedMotion ? 0 : 0.2 + headlineLines.length * 0.12,
          }}
          className="max-w-xl text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 lg:mb-12"
        >
          Verified male massage therapists across the US. Background-checked profiles, licensed professionals, real reviews. Find your therapist in Dallas, Houston, Miami, NYC, and 80+ cities.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.8,
            ease: customEase,
            delay: reducedMotion ? 0 : 0.2 + (headlineLines.length + 1) * 0.12,
          }}
          className="flex flex-wrap gap-4 mb-16 lg:mb-24"
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

        {/* Full-bleed Image */}
        <motion.div
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{
            duration: reducedMotion ? 0 : 1.0,
            ease: customEase,
            delay: reducedMotion ? 0 : 1.0,
          }}
          className="relative w-screen -mx-[calc(50vw-50%)] aspect-video lg:aspect-[21/9] overflow-hidden rounded-none lg:rounded-2xl"
        >
          <Image
            src="/marketing/hero/cover.jpg"
            alt="Professional massage therapy"
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Hero Server Component Shell
 * Renders the HeroMotionIsland as a client component
 */
export function Hero() {
  return <HeroMotionIsland />;
}
