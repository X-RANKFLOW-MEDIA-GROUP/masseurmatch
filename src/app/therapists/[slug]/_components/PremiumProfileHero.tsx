"use client";

import Image from "next/image";
import { MapPin, MessageCircle, Phone, Star, Clock, Plane, Zap, UserCircle } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getPublicContactLinks,
  getPublicProfileName,
} from "@/app/_lib/public-profile";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";

interface Props {
  profile: PublicTherapist;
  cityPath: string;
  reviews?: { rating: number | null }[];
}

export function PremiumProfileHero({ profile, cityPath, reviews = [] }: Props) {
  const name = getPublicProfileName(profile);
  const { callHref, smsHref, whatsappHref } = getPublicContactLinks(profile.phone, profile.whatsapp_number);
  const neighborhood = profile.neighborhood;
  
  const { trackContact } = useKnottyProfileAttribution({
    therapistId: profile.id,
    city: profile.city || "",
    neighborhood: neighborhood || "",
  });
  
  const city = profile.city || "United States";
  const yearsExp = profile.years_experience;
  const ratedReviews = reviews.filter((r) => typeof r.rating === "number");
  // Only surface a rating when there are real rated reviews — never a fabricated default.
  const avgRating = ratedReviews.length > 0
    ? (ratedReviews.reduce((sum, r) => sum + (r.rating as number), 0) / ratedReviews.length).toFixed(1)
    : null;

  const activePromo = profile.promotions?.[0];

  return (
    <section className="pp-hero pp-fade-in" id="hero">
      {/* Photo */}
      <div className="pp-hero-photo-wrap">
        {profile.profile_photo ? (
          <Image
            src={profile.profile_photo}
            alt={`${name} - massage therapist in ${city}`}
            width={560}
            height={746}
            priority
            className="pp-hero-photo"
          />
        ) : (
          <div className="pp-hero-photo flex items-center justify-center bg-slate-800">
            <UserCircle className="h-32 w-32 text-slate-600" />
          </div>
        )}
        <div className="pp-verified-badge">
          <span className="pp-status-dot" />
          {profile.available_now ? "Available Now" : "Online"}
        </div>
      </div>

      {/* Info */}
      <div className="pp-hero-info">
        {/* Badges */}
        <div className="pp-badges">
          {profile.available_now && (
            <span className="pp-badge pp-badge-available">
              <Zap className="w-3 h-3 fill-current" /> Available Now
            </span>
          )}
          {profile.verification_status === "verified" && (
            <VerifiedBadge size="sm" verifiedAt={profile.identity_verified_at} />
          )}
          {profile.subscription_tier === "elite" && (
            <span className="pp-badge pp-badge-traveling">
              <Star className="w-3 h-3 fill-current" /> Elite Member
            </span>
          )}
        </div>

        {/* Name */}
        <h1 className="pp-hero-name">{name}</h1>

        {/* Subtitle */}
        <div className="pp-hero-subtitle">
          <span>
            <MapPin className="w-4 h-4" />
            {neighborhood ? `${neighborhood}, ${city}` : city}
          </span>
          <span style={{ color: "var(--text-muted)" }}>·</span>
          <span>{profile.headline || "Massage Therapist"}</span>
        </div>

        {/* Meta Stats — only real, substantiated values are shown */}
        {(yearsExp || avgRating) && (
          <div className="pp-hero-meta">
            {yearsExp ? (
              <div className="pp-meta-item">
                <div className="pp-meta-val">{yearsExp}+</div>
                <div className="pp-meta-label">Years exp.</div>
              </div>
            ) : null}
            {avgRating ? (
              <div className="pp-meta-item">
                <div className="pp-meta-val">{avgRating}</div>
                <div className="pp-meta-label">Rating ({ratedReviews.length})</div>
              </div>
            ) : null}
          </div>
        )}

        {/* CTAs */}
        <div className="pp-hero-cta">
          {smsHref && (
            <a
              href={smsHref}
              onClick={() => trackContact("knotty_text_clicked")}
              className="pp-btn pp-btn-primary"
            >
              <MessageCircle className="w-4 h-4" />
              Contact {name.split(" ")[0]}
            </a>
          )}
          {whatsappHref && (
            <a
              href={whatsappHref}
              className="pp-btn pp-btn-wa"
            >
              <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2C8.3 2 2 8.3 2 16c0 2.5.7 4.8 1.8 6.9L2 30l7.3-1.8C11.3 29.3 13.6 30 16 30c7.7 0 14-6.3 14-14S23.7 2 16 2zm7.6 19.4c-.3.9-1.7 1.7-2.4 1.8-.6.1-1.4.1-4.5-1.5-3.8-1.9-6.2-5.8-6.4-6.1-.2-.3-1.4-2-.1-3.9.4-.6.9-.9 1.3-.9h.9c.3 0 .6.2.8.7l1.1 2.7c.2.4.1.8-.1 1.1l-.5.7c-.2.3-.1.7.1 1 .4.6 1.2 1.5 2 2.2.9.7 1.9 1.2 2.5 1.4.4.1.8 0 1-.3l.6-.7c.3-.4.7-.5 1.1-.3l2.6 1.2c.5.2.7.6.5 1Z"/>
              </svg>
              WhatsApp
            </a>
          )}
          {callHref && (
            <a
              href={callHref}
              onClick={() => trackContact("knotty_call_clicked")}
              className="pp-btn pp-btn-outline"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}
        </div>

        {/* Promo Banner */}
        {activePromo && (
          <div className="pp-promo-banner">
            <div className="pp-promo-text">
              <strong>{activePromo.title}</strong><br />
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                {activePromo.description}
              </span>
            </div>
            <PromoCountdown />
          </div>
        )}
      </div>
    </section>
  );
}

function PromoCountdown() {
  return (
    <div className="pp-promo-timer">
      <div className="pp-timer-block">
        <div className="pp-timer-num">08</div>
        <div className="pp-timer-label">hrs</div>
      </div>
      <span className="pp-timer-sep">:</span>
      <div className="pp-timer-block">
        <div className="pp-timer-num">47</div>
        <div className="pp-timer-label">min</div>
      </div>
      <span className="pp-timer-sep">:</span>
      <div className="pp-timer-block">
        <div className="pp-timer-num">22</div>
        <div className="pp-timer-label">sec</div>
      </div>
    </div>
  );
}
