"use client";

import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicContactLinks } from "@/app/_lib/public-profile";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfileSidebar({ profile }: Props) {
  const { callHref, smsHref } = getPublicContactLinks(profile.phone);
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const city = profile.city || "the area";
  const { trackContact } = useKnottyProfileAttribution({
    therapistId: profile.id,
    city: profile.city,
    neighborhood,
  });

  const validPrices = [profile.incall_price, profile.outcall_price].filter((p): p is number => typeof p === "number" && p > 0);
  const startingRate = validPrices.length > 0 ? Math.min(...validPrices) : 120;
  const outcallRadius = profile.outcall_radius_miles || 10;
  const areas = profile.areas_served || [];
  const phoneFormatted = profile.phone
    ? profile.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
    : null;

  const studioAmenities = ["🚿 Shower", "🚽 Private Restroom", "💧 Bottled Water", "🔥 Hot Towels", "🎵 Music"];
  const mobileExtras = ["🛏 Massage Table", "🔥 Hot Towels", "🎵 Music"];

  return (
    <>
      <div className="pp-book-card pp-anim-2">
        <div className="pp-book-header">
          <h3>Book a Session</h3>
          <p>Text or call to schedule</p>
        </div>
        <div className="pp-book-body">
          <div className="pp-avail-row">
            <span className="pp-avail-label">Availability</span>
            <span className={`pp-avail-val${profile.available_now ? " green" : ""}`}>
              {profile.available_now ? "● Open today" : "● Check availability"}
            </span>
          </div>
          <div className="pp-avail-row">
            <span className="pp-avail-label">Hours</span>
            <span className="pp-avail-val">By appointment</span>
          </div>
          <div className="pp-avail-row">
            <span className="pp-avail-label">Response</span>
            <span className="pp-avail-val">Usually within 1hr</span>
          </div>
          <div className="pp-avail-row">
            <span className="pp-avail-label">Starting at</span>
            <span className="pp-avail-val" style={{ color: "var(--orange)", fontSize: "18px", fontFamily: "var(--font-serif)", fontWeight: 600 }}>
              ${startingRate} / 60 min
            </span>
          </div>
          {smsHref && (
            <a
              href={smsHref}
              onClick={() => trackContact("knotty_text_clicked")}
              className="pp-book-cta"
            >
              💬 Text to Book Now
            </a>
          )}
          {callHref && (
            <a
              href={callHref}
              onClick={() => trackContact("knotty_call_clicked")}
              className="pp-book-tel"
            >
              {phoneFormatted || "Call"} — tap to call
            </a>
          )}
        </div>
      </div>

      <div className="pp-info-card pp-anim-3">
        <div className="pp-info-card-title">Location & Service Area</div>
        {(neighborhood || city) && (
          <div className="pp-info-row">
            <span className="pp-info-icon">📍</span>
            <div className="pp-info-text">
              <strong>Studio</strong>
              {neighborhood ? `${neighborhood}, ${city}` : city}
            </div>
          </div>
        )}
        {profile.outcall_price && (
          <div className="pp-info-row">
            <span className="pp-info-icon">🚗</span>
            <div className="pp-info-text">
              <strong>Mobile radius</strong>
              Up to {outcallRadius} miles — homes & hotels
            </div>
          </div>
        )}
        {areas.length > 0 && (
          <div className="pp-info-row">
            <span className="pp-info-icon">🗺️</span>
            <div className="pp-info-text">
              {areas.slice(0, 6).join(" · ")}
            </div>
          </div>
        )}
      </div>

      {profile.incall_price && (
        <div className="pp-info-card pp-anim-3">
          <div className="pp-info-card-title">Studio Amenities</div>
          <div className="pp-amenity-grid">
            {studioAmenities.map((amenity) => (
              <span key={amenity} className="pp-amenity-tag">{amenity}</span>
            ))}
          </div>
          {profile.outcall_price && (
            <>
              <div style={{ height: "12px" }} />
              <div className="pp-info-card-title">Mobile Extras</div>
              <div className="pp-amenity-grid">
                {mobileExtras.map((amenity) => (
                  <span key={amenity} className="pp-amenity-tag">{amenity}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="pp-info-card pp-anim-4">
        <div className="pp-info-card-title">Credentials</div>
        {profile.education && (
          <div className="pp-info-row">
            <span className="pp-info-icon">🎓</span>
            <div className="pp-info-text">
              <strong>{profile.education}</strong>
            </div>
          </div>
        )}
        {profile.training && profile.training.length > 0 ? (
          profile.training.map((entry, i) => (
            <div key={i} className="pp-info-row">
              <span className="pp-info-icon">🏅</span>
              <div className="pp-info-text">
                <strong>{entry.label}</strong>
                {entry.detail && <>{entry.detail}</>}
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="pp-info-row">
              <span className="pp-info-icon">🏅</span>
              <div className="pp-info-text">
                <strong>Licensed Massage Therapist</strong>
                {profile.modality || "Professional Certification"}
              </div>
            </div>
            {profile.years_experience && (
              <div className="pp-info-row">
                <span className="pp-info-icon">📋</span>
                <div className="pp-info-text">
                  <strong>{profile.years_experience}+ Years Experience</strong>
                  Practicing in {city}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
