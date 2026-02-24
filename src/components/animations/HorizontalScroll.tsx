import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  /** How many "screens" wide the horizontal content is (default: auto based on children count) */
  panels?: number;
}

/**
 * Converts vertical scroll into horizontal movement.
 * The section pins in place while content scrolls sideways.
 */
export const HorizontalScroll = ({ children, className, panels = 3 }: HorizontalScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map vertical scroll → horizontal translate
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${((panels - 1) / panels) * 100}%`]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{ height: `${panels * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div
          className="flex h-full"
          style={{ x, width: `${panels * 100}vw` }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Individual panel inside HorizontalScroll.
 */
export const HorizontalPanel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("w-screen h-screen flex items-center justify-center flex-shrink-0 px-8", className)}>
    {children}
  </div>
);
