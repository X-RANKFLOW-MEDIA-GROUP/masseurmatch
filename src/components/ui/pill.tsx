import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        // Status pills
        available: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        visiting: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
        new: "bg-accent text-white",
        featured: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

        // Trust pills
        verified: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        location: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
        lgbtq: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
        community: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",

        // Service pills
        service: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
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
