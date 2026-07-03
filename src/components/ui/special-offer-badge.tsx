import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecialOfferBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export const SpecialOfferBadge = ({ size = "md", className }: SpecialOfferBadgeProps) => {
  const isSmall = size === "sm";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full font-semibold select-none uppercase tracking-[0.18em]",
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[10px]",
        "bg-accent/10 text-accent-foreground border border-accent/30",
        "backdrop-blur-sm",
        className,
      )}
    >
      {/* Soft shadow glow */}
      <span
        className="absolute -inset-[2px] rounded-full pointer-events-none"
        style={{
          boxShadow: "0 0 10px 2px hsl(var(--accent) / 0.28), 0 0 20px 4px hsl(var(--accent) / 0.14)",
        }}
      />

      <Tag className={cn("shrink-0", isSmall ? "w-2.5 h-2.5" : "w-3.5 h-3.5")} />
      <span className="relative z-10">Special Offer</span>
    </motion.div>
  );
};
