"use client";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "vibrant";
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  children,
  className,
  variant = "default",
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  const variants = {
    default: {
      primary: "rgba(125, 211, 252, 0.35)",    // sky-300
      secondary: "rgba(167, 139, 250, 0.35)",  // violet-400
      tertiary: "rgba(139, 30, 45, 0.25)",      // red-600
      accent: "rgba(52, 211, 153, 0.3)",       // emerald-400
    },
    subtle: {
      primary: "rgba(125, 211, 252, 0.2)",
      secondary: "rgba(167, 139, 250, 0.2)",
      tertiary: "rgba(139, 30, 45, 0.15)",
      accent: "rgba(52, 211, 153, 0.15)",
    },
    vibrant: {
      primary: "rgba(56, 189, 248, 0.5)",      // sky-400
      secondary: "rgba(139, 92, 246, 0.5)",    // violet-500
      tertiary: "rgba(139, 30, 45, 0.4)",      // red-600
      accent: "rgba(16, 185, 129, 0.4)",       // emerald-500
    },
  };

  const colors = variants[variant];

  return (
    <div
      className={cn(
        "relative flex flex-col min-h-screen w-full overflow-hidden bg-slate-950",
        className
      )}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Aurora blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary blob - top left */}
        <div
          className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full blur-3xl motion-reduce:animate-none animate-aurora-1"
          style={{
            background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
          }}
        />

        {/* Secondary blob - top right */}
        <div
          className="absolute -top-1/4 -right-1/4 w-[50%] h-[50%] rounded-full blur-3xl motion-reduce:animate-none animate-aurora-2"
          style={{
            background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
          }}
        />

        {/* Tertiary blob - bottom left */}
        <div
          className="absolute -bottom-1/4 -left-1/4 w-[55%] h-[55%] rounded-full blur-3xl motion-reduce:animate-none animate-aurora-3"
          style={{
            background: `radial-gradient(circle, ${colors.tertiary} 0%, transparent 70%)`,
          }}
        />

        {/* Accent blob - bottom right */}
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[45%] h-[45%] rounded-full blur-3xl motion-reduce:animate-none animate-aurora-4"
          style={{
            background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`,
          }}
        />

        {/* Center floating blob */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full blur-3xl motion-reduce:animate-none animate-aurora-5"
          style={{
            background: `radial-gradient(circle, ${colors.primary} 0%, transparent 60%)`,
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Optional radial gradient overlay for depth */}
      {showRadialGradient && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,23,42,0.8)_70%)]" />
      )}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1">{children}</div>
    </div>
  );
}

// Lighter version for signup/auth pages
export function AuroraBackgroundLight({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100",
        className
      )}
    >
      {/* Aurora blobs - light version */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full blur-3xl motion-reduce:animate-none animate-aurora-1"
          style={{
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -top-1/4 -right-1/4 w-[50%] h-[50%] rounded-full blur-3xl motion-reduce:animate-none animate-aurora-2"
          style={{
            background: "radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-1/4 -left-1/4 w-[55%] h-[55%] rounded-full blur-3xl motion-reduce:animate-none animate-aurora-3"
          style={{
            background: "radial-gradient(circle, rgba(139, 30, 45, 0.1) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[45%] h-[45%] rounded-full blur-3xl motion-reduce:animate-none animate-aurora-4"
          style={{
            background: "radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1">{children}</div>
    </div>
  );
}


