import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glareEnabled?: boolean;
  maxTilt?: number;
}

export const TiltCard = ({
  children,
  className,
  glareEnabled = true,
  maxTilt = 15,
}: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);

    setTransform({
      rotateX: -percentY * maxTilt,
      rotateY: percentX * maxTilt,
    });

    if (glareEnabled) {
      setGlare({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
        opacity: 0.15,
      });
    }
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={transform}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className={cn("relative", className)}
    >
      {children}

      {/* Light reflection glare */}
      {glareEnabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
          animate={{ opacity: glare.opacity }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, hsla(0,0%,100%,0.25) 0%, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
};
