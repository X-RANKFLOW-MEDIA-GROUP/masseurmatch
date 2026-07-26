import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Dimensional pill treatment: a soft top highlight, a shaded lower lip, and a
// short drop shadow give every pill a subtle raised "candy" profile without
// leaving the brand's restrained look.
const LIGHT_DEPTH =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1.5px_2px_rgba(17,17,17,0.07),0_1px_1.5px_rgba(17,17,17,0.1),0_2px_5px_rgba(17,17,17,0.07)]";
const DARK_DEPTH =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_1.5px_2px_rgba(17,17,17,0.16),0_3px_8px_rgba(139,30,45,0.3)]";

const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        // Status pills
        available: `bg-gradient-to-b from-emerald-50 to-emerald-100 text-emerald-800 ring-1 ring-emerald-200/90 ${LIGHT_DEPTH}`,
        visiting: `bg-gradient-to-b from-sky-50 to-sky-100 text-sky-800 ring-1 ring-sky-200/90 ${LIGHT_DEPTH}`,
        new: `bg-gradient-to-b from-[#A32B3C] to-accent text-white ring-1 ring-[#6E1521]/45 ${DARK_DEPTH}`,
        featured: `bg-gradient-to-b from-amber-50 to-amber-100 text-amber-800 ring-1 ring-amber-200/90 ${LIGHT_DEPTH}`,

        // Trust pills
        verified: `bg-gradient-to-b from-emerald-50 to-emerald-100 text-emerald-800 ring-1 ring-emerald-200/90 ${LIGHT_DEPTH}`,
        location: `bg-gradient-to-b from-white to-slate-100 text-slate-700 ring-1 ring-slate-200/90 ${LIGHT_DEPTH}`,
        lgbtq: `bg-gradient-to-b from-rose-50 to-rose-100 text-rose-700 ring-1 ring-rose-200/90 ${LIGHT_DEPTH}`,
        community: `bg-gradient-to-b from-purple-50 to-purple-100 text-purple-700 ring-1 ring-purple-200/90 ${LIGHT_DEPTH}`,

        // Service pills
        service: `bg-gradient-to-b from-white to-slate-100 text-slate-700 ring-1 ring-slate-200/90 ${LIGHT_DEPTH}`,
      },
      size: {
        sm: "text-[10px] px-2 py-1",
        md: "text-xs px-3 py-1.5",
        lg: "text-sm px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "service",
      size: "md",
    },
  }
);

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {
  icon?: React.ReactNode;
  label: string;
}

export function Pill({ className, variant, size, icon, label, ...props }: PillProps) {
  return (
    <span className={cn(pillVariants({ variant, size }), className)} {...props}>
      {icon}
      {label}
    </span>
  );
}
