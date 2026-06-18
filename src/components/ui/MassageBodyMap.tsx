"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatHeightInches,
  formatWeightLb,
  getBodyTypeLabel,
  BODY_TYPES,
  type BodyType,
} from "@/lib/physical-profile";

// ── Centre of the figure (viewBox 0 0 340 510) ───────────────────────────────
const CX = 170;

// ── Average-body SVG path strings ────────────────────────────────────────────
const PATHS = {
  torso:
    "M 102,98 C 98,122 100,160 120,188 C 122,204 126,218 128,230 " +
    "C 128,246 124,258 120,266 L 220,266 " +
    "C 216,258 212,246 212,230 C 214,218 218,204 220,188 " +
    "C 240,160 242,122 238,98 Z",

  leftArm:
    "M 102,98 L 58,290 C 52,302 52,316 58,324 L 74,324 " +
    "C 80,316 80,302 74,290 L 118,98 Z",

  rightArm:
    "M 238,98 L 282,290 C 288,302 288,316 282,324 L 266,324 " +
    "C 260,316 260,302 266,290 L 222,98 Z",

  leftLeg:
    "M 120,266 L 98,380 L 88,468 C 84,482 90,492 104,492 " +
    "C 118,492 126,484 126,474 L 128,468 L 138,380 L 170,266 Z",

  rightLeg:
    "M 220,266 L 242,380 L 252,468 C 256,482 250,492 236,492 " +
    "C 222,492 214,484 214,474 L 212,468 L 202,380 L 170,266 Z",
};

// ── Scale factors per body type ───────────────────────────────────────────────
// Applied as scaleX around CX=170, so each region widens/narrows proportionally
const BODY_SCALES: Record<BodyType, { torso: number; arm: number; leg: number }> = {
  slim:     { torso: 0.76, arm: 0.80, leg: 0.82 },
  average:  { torso: 1.00, arm: 1.00, leg: 1.00 },
  athletic: { torso: 1.10, arm: 1.06, leg: 1.04 },
  muscular: { torso: 1.22, arm: 1.26, leg: 1.10 },
  stocky:   { torso: 1.18, arm: 1.10, leg: 1.14 },
  large:    { torso: 1.36, arm: 1.20, leg: 1.22 },
};

// matrix(sx,0,0,1,tx,0) — scales X around CX without moving the centre line
function sxTransform(sx: number): string {
  return `matrix(${sx},0,0,1,${(CX * (1 - sx)).toFixed(2)},0)`;
}

// ── Scanning ring positions (y) ───────────────────────────────────────────────
const RING_POSITIONS = [148, 210, 266, 348] as const;

// ── Props ─────────────────────────────────────────────────────────────────────
export interface MassageBodyMapProps {
  bodyType?: string | null;
  heightInches?: number | null;
  weightLb?: number | null;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function MassageBodyMap({
  bodyType,
  heightInches,
  weightLb,
  className,
}: MassageBodyMapProps) {
  const prefersReducedMotion = useReducedMotion();

  // Fall back to "average" proportions when body_type is missing or unknown
  const resolvedType: BodyType = BODY_TYPES.includes(bodyType as BodyType)
    ? (bodyType as BodyType)
    : "average";
  const scales = BODY_SCALES[resolvedType];

  const heightLabel = formatHeightInches(heightInches);
  const weightLabel = formatWeightLb(weightLb);
  const buildLabel = getBodyTypeLabel(resolvedType);
  const hasStats = Boolean(heightLabel || weightLabel || buildLabel);

  // Holographic sky-blue palette
  const fill = "rgba(56,189,248,0.07)";
  const stroke = "rgba(56,189,248,0.82)";

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      {/* ── Figure ── */}
      <div className="relative">
        {/* Ambient glow behind figure */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 38%, rgba(56,189,248,0.10) 0%, transparent 72%)",
          }}
          animate={prefersReducedMotion ? {} : { opacity: [0.5, 1.0, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating body */}
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            viewBox="0 0 340 510"
            width={220}
            height={330}
            aria-label={`Physique: ${buildLabel ?? "body type not specified"}`}
            role="img"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* Soft outer glow on the body */}
              <filter id="mmb-glow" x="-35%" y="-20%" width="170%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Scanning rings ── */}
            {RING_POSITIONS.map((ringY, i) => (
              <motion.ellipse
                key={ringY}
                cx={CX}
                cy={ringY}
                rx={74}
                ry={7}
                fill="none"
                stroke="rgba(34,211,238,0.7)"
                strokeWidth="1.5"
                style={{ transformOrigin: `${CX}px ${ringY}px` }}
                animate={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        scaleX: [0.7, 1.9, 2.8],
                        opacity: [0, 0.65, 0],
                      }
                }
                transition={{
                  duration: 3.2,
                  delay: i * 0.8,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* ── Body ── */}
            <g filter="url(#mmb-glow)">
              {/* Head */}
              <ellipse
                cx={CX}
                cy={44}
                rx={30}
                ry={33}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
              />

              {/* Neck */}
              <path
                d="M 158,77 C 156,82 156,93 158,98 L 182,98 C 184,93 184,82 182,77 Z"
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
              />

              {/* Torso — scales around CX for build */}
              <path
                d={PATHS.torso}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
                transform={sxTransform(scales.torso)}
              />

              {/* Arms — spread wider/narrower with arm scale */}
              <path
                d={PATHS.leftArm}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
                transform={sxTransform(scales.arm)}
              />
              <path
                d={PATHS.rightArm}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
                transform={sxTransform(scales.arm)}
              />

              {/* Legs */}
              <path
                d={PATHS.leftLeg}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
                transform={sxTransform(scales.leg)}
              />
              <path
                d={PATHS.rightLeg}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
                transform={sxTransform(scales.leg)}
              />
            </g>

            {/* Spine dots (decorative centreline) */}
            {[130, 155, 180, 208, 238].map((y) => (
              <circle
                key={y}
                cx={CX}
                cy={y}
                r={1.8}
                fill="rgba(56,189,248,0.28)"
                pointerEvents="none"
              />
            ))}
          </svg>
        </motion.div>
      </div>

      {/* ── Stats chips ── */}
      {hasStats && (
        <div className="flex flex-wrap justify-center gap-2">
          {heightLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-sky-300">
              <Ruler className="h-3 w-3" strokeWidth={2.25} />
              {heightLabel}
            </span>
          )}
          {weightLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-sky-300">
              {weightLabel}
            </span>
          )}
          {buildLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-sky-300">
              {buildLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
