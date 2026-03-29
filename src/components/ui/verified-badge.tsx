import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export const VerifiedBadge = ({ size = "md", className }: VerifiedBadgeProps) => {
  const isSmall = size === "sm";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full font-semibold select-none",
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        "bg-primary/10 text-primary border border-primary/25",
        "backdrop-blur-sm",
        className,
      )}
    >
      {/* Soft shadow glow */}
      <span
        className="absolute -inset-[2px] rounded-full pointer-events-none"
        style={{
          boxShadow: "0 0 10px 2px hsl(var(--primary) / 0.24), 0 0 20px 4px hsl(var(--primary) / 0.12)",
        }}
      />

      <CheckCircle2 className={cn("shrink-0", isSmall ? "w-2.5 h-2.5" : "w-3.5 h-3.5")} />
      <span className="relative z-10 tracking-wide uppercase">ID Verified</span>
    </motion.div>
  );
};
