"use client";

import Image from "next/image";
import { MapPin, MessageCircle, Phone, Plane, Star } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getPublicContactLinks,
  getPublicProfileName,
} from "@/app/_lib/public-profile";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";
import { ReportTraffickingButton } from "./ReportTraffickingButton";

interface Props {
  profile: PublicTherapist;
  cityPath: string;
  reviews?: { rating: number | null }[];
}

export function PremiumProfileHero({ profile, reviews = [] }: Props) {
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
  const connectionCount = profile.profile_views ? Math.floor(profile.profile_views / 3) : 127;
  const travelingSoon = Array.isArray(profile.travel_schedule) && profile.travel_schedule.length > 0
    ? profile.travel_schedule.find((trip) => new Date(trip.start_date).getTime() > Date.now())
    : null;
  const whatsappHref = profile.phone ? `https://wa.me/${profile.phone.replace(/\D/g, "")}` : null;
  const promo = profile.promotions?.[0];

  return (
    <section className="pp-hero pp-fade-in" id="hero">
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

      <div className="pp-hero-info">
        <div className="pp-badges">
          {profile.available_now && <span className="pp-badge pp-badge-available">Available Now</span>}
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

        <h1 className="pp-hero-name">{name}</h1>

        <div className="pp-hero-subtitle">
          <span>
            <MapPin className="w-4 h-4" />
            {neighborhood ? `${neighborhood}, ${city}` : city}
          </span>
          <span style={{ color: "var(--text-muted)" }}>·</span>
          <span>Massage Therapist</span>
        </div>

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
            <div className="pp-meta-val">{connectionCount}</div>
            <div className="pp-meta-label">Connections</div>
          </div>
        </div>

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
            <a href={whatsappHref} className="pp-btn pp-btn-wa">
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
        <div className="mt-3">
          <ReportTraffickingButton therapistId={profile.id} therapistName={name} compact />
        </div>

        {promo && (
          <div className="pp-promo-banner">
            <div className="pp-promo-text">
              <strong>{promo.title}</strong>
              <br />
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{promo.description}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
