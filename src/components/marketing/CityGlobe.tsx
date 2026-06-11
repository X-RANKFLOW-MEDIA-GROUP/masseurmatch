"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { useReducedMotion } from "framer-motion";
import { LIVE_COVERAGE_CITIES } from "@/lib/site-stats";

// Priority + supporting US markets. [latitude, longitude]
const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [32.7767, -96.797], size: 0.1 }, // Dallas
  { location: [25.7617, -80.1918], size: 0.1 }, // Miami
  { location: [40.7128, -74.006], size: 0.11 }, // New York
  { location: [34.0522, -118.2437], size: 0.11 }, // Los Angeles
  { location: [41.8781, -87.6298], size: 0.1 }, // Chicago
  { location: [29.7604, -95.3698], size: 0.09 }, // Houston
  { location: [33.749, -84.388], size: 0.09 }, // Atlanta
  { location: [38.9072, -77.0369], size: 0.09 }, // Washington DC
  { location: [36.1699, -115.1398], size: 0.08 }, // Las Vegas
  { location: [33.4484, -112.074], size: 0.07 }, // Phoenix
  { location: [39.7392, -104.9903], size: 0.07 }, // Denver
  { location: [30.2672, -97.7431], size: 0.07 }, // Austin
  { location: [47.6062, -122.3321], size: 0.07 }, // Seattle
  { location: [42.3601, -71.0589], size: 0.07 }, // Boston
  { location: [37.7749, -122.4194], size: 0.08 }, // San Francisco
];

/**
 * Interactive 3D globe of MasseurMatch markets.
 *
 * Always auto-rotates, can be grabbed and spun with pointer/touch, and keeps
 * spinning with inertia after you let go. Built on `cobe` (WebGL) with the
 * brand navy/orange palette. Falls back to a styled CSS sphere when WebGL is
 * unavailable or fails to initialise.
 */
export function CityGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  // Rotation state shared with the render loop via refs.
  const phiRef = useRef(0);
  const thetaRef = useRef(0.25);
  const widthRef = useRef(0);

  // Pointer-drag + inertia interaction state.
  const pointerInteracting = useRef<number | null>(null);
  const phiAtPointerStart = useRef(0);
  const velocityRef = useRef(0); // residual angular velocity for "fling" momentum
  const [grabbing, setGrabbing] = useState(false);

  // Falls back to a styled CSS sphere when WebGL is unavailable or fails.
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Probe WebGL support; bail to the CSS fallback if unavailable.
    const probe = document.createElement("canvas");
    const supported = !!(
      probe.getContext("webgl") || probe.getContext("experimental-webgl")
    );
    if (!supported) {
      setWebglOk(false);
      return;
    }

    // Measure the canvas robustly: seed from offsetWidth, then keep it in sync
    // with a ResizeObserver so the globe is never created at width 0.
    widthRef.current = canvas.offsetWidth;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) widthRef.current = w;
    });
    ro.observe(canvas);

    // The auto-rotate speed. We keep a gentle spin even under reduced-motion so
    // the globe still reads as a globe; users who prefer less motion just get a
    // calmer rotation rather than a frozen sphere.
    const autoSpeed = reducedMotion ? 0.0015 : 0.0045;

    let globe: { destroy: () => void } | undefined;
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 1.25,
        mapSamples: 16000,
        mapBrightness: 6.5,
        baseColor: [0.13, 0.24, 0.4],
        markerColor: [1, 0.541, 0.122],
        glowColor: [0.2, 0.34, 0.55],
        markers: MARKERS,
        onRender: (state) => {
          if (pointerInteracting.current === null) {
            // Continuous auto-rotation, plus any residual fling velocity that
            // decays smoothly back to the baseline spin.
            phiRef.current += autoSpeed + velocityRef.current;
            velocityRef.current *= 0.94; // friction
            if (Math.abs(velocityRef.current) < 0.00005) velocityRef.current = 0;
          }
          state.phi = phiRef.current;
          state.theta = thetaRef.current;
          state.width = widthRef.current * 2;
          state.height = widthRef.current * 2;
        },
      });
    } catch {
      setWebglOk(false);
      ro.disconnect();
      return;
    }

    // Fade the canvas in once the first frame is ready.
    const reveal = requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(reveal);
      globe?.destroy();
      ro.disconnect();
    };
  }, [reducedMotion]);

  const updateFromPointer = (clientX: number) => {
    if (pointerInteracting.current === null) return;
    const delta = clientX - pointerInteracting.current;
    const nextPhi = phiAtPointerStart.current + delta / 200;
    // Track velocity so releasing the globe gives it a natural fling.
    velocityRef.current = nextPhi - phiRef.current;
    phiRef.current = nextPhi;
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      {/* Ambient glow behind the globe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,138,31,0.22),transparent_62%)] blur-2xl"
      />
      {/* Styled CSS-sphere fallback for devices without WebGL */}
      {!webglOk && (
        <div
          role="img"
          aria-label="Globe highlighting MasseurMatch cities across the United States"
          className="absolute inset-0 grid place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_30%,#16365c,#0a1a2e_55%,#060d1b)] shadow-[0_0_80px_rgba(255,138,31,0.18)] ring-1 ring-white/10"
        >
          <div className="absolute inset-0 animate-spin rounded-full border border-dashed border-white/10 [animation-duration:40s]" />
          <div className="absolute inset-6 rounded-full border border-white/10" />
          <div className="absolute inset-16 rounded-full border border-white/5" />
          <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-primary [animation-duration:2s]" style={{ top: "32%", left: "40%" }} />
          <span className="absolute h-2 w-2 rounded-full bg-primary" style={{ top: "55%", left: "60%" }} />
          <span className="absolute h-2 w-2 rounded-full bg-primary/70" style={{ top: "62%", left: "30%" }} />
          <span className="font-display text-3xl font-extrabold text-white/80">{LIVE_COVERAGE_CITIES}+ cities</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Rotating 3D globe highlighting MasseurMatch cities across the United States"
        className={`h-full w-full touch-none opacity-0 transition-opacity duration-700 [contain:layout_paint_size] ${webglOk ? "" : "hidden"}`}
        style={{ cursor: grabbing ? "grabbing" : "grab" }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          phiAtPointerStart.current = phiRef.current;
          velocityRef.current = 0;
          setGrabbing(true);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          pointerInteracting.current = null;
          setGrabbing(false);
          (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
        }}
        onPointerCancel={() => {
          pointerInteracting.current = null;
          setGrabbing(false);
        }}
        onPointerMove={(e) => updateFromPointer(e.clientX)}
      />
    </div>
  );
}

export default CityGlobe;
