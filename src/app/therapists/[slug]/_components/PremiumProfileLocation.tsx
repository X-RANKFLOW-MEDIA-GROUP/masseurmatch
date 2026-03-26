"use client";

import { MapPin } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfileLocation({ profile }: Props) {
  const city = profile.city || "the area";
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const areasServed = profile.areas_served || [];
  const radius = profile.outcall_radius_miles || 15;
  
  // Default areas if none provided
  const defaultAreas = neighborhood 
    ? [neighborhood, "Downtown", "Midtown", "Uptown"]
    : ["Downtown", "Midtown", "Central", "North Side", "South Side"];
  
  const areas = areasServed.length > 0 ? areasServed : defaultAreas;

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px" }}>
      {/* Map placeholder */}
      <div 
        className="h-[200px] rounded-[var(--radius)] border border-[var(--glass-border)] flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d2444 0%, #0B1F3A 100%)" }}
      >
        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
          <div 
            className="w-4 h-4 rounded-full bg-[var(--orange)]"
            style={{ 
              boxShadow: "0 0 0 8px rgba(255,138,31,0.2), 0 0 0 16px rgba(255,138,31,0.08)",
              animation: "pp-pulse 2s infinite"
            }}
          />
          <span className="mt-3 text-sm text-[var(--cream)]">{neighborhood || city}</span>
          <span className="text-xs">Exact address shared after booking</span>
        </div>
      </div>

      {/* Location info */}
      <div>
        {/* Neighborhood badge */}
        <div className="flex items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--cream-dim)] px-4 py-3 mb-3">
          <MapPin className="w-4 h-4 text-[var(--orange)]" />
          <span className="text-sm">
            <strong className="text-[var(--cream)]">{neighborhood || city}</strong>
            {profile.incall_price && <span className="text-[var(--text-dim)]"> · Incall available</span>}
          </span>
        </div>

        <p className="text-xs text-[var(--text-dim)] mb-4">
          Exact address shared after booking confirmation. Private studio, discreet entrance, parking available.
        </p>

        {/* Outcall radius */}
        {profile.outcall_price && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)] mb-2">
              Outcall radius ({radius} miles)
            </p>
            <div className="flex flex-wrap gap-2">
              {areas.slice(0, 8).map((area, i) => (
                <span 
                  key={area}
                  className="text-[11px] px-3 py-1 rounded-full border border-[var(--glass-border)] bg-[var(--cream-dim)] text-[var(--text-dim)]"
                >
                  {area}{i >= 6 ? " +$20" : ""}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
