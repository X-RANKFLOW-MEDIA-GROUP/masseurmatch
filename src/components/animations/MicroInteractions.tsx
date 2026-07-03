"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.05,
      ease: EASE,
    },
  }),
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.05,
      ease: EASE,
    },
  }),
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: (i = 1) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.05,
      ease: EASE,
    },
  }),
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.05,
      ease: EASE,
    },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 1) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.05,
      ease: EASE,
    },
  }),
};

export const rotateIn = {
  hidden: { opacity: 0, rotate: -10 },
  visible: (i = 1) => ({
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.05,
      ease: EASE,
    },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const hoverScale = {
  whileHover: { scale: 1.03, transition: { duration: 0.3 } },
  whileTap: { scale: 0.97 },
};

export const hoverScaleSmall = {
  whileHover: { scale: 1.02, transition: { duration: 0.3 } },
  whileTap: { scale: 0.98 },
};

export const hoverScaleLarge = {
  whileHover: { scale: 1.06, transition: { duration: 0.4 } },
  whileTap: { scale: 0.94 },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: "0 0 30px rgba(47, 111, 228, 0.3)",
    transition: { duration: 0.3 },
  },
};

export const hoverLift = {
  whileHover: {
    y: -6,
    boxShadow: "0 20px 50px rgba(11, 31, 58, 0.15)",
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedText({ text, className = "", delay = 0 }: AnimatedTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {text}
    </motion.div>
  );
}

interface StaggerListProps {
  children: React.ReactNode[];
  className?: string;
}

export function StaggerList({ children, className = "space-y-4" }: StaggerListProps) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={className}>
      {children.map((child, i) => (
        <motion.div key={i} variants={fadeInUp} custom={i}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export function Parallax({ children, offset = 50, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const distY = e.clientY - centerY;
        const offsetFactor = Math.max(0.05, Math.min(0.2, offset / 500));
        setY(distY * offsetFactor);
      }, 16);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [offset]);

  return (
    <motion.div ref={ref} className={className} style={{ y, willChange: "transform" }} transition={{ type: "spring", stiffness: 100, damping: 10 }}>
      {children}
    </motion.div>
  );
}

interface FloatingBadgeProps {
  text: string;
  delay?: number;
}

export function FloatingBadge({ text, delay = 0 }: FloatingBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay, type: "spring", stiffness: 100 } }}
      className="inline-block rounded-full border border-brand-electric/20 bg-brand-electric/10 px-4 py-2 text-sm font-medium text-brand-electric"
    >
      {text}
    </motion.div>
  );
}

interface GradientTextProps {
  text: string;
  className?: string;
}

export function GradientText({ text, className = "" }: GradientTextProps) {
  return (
    <motion.span
      className={`bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-electric bg-clip-text text-transparent ${className}`}
      initial={{ backgroundPosition: "0% 50%" }}
      animate={{ backgroundPosition: "100% 50%" }}
      transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      style={{ backgroundSize: "200% 200%" }}
    >
      {text}
    </motion.span>
  );
}

export interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: "fadeInUp" | "fadeInLeft" | "fadeInRight" | "scaleIn";
  threshold?: number;
}

export function ScrollReveal({ children, variant = "fadeInUp", threshold = 0.2 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const variants = {
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    scaleIn,
  };

  return (
    <motion.div ref={ref} variants={variants[variant]} initial="hidden" animate={isInView ? "visible" : "hidden"}>
      {children}
    </motion.div>
  );
}

export const tabAnimation = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function AnimatedTabs({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: Array<{ label: string; id: string }>;
  activeTab: string;
  setActiveTab: (id: string) => void;
}) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "border-b-2 border-brand-primary text-brand-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          {tab.label}
          {activeTab === tab.id ? (
            <motion.div
              layoutId="underline"
              className="h-0.5 bg-brand-primary"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          ) : null}
        </motion.button>
      ))}
    </div>
  );
}

export function CounterAnimation({
  from = 0,
  to,
  duration = 1,
  suffix = "",
}: {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(from);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / (duration * 1000);
      const value = progress >= 1 ? to : from + (to - from) * progress;
      setCount(Math.floor(value));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}
