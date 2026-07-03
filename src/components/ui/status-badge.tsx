import { motion } from "framer-motion";
import {
  Zap,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  CheckCircle2,
  Heart,
  Star,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeType =
  | "available-now"
  | "visiting-now"
  | "visiting-soon"
  | "traveling"
  | "new-profile"
  | "featured"
  | "sponsored"
  | "promoted"
  | "boosted"
  | "elite"
  | "verified-photo"
  | "photo-reviewed"
  | "profile-reviewed"
  | "location-confirmed"
  | "contact-verified"
  | "email-verified"
  | "phone-verified"
  | "lgbtq-safe"
  | "community-vetted"
  | "credentials";

interface StatusBadgeProps {
  type: BadgeType;
  size?: "sm" | "md";
  className?: string;
  animate?: boolean;
}

const badgeConfig: Record<
  BadgeType,
  {
    label: string;
    icon: React.ElementType;
    colors: {
      bg: string;
      text: string;
      border: string;
      glow?: string;
    };
    pulse?: boolean;
  }
> = {
  "available-now": {
    label: "Available Now",
    icon: Zap,
    colors: {
      bg: "bg-[hsl(var(--success)/0.1)]",
      text: "text-[hsl(var(--success))]",
      border: "border-[hsl(var(--success)/0.25)]",
      glow: "hsl(var(--success))",
    },
    pulse: true,
  },
  "visiting-now": {
    label: "Visiting Now",
    icon: MapPin,
    colors: {
      bg: "bg-[hsl(var(--badge-promo)/0.1)]",
      text: "text-[hsl(var(--badge-promo))]",
      border: "border-[hsl(var(--badge-promo)/0.25)]",
      glow: "hsl(var(--badge-promo))",
    },
    pulse: true,
  },
  "visiting-soon": {
    label: "Visiting Soon",
    icon: MapPin,
    colors: {
      bg: "bg-[hsl(var(--badge-promo)/0.08)]",
      text: "text-[hsl(var(--badge-promo))]",
      border: "border-[hsl(var(--badge-promo)/0.2)]",
    },
  },
  traveling: {
    label: "Traveling",
    icon: TrendingUp,
    colors: {
      bg: "bg-[hsl(var(--warning)/0.1)]",
      text: "text-[hsl(var(--warning))]",
      border: "border-[hsl(var(--warning)/0.25)]",
    },
  },
  "new-profile": {
    label: "New Profile",
    icon: Sparkles,
    colors: {
      bg: "bg-[hsl(var(--primary)/0.1)]",
      text: "text-[hsl(var(--primary))]",
      border: "border-[hsl(var(--primary)/0.2)]",
    },
  },
  featured: {
    label: "Featured",
    icon: Star,
    colors: {
      bg: "bg-[hsl(var(--badge-promo)/0.12)]",
      text: "text-[hsl(var(--badge-promo))]",
      border: "border-[hsl(var(--badge-promo)/0.25)]",
    },
  },
  sponsored: {
    label: "Sponsored",
    icon: TrendingUp,
    colors: {
      bg: "bg-[hsl(var(--primary)/0.08)]",
      text: "text-[hsl(var(--primary))]",
      border: "border-[hsl(var(--primary)/0.2)]",
    },
  },
  promoted: {
    label: "Promoted",
    icon: Sparkles,
    colors: {
      bg: "bg-[hsl(var(--primary)/0.08)]",
      text: "text-[hsl(var(--primary))]",
      border: "border-[hsl(var(--primary)/0.2)]",
    },
  },
  boosted: {
    label: "Boosted",
    icon: TrendingUp,
    colors: {
      bg: "bg-[hsl(var(--badge-promo)/0.1)]",
      text: "text-[hsl(var(--badge-promo))]",
      border: "border-[hsl(var(--badge-promo)/0.25)]",
    },
  },
  elite: {
    label: "Elite Provider",
    icon: Award,
    colors: {
      bg: "bg-[hsl(var(--primary)/0.1)]",
      text: "text-[hsl(var(--primary))]",
      border: "border-[hsl(var(--primary)/0.2)]",
    },
  },
  "verified-photo": {
    label: "Verified Photo",
    icon: BadgeCheck,
    colors: {
      bg: "bg-[hsl(var(--badge-verified)/0.1)]",
      text: "text-[hsl(var(--badge-verified))]",
      border: "border-[hsl(var(--badge-verified)/0.25)]",
    },
  },
  "photo-reviewed": {
    label: "Photo Reviewed",
    icon: CheckCircle2,
    colors: {
      bg: "bg-[hsl(var(--badge-verified)/0.1)]",
      text: "text-[hsl(var(--badge-verified))]",
      border: "border-[hsl(var(--badge-verified)/0.25)]",
    },
  },
  "profile-reviewed": {
    label: "Profile Reviewed",
    icon: CheckCircle2,
    colors: {
      bg: "bg-[hsl(var(--badge-verified)/0.1)]",
      text: "text-[hsl(var(--badge-verified))]",
      border: "border-[hsl(var(--badge-verified)/0.25)]",
    },
  },
  "location-confirmed": {
    label: "Location Confirmed",
    icon: MapPin,
    colors: {
      bg: "bg-[hsl(var(--badge-verified)/0.1)]",
      text: "text-[hsl(var(--badge-verified))]",
      border: "border-[hsl(var(--badge-verified)/0.25)]",
    },
  },
  "contact-verified": {
    label: "Contact Verified",
    icon: ShieldCheck,
    colors: {
      bg: "bg-[hsl(var(--badge-verified)/0.1)]",
      text: "text-[hsl(var(--badge-verified))]",
      border: "border-[hsl(var(--badge-verified)/0.25)]",
    },
  },
  "email-verified": {
    label: "Email Verified",
    icon: BadgeCheck,
    colors: {
      bg: "bg-[hsl(var(--badge-verified)/0.1)]",
      text: "text-[hsl(var(--badge-verified))]",
      border: "border-[hsl(var(--badge-verified)/0.25)]",
    },
  },
  "phone-verified": {
    label: "Phone Verified",
    icon: BadgeCheck,
    colors: {
      bg: "bg-[hsl(var(--badge-verified)/0.1)]",
      text: "text-[hsl(var(--badge-verified))]",
      border: "border-[hsl(var(--badge-verified)/0.25)]",
    },
  },
  "lgbtq-safe": {
    label: "LGBTQ+ Safe Space",
    icon: Heart,
    colors: {
      bg: "bg-[hsl(var(--primary)/0.08)]",
      text: "text-[hsl(var(--primary))]",
      border: "border-[hsl(var(--primary)/0.2)]",
    },
  },
  "community-vetted": {
    label: "Community Vetted",
    icon: Star,
    colors: {
      bg: "bg-[hsl(var(--badge-verified)/0.1)]",
      text: "text-[hsl(var(--badge-verified))]",
      border: "border-[hsl(var(--badge-verified)/0.25)]",
    },
  },
  credentials: {
    label: "Credentials Provided",
    icon: BadgeCheck,
    colors: {
      bg: "bg-[hsl(var(--badge-verified)/0.1)]",
      text: "text-[hsl(var(--badge-verified))]",
      border: "border-[hsl(var(--badge-verified)/0.25)]",
    },
  },
};

export const StatusBadge = ({
  type,
  size = "md",
  className,
  animate = true,
}: StatusBadgeProps) => {
  const config = badgeConfig[type];
  const isSmall = size === "sm";
  const Icon = config.icon;

  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      transition={animate ? { duration: 0.3 } : undefined}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full font-semibold select-none uppercase tracking-[0.18em]",
        isSmall ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[10px]",
        "border backdrop-blur-sm",
        config.colors.bg,
        config.colors.text,
        config.colors.border,
        className,
      )}
    >
      {/* Pulsing outer ring for active status */}
      {config.pulse && (
        <span className="absolute inset-0 rounded-full animate-pulse bg-current opacity-10 pointer-events-none" />
      )}

      {/* Soft glow shadow */}
      {config.glow && (
        <span
          className="absolute -inset-[2px] rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 12px 2px ${config.glow}33, 0 0 24px 4px ${config.glow}18`,
          }}
        />
      )}

      {/* Active status dot (for "now" badges) */}
      {(type === "available-now" || type === "visiting-now") && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}

      <Icon className={cn("shrink-0", isSmall ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2.25} />
      <span className="relative z-10">{config.label}</span>
    </motion.div>
  );
};

export type { BadgeType };
