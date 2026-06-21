"use client";

import { useState } from "react";
import Image from "next/image";
import { Cta3DButton } from "@/components/marketing/Cta3DButton";
import { BRAND_ASSETS } from "@/lib/brand";

// Cinematic hero banner:
// - Desktop: an autoplaying, muted, looping background video. If the video
//   fails to load (or reduced motion is requested) it falls back to a still.
// - Mobile: a dedicated portrait still (no video, to save data/battery).
// A 3D CTA and short caption are overlaid on a gradient scrim.
export function HeroMediaBanner({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = !reducedMotion && !videoFailed;

  return (
    <div className="relative w-full">
      {/* Desktop / tablet (sm and up) */}
      <div className="relative hidden aspect-video w-full overflow-hidden sm:block lg:aspect-[21/9]">
        {showVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={BRAND_ASSETS.heroPoster}
            onError={() => setVideoFailed(true)}
          >
            <source src={BRAND_ASSETS.heroVideo} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={BRAND_ASSETS.heroPoster}
            alt="Premium male massage therapy"
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            sizes="100vw"
          />
        )}
        <Overlay />
      </div>

      {/* Mobile (below sm) */}
      <div className="relative block aspect-[9/14] w-full overflow-hidden sm:hidden">
        <Image
          src={BRAND_ASSETS.heroMobile}
          alt="Premium male massage therapy"
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="100vw"
        />
        <Overlay />
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/85 via-[#1A1A1A]/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-6 pb-8 text-center sm:pb-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
          Vetted · Discreet · Nationwide
        </p>
        <Cta3DButton href="/search" variant="primary">
          Find your therapist
        </Cta3DButton>
      </div>
    </>
  );
}
