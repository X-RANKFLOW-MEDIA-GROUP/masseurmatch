"use client";

import { motion, type Variants, useReducedMotion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, staggerContainer } from "@/components/animations/MicroInteractions";

export interface AdvancedHeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  cta?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
  gradient?: boolean;
  parallax?: boolean;
  animated?: boolean;
}

export function AdvancedHeroSection({
  title,
  subtitle,
  description,
  cta,
  backgroundImage,
  gradient = true,
  parallax = true,
  animated = true,
}: AdvancedHeroSectionProps) {
  const HERO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!parallax) return;

    let rafId: number;
    let lastOffset = 0;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newOffset = window.scrollY * 0.5;
        if (Math.abs(newOffset - lastOffset) > 2) {
          lastOffset = newOffset;
          setOffset(newOffset);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [parallax]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: HERO_EASE,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Layer */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translateY(${offset}px)`,
          willChange: "transform",
        }}
      >
        {gradient && !backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-electric opacity-90" />
        )}
        {gradient && backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/70 via-brand-secondary/60 to-brand-electric/50" />
        )}
      </div>

      {/* Animated Background Elements */}
      {animated && (
        <>
          <motion.div
            className="absolute top-20 -left-40 w-80 h-80 bg-brand-accent/20 rounded-full blur-3xl"
            animate={reducedMotion ? {} : {
              y: [0, -20, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "mirror",
              type: "tween",
            }}
            style={{ willChange: reducedMotion ? "auto" : "transform" }}
          />
          <motion.div
            className="absolute bottom-20 -right-40 w-96 h-96 bg-brand-electric/20 rounded-full blur-3xl"
            animate={reducedMotion ? {} : {
              y: [0, 20, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "mirror",
              type: "tween",
            }}
            style={{ willChange: reducedMotion ? "auto" : "transform" }}
          />
        </>
      )}

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-4 py-20 text-center max-w-4xl mx-auto"
      >
        {subtitle && (
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white">
              {subtitle}
            </span>
          </motion.div>
        )}

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight"
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
        )}

        {cta && (
          <motion.div variants={itemVariants}>
            <motion.a
              href={cta.href}
              className="inline-block px-8 py-4 bg-white text-brand-primary font-semibold rounded-lg hover:bg-white/90 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cta.text}
            </motion.a>
          </motion.div>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      {animated && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={reducedMotion ? {} : { y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, type: "tween" }}
          style={{ willChange: reducedMotion ? "auto" : "transform" }}
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-center justify-center">
            <div className="w-1 h-2 bg-white/40 rounded-full"></div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
