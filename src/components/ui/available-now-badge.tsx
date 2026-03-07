import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailableNowBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export const AvailableNowBadge = ({ size = "md", className }: AvailableNowBadgeProps) => {
  const isSmall = size === "sm";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full font-semibold select-none",
        isSmall ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        "backdrop-blur-sm",
        className,
      )}
    >
      {/* Outer glow ring */}
      <span className="absolute inset-0 rounded-full animate-ping bg-emerald-500/10 pointer-events-none" />
      {/* Soft shadow glow */}
      <span
        className="absolute -inset-[2px] rounded-full pointer-events-none"
        style={{
          boxShadow: "0 0 12px 2px hsl(145 80% 42% / 0.35), 0 0 24px 4px hsl(145 80% 42% / 0.15)",
        }}
      />

      {/* Green pulsing dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>

      <Zap className={cn("shrink-0", isSmall ? "w-3 h-3" : "w-3.5 h-3.5")} />
      <span className="relative z-10 tracking-wide uppercase">Available Now</span>
    </motion.div>
  );
};
