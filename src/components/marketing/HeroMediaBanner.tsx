"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Cta3DButton } from "@/components/marketing/Cta3DButton";
import { BRAND_ASSETS } from "@/lib/brand";
import type { PublicTherapist } from "@/app/_lib/directory";

export function HeroMediaBanner({
  reducedMotion = false,
  therapists = [],
}: {
  reducedMotion?: boolean;
  therapists?: PublicTherapist[];
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = !reducedMotion && !videoFailed;

  if (therapists.length > 0) {
    return <ProfilesBand therapists={therapists} />;
  }

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

function ProfilesBand({ therapists }: { therapists: PublicTherapist[] }) {
  const cards = therapists.slice(0, 6);

  return (
    <div className="w-full bg-[#060E1A]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
        <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Featured therapists
        </p>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4 lg:gap-5">
          {cards.map((therapist) => (
            <ProfileCard key={therapist.id} therapist={therapist} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Cta3DButton href="/search" variant="primary">
            Find your therapist
          </Cta3DButton>
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ therapist }: { therapist: PublicTherapist }) {
  const photo = therapist.profile_photo || therapist.avatar_url;
  const name = therapist.display_name || therapist.full_name || "Therapist";
  const href = therapist.slug ? `/therapists/${therapist.slug}` : "/search";

  return (
    <Link href={href} className="group relative block overflow-hidden rounded-xl">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover object-[50%_15%] transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 200px"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/[0.08] to-white/[0.03]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060E1A]/90 via-[#060E1A]/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
          <p className="truncate text-xs font-semibold leading-snug text-white sm:text-sm">
            {name}
          </p>
          {therapist.city && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-white/55">
              <MapPin className="h-2.5 w-2.5 flex-shrink-0" strokeWidth={2.25} />
              {therapist.city}
            </p>
          )}
        </div>
      </div>
    </Link>
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
