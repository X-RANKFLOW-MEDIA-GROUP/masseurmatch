"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { useReducedMotion } from "framer-motion";

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
 * Auto-rotates, and can be grabbed and spun with pointer/touch.
 * Built on `cobe` (WebGL) with the brand navy/orange palette.
 */
export function CityGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  // Rotation state shared with the render loop via refs.
  const phiRef = useRef(0);
  const thetaRef = useRef(0.25);
  const widthRef = useRef(0);

  // Pointer-drag interaction state.
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionStart = useRef(0);
  const phiAtPointerStart = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  // Falls back to a styled CSS sphere when WebGL is unavailable or fails.
  const [webglOk, setWebglOk] = useState(true);

  const onResize = useCallback(() => {
    if (canvasRef.current) {
      widthRef.current = canvasRef.current.offsetWidth;
    }
  }, []);

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

    window.addEventListener("resize", onResize);
    onResize();

    let globe: { destroy: () => void };
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.12, 0.22, 0.38],
        markerColor: [1, 0.541, 0.122],
        glowColor: [0.18, 0.32, 0.52],
        markers: MARKERS,
        onRender: (state) => {
          // Auto-rotate unless the user is dragging or prefers reduced motion.
          if (pointerInteracting.current === null && !reducedMotion) {
            phiRef.current += 0.004;
          }
          state.phi = phiRef.current;
          state.theta = thetaRef.current;
          state.width = widthRef.current * 2;
          state.height = widthRef.current * 2;
        },
      });
    } catch {
      setWebglOk(false);
      window.removeEventListener("resize", onResize);
      return;
    }

    // Fade the canvas in once the first frame is ready.
    const reveal = requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(reveal);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [onResize, reducedMotion]);

  const updateFromPointer = (clientX: number) => {
    if (pointerInteracting.current === null) return;
    const delta = clientX - pointerInteracting.current;
    phiRef.current = phiAtPointerStart.current + delta / 200;
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
          className="absolute inset-0 grid place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#16365c,#0a1a2e_55%,#060d1b)] shadow-[0_0_80px_rgba(255,138,31,0.18)] ring-1 ring-white/10"
        >
          <div className="absolute inset-6 rounded-full border border-white/10" />
          <div className="absolute inset-16 rounded-full border border-white/5" />
          <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-primary [animation-duration:2s]" style={{ top: "32%", left: "40%" }} />
          <span className="absolute h-2 w-2 rounded-full bg-primary" style={{ top: "55%", left: "60%" }} />
          <span className="absolute h-2 w-2 rounded-full bg-primary/70" style={{ top: "62%", left: "30%" }} />
          <span className="font-display text-3xl font-extrabold text-white/80">57+ cities</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Rotating 3D globe highlighting MasseurMatch cities across the United States"
        className={`h-full w-full opacity-0 transition-opacity duration-700 [contain:layout_paint_size] ${webglOk ? "" : "hidden"}`}
        style={{ cursor: grabbing ? "grabbing" : "grab" }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          pointerInteractionStart.current = e.clientX;
          phiAtPointerStart.current = phiRef.current;
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
