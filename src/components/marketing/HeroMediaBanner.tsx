"use client";

import { useState } from "react";
import Image from "next/image";
import { Cta3DButton } from "@/components/marketing/Cta3DButton";
import { BRAND_ASSETS } from "@/lib/brand";
import type { PublicTherapist } from "@/app/_lib/directory";

export function HeroMediaBanner({
  reducedMotion = false,
  therapists: _therapists = [],
}: {
  reducedMotion?: boolean;
  therapists?: PublicTherapist[];
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = !reducedMotion && !videoFailed;

  return (
    <div className="relative w-full">
      {/* Desktop / tablet — lazy-loaded, it's below the hero text fold */}
      <div className="relative hidden aspect-video w-full overflow-hidden sm:block lg:aspect-[21/9]">
        {showVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
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
            loading="lazy"
            className="object-cover"
            sizes="100vw"
          />
        )}
        <Overlay />
      </div>

      {/* Mobile */}
      <div className="relative block aspect-[9/14] w-full overflow-hidden sm:hidden">
        <Image
          src={BRAND_ASSETS.heroMobile}
          alt="Premium male massage therapy"
          fill
          loading="lazy"
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111111]/85 via-[#111111]/20 to-transparent" />
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
