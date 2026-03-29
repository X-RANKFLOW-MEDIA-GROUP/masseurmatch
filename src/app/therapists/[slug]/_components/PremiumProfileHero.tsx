"use client";

import Image from "next/image";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getPublicContactLinks,
  getPublicProfileName,
} from "@/app/_lib/public-profile";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";

interface Props {
  profile: PublicTherapist;
  reviews?: { rating: number }[];
}

export function PremiumProfileHero({ profile, reviews = [] }: Props) {
  const name = getPublicProfileName(profile);
  const firstName = name.split(" ")[0];
  const { callHref, smsHref } = getPublicContactLinks(profile.phone);
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const { trackContact } = useKnottyProfileAttribution({
    therapistId: profile.id,
    city: profile.city,
    neighborhood,
  });

  const city = profile.city || "United States";
  const yearsExp = profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
  const specialties = profile.specialties || [];
  const validPrices = [profile.incall_price, profile.outcall_price].filter((p): p is number => typeof p === "number" && p > 0);
  const startingRate = validPrices.length > 0 ? Math.min(...validPrices) : 120;
  const outcallRadius = profile.outcall_radius_miles || 10;
  const isVerified = profile.is_verified_identity || profile.is_verified_profile;
  const phoneFormatted = profile.phone
    ? profile.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
    : null;

  return (
    <section className="pp-hero pp-fade-in" id="hero">
      <div className="pp-hero-bg" />
      <div className="pp-hero-grid" />
      <div className="pp-hero-inner">
        <div className="pp-photo-col pp-anim-1">
          <div className="pp-photo-frame">
            <Image
              src={profile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face"}
              alt={`${name} - massage therapist in ${city}`}
              width={260}
              height={320}
              priority
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          {profile.languages_spoken && profile.languages_spoken.length > 1 && (
            <div className="pp-photo-badge">
              {profile.languages_spoken.filter(l => l !== "English").join(", ")}
            </div>
          )}
          {isVerified && (
            <div className="pp-verified-badge">✓ Verified</div>
          )}
        </div>

        <div className="pp-info-col">
          <div className="pp-profile-tags pp-anim-1">
            {profile.lgbtq_affirming && (
              <span className="pp-ptag pp-ptag-lgbt">🏳️‍🌈 LGBT+ Welcoming</span>
            )}
            {profile.outcall_price && (
              <span className="pp-ptag pp-ptag-mobile">📍 {profile.incall_price ? "In-Studio + Mobile" : "Mobile"}</span>
            )}
            {isVerified && (
              <span className="pp-ptag pp-ptag-verified">Verified</span>
            )}
          </div>

          <h1 className="pp-hero-name pp-anim-2">
            Massage<br /><em>by {firstName}</em>
          </h1>
          <div className="pp-hero-subtitle pp-anim-2">
            {profile.modality || "Licensed Massage Therapist"} · {city}
            {neighborhood ? ` · ${neighborhood}` : ""}
          </div>

          <div className="pp-stars-row pp-anim-3">
            {"★★★★★".split("").map((s, i) => (
              <span key={i} className="pp-star">{s}</span>
            ))}
            <span className="pp-review-count">
              {reviews.length > 0 ? `${reviews.length} verified reviews` : "New listing"}
            </span>
          </div>

          <div className="pp-quick-stats pp-anim-3">
            {yearsExp && (
              <div className="pp-qs">
                <div className="pp-qs-val">{yearsExp}<span>yrs</span></div>
                <div className="pp-qs-label">Experience</div>
              </div>
            )}
            <div className="pp-qs">
              <div className="pp-qs-val">{specialties.length || 4}<span> techniques</span></div>
              <div className="pp-qs-label">Specialties</div>
            </div>
            <div className="pp-qs">
              <div className="pp-qs-val"><span>from </span>${startingRate}</div>
              <div className="pp-qs-label">Starting rate</div>
            </div>
            {profile.outcall_price && (
              <div className="pp-qs">
                <div className="pp-qs-val">{outcallRadius}<span>mi</span></div>
                <div className="pp-qs-label">Mobile radius</div>
              </div>
            )}
          </div>

          <div className="pp-hero-ctas pp-anim-4">
            {smsHref && (
              <a
                href={smsHref}
                onClick={() => trackContact("knotty_text_clicked")}
                className="pp-btn-primary"
              >
                💬 Text to Book
              </a>
            )}
            {callHref && (
              <a
                href={callHref}
                onClick={() => trackContact("knotty_call_clicked")}
                className="pp-btn-secondary"
              >
                📞 {phoneFormatted || "Call"}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
