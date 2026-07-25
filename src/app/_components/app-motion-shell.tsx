"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function AppMotionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useHydratedReducedMotion();

  return (
    <>
      <ScrollProgress />
      <motion.main
        key={pathname}
        className="page-transition-shell relative z-[1] pt-16"
        suppressHydrationWarning
        initial={reduceMotion ? false : { opacity: 0.98, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: EASE }}
      >
        {children}
      </motion.main>
    </>
  );
}
