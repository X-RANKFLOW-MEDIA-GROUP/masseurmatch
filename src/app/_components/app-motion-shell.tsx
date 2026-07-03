"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function AppMotionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useHydratedReducedMotion();
  const pointerX = useMotionValue(-999);
  const pointerY = useMotionValue(-999);
  const pointerOpacity = useMotionValue(0);
  const glowX = useSpring(pointerX, { stiffness: 140, damping: 26, mass: 0.8 });
  const glowY = useSpring(pointerY, { stiffness: 140, damping: 26, mass: 0.8 });
  const glowOpacity = useSpring(pointerOpacity, { stiffness: 120, damping: 24, mass: 0.8 });

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      pointerOpacity.set(1);
    };

    const handlePointerLeave = () => {
      pointerOpacity.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [pointerOpacity, pointerX, pointerY, reduceMotion]);

  return (
    <>
      <ScrollProgress />

      {!reduceMotion ? (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="site-ambient-glow site-ambient-glow-left" />
          <div className="site-ambient-glow site-ambient-glow-right" />
          <motion.div className="cursor-glow hidden lg:block" style={{ x: glowX, y: glowY, opacity: glowOpacity }} />
        </div>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          className="page-transition-shell relative z-[1] pt-16"
          suppressHydrationWarning
          initial={reduceMotion ? undefined : { opacity: 0, y: 24, filter: "blur(12px)" }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -12, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </>
  );
}
