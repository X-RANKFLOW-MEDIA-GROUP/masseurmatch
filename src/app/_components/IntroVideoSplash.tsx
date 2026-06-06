"use client";

import { useEffect, useRef, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { BRAND_ASSETS } from "@/lib/brand";

const SESSION_KEY = "mm_intro_seen";

// Full-screen opening video shown once per browser session on first visit.
// Muted autoplay (browser policy), with a Skip control and an optional unmute
// toggle. Auto-dismisses when the video ends or fails, and is skipped entirely
// for visitors who prefer reduced motion.
export function IntroVideoSplash() {
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      alreadySeen = false;
    }

    if (!alreadySeen && !prefersReducedMotion) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Lock background scroll while the splash is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Ignore storage failures (private mode, etc.) — worst case it replays.
    }
    setVisible(false);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (videoRef.current) {
      videoRef.current.muted = next;
      if (!next) void videoRef.current.play().catch(() => undefined);
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Welcome to MasseurMatch"
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#060E1A]"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster={BRAND_ASSETS.heroPoster}
        onEnded={dismiss}
        onError={dismiss}
      >
        <source src={BRAND_ASSETS.introVideo} type="video/mp4" />
      </video>

      {/* Subtle vignette for control legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* Controls */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
        >
          {muted ? <VolumeX className="h-5 w-5" strokeWidth={2.25} /> : <Volume2 className="h-5 w-5" strokeWidth={2.25} />}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
        >
          Skip
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
