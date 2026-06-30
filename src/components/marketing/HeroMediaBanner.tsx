"use client";

import Image from "next/image";
import { Cta3DButton } from "@/components/marketing/Cta3DButton";
import { BRAND_ASSETS } from "@/lib/brand";
import type { PublicTherapist } from "@/app/_lib/directory";

export function HeroMediaBanner({
  reducedMotion: _reducedMotion = false,
  therapists: _therapists = [],
}: {
  reducedMotion?: boolean;
  therapists?: PublicTherapist[];
}) {
  return (
    <div className="relative w-full">
      {/* Desktop / tablet — static hero still (no video) */}
      <div className="relative hidden aspect-video w-full overflow-hidden sm:block lg:aspect-[21/9]">
        <Image
          src={BRAND_ASSETS.heroPoster}
          alt="Premium male massage therapy"
          fill
          loading="lazy"
          className="object-cover"
          sizes="100vw"
        />
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
