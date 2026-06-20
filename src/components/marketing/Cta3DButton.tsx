"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "dark" | "glass";

// A high-end, tactile "3D pushable" CTA button. The button is built from three
// stacked layers — a soft cast shadow, a darker bottom "edge", and a raised
// front face — that compress on hover and press flush on click for a premium,
// physical feel. Respects keyboard focus and reduced-motion preferences.
export function Cta3DButton({
  href,
  children,
  variant = "primary",
  withIcon = true,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  withIcon?: boolean;
  className?: string;
}) {
  const edge =
    variant === "primary"
      ? "bg-[linear-gradient(to_left,hsl(28_90%_28%)_0%,hsl(28_90%_22%)_8%,hsl(28_90%_22%)_92%,hsl(28_90%_28%)_100%)]"
      : variant === "dark"
        ? "bg-[linear-gradient(to_left,#020610_0%,#020610_100%)]"
        : "bg-[linear-gradient(to_left,rgba(0,0,0,0.35),rgba(0,0,0,0.35))]";

  const face =
    variant === "primary"
      ? "bg-gradient-to-b from-[#FFA64D] to-[#C8102E] text-[#3a1c00]"
      : variant === "dark"
        ? "bg-gradient-to-b from-[#11233f] to-[#1A1A1A] text-white ring-1 ring-white/10"
        : "bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md";

  return (
    <Link
      href={href}
      className={`group relative inline-flex select-none rounded-full border-0 bg-transparent p-0 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none ${className}`}
    >
      {/* Cast shadow */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-black/30 blur-[6px] translate-y-[6px] transition-transform duration-150 ease-out group-hover:translate-y-[10px] group-hover:blur-[10px] group-active:translate-y-[2px] group-active:blur-[3px] motion-reduce:transition-none"
      />
      {/* 3D edge */}
      <span aria-hidden className={`absolute inset-0 rounded-full ${edge}`} />
      {/* Raised front face */}
      <span
        className={`relative flex h-14 items-center gap-2 rounded-full px-8 text-base font-bold tracking-tight transition-transform duration-150 ease-out -translate-y-[6px] group-hover:-translate-y-[8px] group-active:-translate-y-[1px] motion-reduce:transform-none motion-reduce:transition-none ${face}`}
      >
        {children}
        {withIcon && (
          <ArrowRight
            className="h-[1.15rem] w-[1.15rem] transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2.5}
          />
        )}
      </span>
    </Link>
  );
}
