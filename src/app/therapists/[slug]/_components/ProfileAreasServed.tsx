import { MapPin, MapIcon, Car } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";

interface Props {
  profile: PublicTherapist;
}

export function ProfileAreasServed({ profile }: Props) {
  const areas = profile.areas_served;
  const city = profile.city;
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const hasIncall = profile.incall_price !== null && profile.incall_price !== undefined;
  const hasOutcall = profile.outcall_price !== null && profile.outcall_price !== undefined;
  const outcallRadius = profile.outcall_radius_miles;

  // Build map query with fallback order
  let mapQuery = "";
  if (neighborhood && city) {
    mapQuery = `${neighborhood} ${city}`;
  } else if (areas?.length && city) {
    mapQuery = `${areas[0]} ${city}`;
  } else if (neighborhood) {
    mapQuery = neighborhood;
  } else if (city) {
    mapQuery = city;
  } else if (areas?.length) {
    mapQuery = areas[0];
  }

  // Don't render if we have no location data at all
  if (!mapQuery && (!areas || areas.length === 0)) {
    return null;
  }

  const mapEmbedUrl = mapQuery 
    ? `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(mapQuery)}&key=AIzaSyB41DcZfigtf2v4c0D0iQLQoDjiMEsPJwg`
    : null;

  return (
    <div className="pp-location-section">
      {/* Map Card */}
      {mapEmbedUrl && (
        <div className="pp-map-card pp-fade-in">
          <div className="pp-map-container">
            <iframe
              title="Service area map"
              width="100%"
              height="360"
              style={{ border: 0, borderRadius: "var(--radius-sm)" }}
              loading="lazy"
              allowFullScreen
              src={mapEmbedUrl}
            />
          </div>
          <div className="pp-map-privacy-note">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Map shows approximate service area, not exact private address</span>
          </div>
        </div>
      )}

      {/* Base Location */}
      <div className="pp-location-header">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-lg bg-[rgba(255,138,31,0.15)] border border-[rgba(255,138,31,0.2)]">
            <MapPin className="w-5 h-5 text-[var(--orange)]" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-600 mb-1">
              Based in
            </div>
            <div className="text-sm font-500 text-[var(--cream)]">
              {neighborhood && city ? `${neighborhood}, ${city}` : neighborhood || city || "Service area available"}
            </div>
          </div>
        </div>
      </div>

      {/* Service Type Cards */}
      {(hasIncall || hasOutcall) && (
        <div className="pp-service-types-grid">
          {hasIncall && (
            <div className="pp-service-type-card">
              <div className="pp-service-type-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="pp-service-type-label">In-Call</div>
              <div className="pp-service-type-desc">Available at studio location</div>
            </div>
          )}
          {hasOutcall && (
            <div className="pp-service-type-card">
              <div className="pp-service-type-icon">
                <Car className="w-5 h-5" />
              </div>
              <div className="pp-service-type-label">Out-Call</div>
              <div className="pp-service-type-desc">
                {outcallRadius ? `${outcallRadius} mile radius` : "Travel available"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Areas Served Tags */}
      {areas && areas.length > 0 && (
        <div className="pp-areas-served-section">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-600 mb-4">
            Areas Served
          </div>
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <span
                key={area}
                className="px-3.5 py-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--cream-dim)] text-[var(--cream-soft)] text-xs font-500 flex items-center gap-2 hover:border-[rgba(255,138,31,0.3)] hover:bg-[rgba(255,138,31,0.08)] transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] flex-shrink-0" />
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
