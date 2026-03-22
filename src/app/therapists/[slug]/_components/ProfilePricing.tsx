import type { PublicTherapist, PricingSessionItem } from "@/app/_lib/directory";

function normalizePricingSessions(value: unknown): PricingSessionItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is PricingSessionItem => typeof item === "object" && item !== null);
}

interface Props {
  profile: PublicTherapist;
}

export function ProfilePricing({ profile }: Props) {
  const city = profile.city || "your area";
  const sessions = normalizePricingSessions(profile.pricing_sessions);
  const hasAny = sessions.length > 0 || profile.incall_price || profile.outcall_price;

  if (!hasAny) return null;

  return (
    <section id="pricing" className="profile-panel scroll-mt-24 p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Massage Rates in {city}</h2>

      <div className="mt-4 space-y-3">
        {sessions.length > 0 ? (
          sessions.map((s, i) => (
            <div key={`price-${i}`} className="profile-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
              <span className="font-medium text-foreground">{s.name || `${s.duration || 60} min`}</span>
              <span className="text-muted-foreground">
                {s.incall ? `$${s.incall}` : "—"}
                {s.outcall ? ` / Outcall $${s.outcall}` : ""}
              </span>
            </div>
          ))
        ) : (
          <>
            {profile.incall_price ? (
              <div className="profile-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
                <span className="font-medium text-foreground">Incall</span>
                <span className="text-muted-foreground">${profile.incall_price}</span>
              </div>
            ) : null}
            {profile.outcall_price ? (
              <div className="profile-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
                <span className="font-medium text-foreground">Outcall</span>
                <span className="text-muted-foreground">${profile.outcall_price}</span>
              </div>
            ) : null}
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">Pricing may vary based on location and service type.</p>
    </section>
  );
}
