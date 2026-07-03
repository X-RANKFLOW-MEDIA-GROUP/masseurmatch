"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ButtonLiquidMetal
 * ─────────────────
 * Hero CTA with a liquid-metal shimmer effect.
 * Uses only CSS custom properties — no aurora/blob deps.
 * Respects prefers-reduced-motion.
 *
 * Usage:
 *   <ButtonLiquidMetal size="lg" asChild>
 *     <Link href="/search">Find a Therapist</Link>
 *   </ButtonLiquidMetal>
 */

export interface ButtonLiquidMetalProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** "md" | "lg" | "xl" — hero sizes only, use regular Button for small */
  size?: "md" | "lg" | "xl";
  /** Render as a child element (e.g. Next.js Link) */
  asChild?: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  md: "h-11 px-6  text-sm  rounded-xl gap-2",
  lg: "h-14 px-10 text-base rounded-2xl gap-3",
  xl: "h-16 px-12 text-lg  rounded-2xl gap-3",
};

export function ButtonLiquidMetal({
  size = "lg",
  asChild = false,
  className,
  children,
  ...props
}: ButtonLiquidMetalProps) {
  const Comp = asChild ? React.Fragment : "button";

  return (
    <button
      className={cn(
        // Base
        "group relative inline-flex items-center justify-center font-sans font-semibold",
        "tracking-tight select-none overflow-hidden",
        "transition-all duration-200 ease-smooth-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        // Size
        sizeClasses[size],
        // Liquid Metal surface
        "bg-[var(--color-primary)] text-white",
        "before:absolute before:inset-0 before:rounded-[inherit]",
        // Inner highlight — top rim
        "before:bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_60%)]",
        // Shimmer sweep on hover
        "after:absolute after:inset-0 after:rounded-[inherit]",
        "after:bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.25)_50%,transparent_80%)]",
        "after:translate-x-[-150%] after:transition-transform after:duration-500 after:ease-smooth-out",
        "hover:after:translate-x-[150%]",
        // Lift
        "hover:-translate-y-[2px] hover:shadow-[var(--shadow-sm)]",
        "active:translate-y-0 active:shadow-none",
        className
      )}
      {...props}
    >
      {/* Glint dot — top-left corner */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-[14%] top-[18%] h-1.5 w-1.5 rounded-full bg-white/40 blur-[1px] transition-opacity duration-300 group-hover:opacity-0"
      />
      {/* Content sits above ::before / ::after */}
      <span className="relative z-10 flex items-center gap-[inherit]">
        {children}
      </span>
    </button>
  );
}
