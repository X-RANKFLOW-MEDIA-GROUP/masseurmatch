"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUp, MapPin, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { cn } from "@/lib/utils";

type KnottyHeroSpotlightProps = {
  therapists: PublicTherapist[];
  therapistCount: number;
  cityCount: number;
};

type ShowcaseCard = {
  showcaseKey: string;
  name: string;
  cityLabel: string;
  tierLabel: string;
  detailLabel: string;
  profilePath: string;
  avatarUrl: string | null;
  reviewCount: number | null;
  showAvailable: boolean;
  byline: string;
};

const SHOWCASE_CARD_COUNT = 6;
const FALLBACK_SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    showcaseKey: "fallback-dallas-elite",
    name: "Visitorful Massage",
    cityLabel: "Dallas, TX",
    tierLabel: "Elite",
    detailLabel: "Deep tissue, Swedish & more",
    profilePath: "/therapists",
    avatarUrl: null,
    reviewCount: 42,
    showAvailable: true,
    byline: "by Verified Pro",
  },
  {
    showcaseKey: "fallback-austin-pro",
    name: "Modern Recovery",
    cityLabel: "Austin, TX",
    tierLabel: "Pro",
    detailLabel: "Sports recovery, stretching",
    profilePath: "/therapists",
    avatarUrl: null,
    reviewCount: 31,
    showAvailable: true,
    byline: "by MasseurMatch",
  },
  {
    showcaseKey: "fallback-miami-elite",
    name: "South Beach Reset",
    cityLabel: "Miami, FL",
    tierLabel: "Elite",
    detailLabel: "Luxury incall, wellness rituals",
    profilePath: "/therapists",
    avatarUrl: null,
    reviewCount: 27,
    showAvailable: true,
    byline: "by Featured Host",
  },
  {
    showcaseKey: "fallback-weho-pro",
    name: "Silver Lake Bodywork",
    cityLabel: "Los Angeles, CA",
    tierLabel: "Pro",
    detailLabel: "Relaxation, deep pressure",
    profilePath: "/therapists",
    avatarUrl: null,
    reviewCount: 18,
    showAvailable: true,
    byline: "by Verified Pro",
  },
  {
    showcaseKey: "fallback-nyc-standard",
    name: "Uptown Flow",
    cityLabel: "New York, NY",
    tierLabel: "Verified",
    detailLabel: "Swedish, mobility, recharge",
    profilePath: "/therapists",
    avatarUrl: null,
    reviewCount: 16,
    showAvailable: true,
    byline: "by MasseurMatch",
  },
  {
    showcaseKey: "fallback-sf-pro",
    name: "Golden Hour Massage",
    cityLabel: "San Francisco, CA",
    tierLabel: "Pro",
    detailLabel: "Stress relief, body reset",
    profilePath: "/therapists",
    avatarUrl: null,
    reviewCount: 24,
    showAvailable: true,
    byline: "by Spotlight Pick",
  },
];

function getDisplayName(therapist: PublicTherapist) {
  return therapist.display_name || therapist.full_name || "Featured Therapist";
}

function getCityLabel(therapist: PublicTherapist) {
  return therapist.city || "United States";
}

function getTierLabel(tier: PublicTherapist["_tier"]) {
  if (tier === "elite") {
    return "Elite";
  }

  if (tier === "pro") {
    return "Pro";
  }

  if (tier === "standard") {
    return "Verified";
  }

  return "Directory";
}

function getAvatarFallback(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function buildShowcaseTherapists(therapists: PublicTherapist[]) {
  if (therapists.length === 0) {
    return FALLBACK_SHOWCASE_CARDS;
  }

  return Array.from({ length: SHOWCASE_CARD_COUNT }, (_, index) => {
    const therapist = therapists[index % therapists.length];
    const name = getDisplayName(therapist);
    const detailLabel =
      therapist.specialties?.slice(0, 2).join(", ") || therapist.modality || "Deep tissue, Swedish";

    return {
      showcaseKey: `${therapist.id}-${index}`,
      name,
      cityLabel: getCityLabel(therapist),
      tierLabel: getTierLabel(therapist._tier),
      detailLabel,
      profilePath: `/therapists/${therapist.slug || therapist.id}`,
      avatarUrl: therapist.avatar_url,
      reviewCount: therapist.review_count,
      showAvailable: therapist._tier === "standard" || therapist._tier === "pro" || therapist._tier === "elite",
      byline: therapist.display_name ? "by Featured Host" : "by MasseurMatch",
    };
  });
}

function SpotlightProfileCard({ therapist, index }: { therapist: ShowcaseCard; index: number }) {
  const avatarFallback = getAvatarFallback(therapist.name);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[28px] border border-white/8 bg-[#0e0e0f] p-4 shadow-[0_24px_50px_rgba(0,0,0,0.42)]",
        "transition duration-300 hover:-translate-y-1 hover:border-white/16",
        index === 1 && "lg:translate-y-7",
        index === 3 && "lg:-translate-y-1",
        index === 4 && "lg:translate-y-10",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,75,143,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,138,31,0.10),transparent_26%)]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72">
            {therapist.tierLabel}
          </span>
          {therapist.reviewCount ? (
            <span className="text-[11px] font-medium text-white/45">{therapist.reviewCount}+ reviews</span>
          ) : (
            <span className="text-[11px] font-medium text-white/45">Top listing</span>
          )}
        </div>

        <div className="mt-4 flex items-start gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[24px] border border-brand-secondary/35 bg-[#101827] shadow-[0_0_0_1px_rgb(var(--color-brand-secondary-rgb)/0.16),0_0_30px_rgb(var(--color-brand-secondary-rgb)/0.20)]">
            {therapist.avatarUrl ? (
              <Image
                src={therapist.avatarUrl}
                alt={therapist.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-lg font-bold text-white/88">{avatarFallback}</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-xl font-semibold leading-6 text-white">{therapist.name}</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/38">{therapist.byline}</p>
            <p className="mt-3 line-clamp-2 text-sm leading-5 text-white/58">{therapist.detailLabel}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-soft">
              <MapPin className="h-3.5 w-3.5" />
              <span>{therapist.cityLabel}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {therapist.showAvailable ? (
            <span className="inline-flex rounded-full bg-success/18 px-3 py-1 text-[11px] font-semibold text-success">
              Available Now
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-white/6 px-3 py-1 text-[11px] font-semibold text-white/58">
              Direct Contact
            </span>
          )}

          <Link
            href={therapist.profilePath}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-semibold text-white/86 transition hover:border-white/20 hover:bg-white/8"
          >
            View Profile
          </Link>
        </div>
      </div>
    </article>
  );
}

export function KnottyHeroSpotlight({ therapists, therapistCount, cityCount }: KnottyHeroSpotlightProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showAgreementError, setShowAgreementError] = useState(false);
  const showcaseTherapists = buildShowcaseTherapists(therapists);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!agreed) {
      setShowAgreementError(true);
      return;
    }

    const params = new URLSearchParams();
    if (message.trim()) {
      params.set("prompt", message.trim());
    }

    router.push(params.toString() ? `/chat?${params.toString()}` : "/chat");
  };

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/8 bg-black text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(255,255,255,0.06),transparent_24%),radial-gradient(circle_at_right_center,rgba(30,75,143,0.14),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(255,138,31,0.12),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative grid gap-6 p-4 sm:p-6 xl:min-h-[calc(100vh-7rem)] xl:grid-cols-[minmax(0,0.9fr),minmax(360px,0.85fr)]">
        <div className="grid gap-6 xl:grid-rows-[minmax(0,1fr),auto]">
          <div className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(135deg,rgba(17,21,30,0.96),rgba(8,8,8,0.98))] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,138,31,0.20),transparent_22%),radial-gradient(circle_at_left_center,rgba(255,255,255,0.08),transparent_28%)]" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/74">
                  Premium Verified Professionals
                </div>

                <h1 className="mt-6 max-w-[10ch] text-5xl font-black leading-[0.88] tracking-tight text-white sm:text-6xl lg:text-[5.4rem]">
                  Elite Massage Professionals
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-9 text-white/70 sm:text-xl">
                  Discreet. Professional. Verified. Connect with top-rated massage therapists and discover standout
                  profiles built for faster trust.
                </p>
              </div>

              <div className="mt-8">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/therapists"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-white/92"
                  >
                    Explore Therapists
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 px-6 py-3.5 text-sm font-semibold text-white/84 transition hover:border-white/24 hover:bg-white/6 hover:text-white"
                  >
                    View Pricing
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/72">
                    {therapistCount}+ active profiles
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/72">
                    {cityCount}+ live cities
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/72">
                    Live AI concierge
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,14,16,0.96),rgba(5,5,6,0.98))] p-4 sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(255,255,255,0.06),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(30,75,143,0.12),transparent_22%)]" />

            <div className="relative">
              <div className="max-w-[36rem] rounded-[24px] bg-white/10 px-5 py-4 text-xl font-semibold leading-8 text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                Hey there. I&apos;m Knotty, your AI buddy from MasseurMatch. Ready to get started?
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="rounded-[28px] border border-white/10 bg-black/45 p-4">
                  <div className="flex items-center gap-3 rounded-full border border-brand-secondary/55 bg-black/80 px-4 py-3 shadow-[inset_0_0_0_1px_rgb(var(--color-brand-secondary-rgb)/0.16)]">
                    <MessageSquare className="h-4 w-4 shrink-0 text-brand-soft" />
                    <input
                      type="text"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Type a message..."
                      className="h-10 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/34"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/92"
                      aria-label="Send message to Knotty"
                    >
                      <ArrowUp className="h-5 w-5" />
                    </button>
                  </div>

                  <label className="mt-5 flex items-center gap-3 text-sm text-white/72">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(event) => {
                        setAgreed(event.target.checked);
                        if (event.target.checked) {
                          setShowAgreementError(false);
                        }
                      }}
                      className="h-4 w-4 rounded border-white/20 bg-black text-white accent-white"
                    />
                    <span>
                      I agree to{" "}
                      <Link href="/terms" className="font-semibold text-brand-soft underline underline-offset-4">
                        Terms & Conditions
                      </Link>
                    </span>
                  </label>

                  {showAgreementError ? (
                    <p className="mt-2 text-xs text-brand-soft">Please accept the terms before sending.</p>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        </div>

        <aside className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,10,10,0.9),rgba(3,3,3,0.98))] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
                <Sparkles className="h-3.5 w-3.5" />
                Spotlight
              </p>
              <h2 className="mt-3 max-w-[7ch] text-4xl font-black uppercase leading-[0.86] tracking-tight text-white sm:text-5xl">
                Masseur of the Day
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/58">
                A rotating wall of high-visibility profiles designed to feel premium from the very first screen.
              </p>
            </div>

            <Link
              href="/therapists"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:border-white/24 hover:text-white sm:inline-flex"
            >
              View All
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
            {showcaseTherapists.map((therapist, index) => (
              <SpotlightProfileCard key={therapist.showcaseKey} therapist={therapist} index={index} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
