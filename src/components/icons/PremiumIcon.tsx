import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

type PremiumIconProps = {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "accent" | "inverse" | "soft" | "glass";
  className?: string;
  iconClassName?: string;
} & Omit<LucideProps, "size">;

const sizeMap: Record<NonNullable<PremiumIconProps["size"]>, string> = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

const iconSizeMap: Record<NonNullable<PremiumIconProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const toneMap: Record<NonNullable<PremiumIconProps["tone"]>, string> = {
  default:
    "border-border/80 bg-[linear-gradient(145deg,rgb(255_255_255/_0.98),rgb(var(--color-bg-body-rgb)/0.94))] text-action-secondary",
  accent:
    "border-brand-accent/40 bg-[linear-gradient(145deg,rgb(var(--color-brand-soft-accent-rgb)/0.98),rgb(var(--color-action-primary-rgb)/0.96))] text-brand-primary",
  inverse:
    "border-white/16 bg-[linear-gradient(145deg,rgb(var(--color-brand-secondary-rgb)/0.92),rgb(var(--color-brand-primary-rgb)))] text-white",
  soft:
    "border-border/75 bg-[linear-gradient(145deg,rgb(var(--color-bg-subtle-rgb)/0.96),rgb(255_255_255/_0.94))] text-brand-secondary",
  glass: "border-white/16 bg-white/10 text-white backdrop-blur-xl",
};

export function PremiumIcon({
  icon: Icon,
  size = "md",
  tone = "default",
  className,
  iconClassName,
  ...props
}: PremiumIconProps) {
  return (
    <span
      className={cn(
        "motion-premium inline-flex items-center justify-center rounded-full border shadow-[0_18px_40px_rgb(var(--color-brand-primary-rgb)/0.14)]",
        sizeMap[size],
        toneMap[tone],
        className,
      )}
      aria-hidden="true"
    >
      <Icon {...props} className={cn(iconSizeMap[size], iconClassName)} />
    </span>
  );
}
