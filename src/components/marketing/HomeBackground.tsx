"use client";

import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/motion/FloatingParticles";
import { PointerGlow } from "@/components/motion/PointerGlow";

export function HomeBackground() {
  return (
    <>
      <FloatingParticles />
      <PointerGlow />

      {/* Orange breathing blob — top right */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed right-[-10vw] top-[-10vh] z-0 h-[55vw] max-h-[700px] w-[55vw] max-w-[700px] rounded-full opacity-[0.18]"
        style={{ background: "radial-gradient(circle, #C8102E 0%, transparent 70%)" }}
        animate={{ y: [-18, 18, -18], scale: [1, 1.04, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blue breathing blob — bottom left */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-[-12vh] left-[-8vw] z-0 h-[50vw] max-h-[600px] w-[50vw] max-w-[600px] rounded-full opacity-[0.14]"
        style={{ background: "radial-gradient(circle, #C8102E 0%, transparent 70%)" }}
        animate={{ y: [16, -16, 16], scale: [1, 1.06, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
      />
    </>
  );
}
