import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealDirection = "left" | "right" | "top" | "bottom";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  duration?: number;
  delay?: number;
  curtainColor?: string;
}

const clipPaths: Record<RevealDirection, { hidden: string; visible: string }> = {
  left: {
    hidden: "inset(0 0 0 0)",
    visible: "inset(0 0 0 100%)",
  },
  right: {
    hidden: "inset(0 0 0 0)",
    visible: "inset(0 100% 0 0)",
  },
  top: {
    hidden: "inset(0 0 0 0)",
    visible: "inset(100% 0 0 0)",
  },
  bottom: {
    hidden: "inset(0 0 0 0)",
    visible: "inset(0 0 100% 0)",
  },
};

export const ImageReveal = ({
  children,
  className,
  direction = "left",
  duration = 1,
  delay = 0,
  curtainColor = "hsl(0 0% 100%)",
}: ImageRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const paths = clipPaths[direction];

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* The curtain that wipes away */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{ backgroundColor: curtainColor }}
        initial={{ clipPath: paths.hidden }}
        animate={isInView ? { clipPath: paths.visible } : {}}
        transition={{
          duration,
          delay,
          ease: [0.77, 0, 0.175, 1], // custom cubic for cinematic feel
        }}
      />

      {/* Content scales up slightly as it's revealed */}
      <motion.div
        initial={{ scale: 1.3, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{
          duration: duration * 1.2,
          delay: delay + 0.15,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
