import { MapPin } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";

interface Props {
  profile: PublicTherapist;
}

export function ProfileAreasServed({ profile }: Props) {
  const areas = profile.areas_served;
  const city = profile.city;
  const neighborhood = profile.neighborhood_name || profile.primary_area;

  if (!areas || areas.length === 0) {
    if (!city) return null;
    return (
      <div className="pp-location-body">
        <div className="pp-location-info">
          <div className="flex items-center gap-2 text-sm text-[var(--cream-soft)]">
            <MapPin className="w-4 h-4 text-[var(--orange)]" />
            <span>{neighborhood ? `${neighborhood}, ${city}` : city}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {neighborhood && (
        <div className="flex items-center gap-2 text-sm text-[var(--cream-soft)] mb-4">
          <MapPin className="w-4 h-4 text-[var(--orange)]" />
          <span>Based in {neighborhood}{city ? `, ${city}` : ""}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {areas.map((area) => (
          <span
            key={area}
            className="px-4 py-2 rounded-full border border-[var(--glass-border)] bg-[var(--cream-dim)] text-[var(--cream-soft)] text-xs flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] flex-shrink-0" />
            {area}
          </span>
        ))}
      </div>
    </div>
  );
}
