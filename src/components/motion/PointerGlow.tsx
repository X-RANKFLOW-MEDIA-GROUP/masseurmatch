"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function PointerGlow() {
  const x = useMotionValue(-240);
  const y = useMotionValue(-240);
  const springX = useSpring(x, { stiffness: 80, damping: 22 });
  const springY = useSpring(y, { stiffness: 80, damping: 22 });

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX - 140);
      y.set(event.clientY - 140);
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: springX,
        y: springY,
        position: "fixed",
        zIndex: 1,
        width: 280,
        height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,138,31,.16), transparent 66%)",
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
}
