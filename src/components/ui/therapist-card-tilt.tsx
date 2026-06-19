"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * TherapistCardTilt
 * ─────────────────
 * CSS 3D perspective tilt driven by mouse position.
 * Gracefully degrades on touch (no tilt) and prefers-reduced-motion.
 *
 * Props mirror a minimal TherapistCard data shape —
 * adapt to your Therapist type as needed.
 *
 * Usage:
 *   <TherapistCardTilt
 *     name="Sofia Almeida"
 *     specialty="Deep Tissue · Relaxamento"
 *     location="São Paulo, SP"
 *     rating={4.9}
 *     reviewCount={128}
 *     pricePerHour={180}
 *     avatarUrl="/images/sofia.jpg"
 *     verified
 *   />
 */

export interface TherapistCardTiltProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  specialty: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  pricePerHour?: number;
  avatarUrl?: string;
  verified?: boolean;
  available?: boolean;
  /** 0-20 — intensity of tilt. Default: 12 */
  tiltIntensity?: number;
}

export function TherapistCardTilt({
  name,
  specialty,
  location,
  rating,
  reviewCount,
  pricePerHour,
  avatarUrl,
  verified = false,
  available = false,
  tiltIntensity = 12,
  className,
  ...props
}: TherapistCardTiltProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [transform, setTransform] = React.useState("");
  const [glare, setGlare] = React.useState({ x: 50, y: 50, opacity: 0 });
  const prefersReduced = React.useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReduced.current) return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;  // 0-1
      const y = (e.clientY - rect.top) / rect.height;  // 0-1
      const rotX = (y - 0.5) * -tiltIntensity;
      const rotY = (x - 0.5) * tiltIntensity;
      setTransform(
        `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.025,1.025,1.025)`
      );
      setGlare({ x: x * 100, y: y * 100, opacity: 0.12 });
    },
    [tiltIntensity]
  );

  const handleMouseLeave = React.useCallback(() => {
    setTransform("");
    setGlare((g) => ({ ...g, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]",
        "p-5 shadow-[var(--shadow-sm)] cursor-pointer",
        "transition-[box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:shadow-[var(--shadow-lg)]",
        "will-change-transform",
        className
      )}
      style={{
        transform: transform || undefined,
        transition: transform
          ? "transform 80ms ease-out, box-shadow 200ms ease"
          : "transform 400ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms ease",
      }}
      {...props}
    >
      {/* Glare overlay */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
      >
        <span
          className="absolute inset-0 rounded-[inherit]"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 60%)`,
            transition: "opacity 200ms ease",
          }}
        />
      </span>

      {/* Card content */}
      <div className="relative z-10 flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              width={56}
              height={56}
              loading="lazy"
              className="h-14 w-14 rounded-full object-cover ring-2 ring-[var(--color-surface-offset)]"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-[var(--color-surface-offset)] flex items-center justify-center text-[var(--color-text-muted)] text-lg font-semibold">
              {name[0]}
            </div>
          )}
          {available && (
            <span
              aria-label="Available now"
              className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[var(--color-success)] border-2 border-[var(--color-surface)]"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-lg leading-tight text-[var(--color-text)] truncate">
              {name}
            </h3>
            {verified && (
              <svg
                aria-label="Verified"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 text-[var(--color-primary)]"
              >
                <circle cx="8" cy="8" r="8" fill="currentColor" fillOpacity="0.15" />
                <path
                  d="M5 8l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5 truncate">
            {specialty}
          </p>
          {location && (
            <p className="text-xs text-[var(--color-text-faint)] mt-1 truncate">
              {location}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      {(rating !== undefined || pricePerHour !== undefined) && (
        <div className="relative z-10 mt-4 pt-4 border-t border-[var(--color-divider)] flex items-center justify-between">
          {rating !== undefined && (
            <div className="flex items-center gap-1.5">
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-[var(--color-warning)]"
              >
                <path
                  d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.88l-3.09 1.63.59-3.44L2 4.635l3.455-.505L7 1z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-sm font-semibold text-[var(--color-text)] tabular-nums">
                {rating.toFixed(1)}
              </span>
              {reviewCount !== undefined && (
                <span className="text-xs text-[var(--color-text-faint)]">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}
          {pricePerHour !== undefined && (
            <div className="text-right">
              <span className="text-xs text-[var(--color-text-faint)]">a partir de </span>
              <span className="text-sm font-semibold text-[var(--color-text)] tabular-nums">
                R$ {pricePerHour}
              </span>
              <span className="text-xs text-[var(--color-text-faint)]">/h</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
