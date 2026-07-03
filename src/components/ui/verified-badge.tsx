import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
  className?: string;
  /** ISO timestamp from identity_verified_at; shows "Stripe Identity · Mon YYYY" when provided */
  verifiedAt?: string | null;
  /** Set to false when the badge is already inside a Link to avoid nested anchors (default: true for md, false for sm) */
  asLink?: boolean;
}

function formatVerifiedMonth(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export const VerifiedBadge = ({ size = "md", className, verifiedAt, asLink }: VerifiedBadgeProps) => {
  const isSmall = size === "sm";
  const shouldLink = asLink ?? !isSmall;
  const dateLabel = verifiedAt ? formatVerifiedMonth(verifiedAt) : null;

  const inner = (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full font-semibold select-none uppercase tracking-[0.18em]",
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[10px]",
        "bg-badge-verified-light text-badge-verified border border-badge-verified-border",
        "backdrop-blur-sm",
        className,
      )}
    >
      <span
        className="absolute -inset-[2px] rounded-full pointer-events-none"
        style={{
          boxShadow: "0 0 10px 2px hsl(var(--badge-verified) / 0.15), 0 0 20px 4px hsl(var(--badge-verified) / 0.08)",
        }}
      />
      <ShieldCheck className={cn("shrink-0", isSmall ? "w-2.5 h-2.5" : "w-3.5 h-3.5")} strokeWidth={2.25} />
      <span className="relative z-10 tracking-wide">
        Verified
        {dateLabel && !isSmall && (
          <span className="ml-1 opacity-70">· Stripe Identity · {dateLabel}</span>
        )}
      </span>
    </motion.div>
  );

  if (shouldLink) {
    return (
      <Link href="/verification" title="What does verified mean?" className="inline-flex">
        {inner}
      </Link>
    );
  }

  return inner;
};
