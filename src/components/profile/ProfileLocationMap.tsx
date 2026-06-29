import { Navigation } from "lucide-react";
import { IconMapPin, IconShield } from "@/components/icons";
import type { ProfileViewModel } from "./profile-utils";

/**
 * Privacy-safe location map for a therapist profile.
 *
 * Renders a keyless Google Maps embed centered on the provider's general area
 * (neighborhood + city + state) — never an exact street address, which is only
 * shared after a client connects. Works for every profile because it queries by
 * place name rather than precise coordinates, so no map API key is required.
 */
export function ProfileLocationMap({ profile }: { profile: ProfileViewModel }) {
  const areaParts = [profile.neighborhood, profile.city, profile.state].filter(
    (part) => Boolean(part) && part !== "Serving central areas",
  );
  const query = (areaParts.length ? areaParts : [profile.city, profile.state])
    .filter(Boolean)
    .join(", ");

  if (!query) return null;

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`;
  const serviceAreas = profile.serviceAreas.slice(0, 6);

  return (
    <section
      id="location"
      className="overflow-hidden rounded-[24px] border border-white/5 bg-[#101C2B]/90 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 p-7 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/12 text-[#60A5FA]">
            <IconMapPin size={20} />
          </span>
          <div>
            <h2 className="font-display text-[28px] font-bold tracking-[-0.03em] text-[#F8FAFC]">
              Location &amp; Service Area
            </h2>
            <p className="font-sans text-sm text-[#94A3B8]">
              {profile.neighborhood}, {profile.city}, {profile.state}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
          <IconShield size={14} />
          Approximate area
        </span>
      </div>

      <div className="relative mx-7 aspect-[16/9] overflow-hidden rounded-[18px] border border-white/8">
        <iframe
          src={mapSrc}
          title={`Map of ${profile.name}'s service area in ${profile.city}, ${profile.state}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full grayscale-[0.25] contrast-[1.05]"
          style={{ border: 0 }}
        />
      </div>

      <div className="p-7 pt-5">
        {serviceAreas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {serviceAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[#94A3B8]"
              >
                <Navigation className="h-3 w-3 text-[#60A5FA]" strokeWidth={2.5} />
                {area}
              </span>
            ))}
          </div>
        )}
        <p className="mt-4 font-sans text-sm leading-6 text-[#64748B]">
          The map shows {profile.name}&apos;s general working area. The exact studio address is shared
          privately after you connect{profile.outcallAvailable ? `, and ${profile.name} also travels for outcall sessions${/mile/i.test(profile.travelRadius) ? ` (${profile.travelRadius})` : ""}` : ""}.
        </p>
      </div>
    </section>
  );
}
