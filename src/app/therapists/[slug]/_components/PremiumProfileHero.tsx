"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Phone, Star, Clock, Shield, Plane } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getPublicContactLinks,
  getPublicProfileName,
} from "@/app/_lib/public-profile";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";
import { ReportTraffickingButton } from "./ReportTraffickingButton";
import { ProfileActionButtons } from "./ProfileActionButtons";

interface Props {
  profile: PublicTherapist;
  cityPath: string;
  reviews?: { rating: number | null }[];
}

export function PremiumProfileHero({ profile, cityPath, reviews = [] }: Props) {
  const name = getPublicProfileName(profile);
  const { callHref, smsHref } = getPublicContactLinks(profile.phone);
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const { trackContact } = useKnottyProfileAttribution({
    therapistId: profile.id,
    city: profile.city,
    neighborhood,
  });
  
  const city = profile.city || "United States";
  const yearsExp = profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
  const ratedReviews = reviews.filter((r) => typeof r.rating === "number");
  const avgRating = ratedReviews.length > 0 
    ? (ratedReviews.reduce((sum, r) => sum + (r.rating as number), 0) / ratedReviews.length).toFixed(1)
    : "5.0";
  const sessionCount = profile.profile_views ? Math.floor(profile.profile_views / 3) : 127;
  
  // Check if traveling soon
  const travelingSoon = Array.isArray(profile.travel_schedule) && profile.travel_schedule.length > 0
    ? profile.travel_schedule.find(trip => new Date(trip.start_date).getTime() > Date.now())
    : null;

  return (
    <section className="pp-hero pp-fade-in" id="hero">
      {/* Photo */}
      <div className="pp-hero-photo-wrap">
        <Image
          src={profile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face"}
          alt={`${name} - massage therapist in ${city}`}
          width={560}
          height={746}
          priority
          className="pp-hero-photo"
        />
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
            <span className="pp-badge pp-badge-available">Available Now</span>
          )}
          {Number(avgRating) >= 4.8 && (
            <span className="pp-badge pp-badge-top">
              <Star className="w-3 h-3" /> Highly Rated
            </span>
          )}
          {travelingSoon && (
            <span className="pp-badge pp-badge-traveling">
              <Plane className="w-3 h-3" /> Visiting {travelingSoon.city} Soon
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
          <span>Massage Therapist</span>
        </div>

        {/* Meta Stats */}
        <div className="pp-hero-meta">
          <div className="pp-meta-item">
            <div className="pp-meta-val">{yearsExp || 5}+</div>
            <div className="pp-meta-label">Years exp.</div>
          </div>
          <div className="pp-meta-item">
            <div className="pp-meta-val">{avgRating}</div>
            <div className="pp-meta-label">Rating</div>
          </div>
          <div className="pp-meta-item">
            <div className="pp-meta-val">{sessionCount}</div>
            <div className="pp-meta-label">Connections</div>
          </div>
        </div>

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
          <a
            href={`https://wa.me/${profile.phone?.replace(/\D/g, "")}`}
            className="pp-btn pp-btn-wa"
          >
            <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 2C8.3 2 2 8.3 2 16c0 2.5.7 4.8 1.8 6.9L2 30l7.3-1.8C11.3 29.3 13.6 30 16 30c7.7 0 14-6.3 14-14S23.7 2 16 2zm7.6 19.4c-.3.9-1.7 1.7-2.4 1.8-.6.1-1.4.1-4.5-1.5-3.8-1.9-6.2-5.8-6.4-6.1-.2-.3-1.4-2-.1-3.9.4-.6.9-.9 1.3-.9h.9c.3 0 .6.2.8.7l1.1 2.7c.2.4.1.8-.1 1.1l-.5.7c-.2.3-.1.7.1 1 .4.6 1.2 1.5 2 2.2.9.7 1.9 1.2 2.5 1.4.4.1.8 0 1-.3l.6-.7c.3-.4.7-.5 1.1-.3l2.6 1.2c.5.2.7.6.5 1Z"/>
            </svg>
            WhatsApp
          </a>
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
        <div className="mt-3">
          <ProfileActionButtons
            therapistId={profile.id}
            therapistName={name}
          />
        </div>
        <div className="mt-3">
          <ReportTraffickingButton therapistId={profile.id} therapistName={name} compact />
        </div>

        {/* Promo Banner */}
        {profile._tier === "pro" && (() => {
          const promo = profile.promotions?.[0];
          return (
            <div className="pp-promo-banner">
              <div className="pp-promo-text">
                <strong>{promo ? promo.title : "Special Offer"}</strong><br />
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                  {promo ? promo.description : "Contact for current deals"}
                </span>
              </div>
              <PromoCountdown />
            </div>
          );
        })()}
      </div>
    </section>
  );
}

function PromoCountdown() {
  // Simple static countdown for now
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
