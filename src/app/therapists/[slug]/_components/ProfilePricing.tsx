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

  // Build structured rows: group by duration
  const hasStructuredSessions = sessions.length > 0 && sessions.some((s) => s.duration);
  const hasIncall = sessions.some((s) => s.incall) || !!profile.incall_price;
  const hasOutcall = sessions.some((s) => s.outcall) || !!profile.outcall_price;

  // Check if a value is more than +33.33% above the base price
  function isOverLimit(base: number | null | undefined, value: number | null | undefined) {
    if (!base || !value) return false;
    return value > base * 1.3333;
  }

  // Find the base reference price (60min in-call, if it exists)
  const baseIncall = sessions.find((s) => s.duration === 60 && s.incall) ? sessions.find((s) => s.duration === 60)?.incall : undefined;
  const baseOutcall = sessions.find((s) => s.duration === 60 && s.outcall) ? sessions.find((s) => s.duration === 60)?.outcall : undefined;

  return (
    <section id="pricing" className="profile-panel scroll-mt-24 p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Massage Rates in {city}</h2>

      {hasStructuredSessions ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          {/* Table header */}
          <div className="grid grid-cols-3 gap-px bg-secondary/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Duration</span>
            {hasIncall && <span className="text-right">In-call</span>}
            {hasOutcall && <span className="text-right">Out-call</span>}
            {!hasIncall && !hasOutcall && <span />}
          </div>
          {/* Rows */}
          {sessions.map((s, i) => (
            <div
              key={`price-${i}`}
              className="grid grid-cols-3 gap-px border-t border-border px-4 py-3 text-sm"
            >
              <span className="font-medium text-foreground">
                {s.name || `${s.duration || 60} min`}
              </span>
              {hasIncall && (
                <span
                  className={`text-right text-foreground ${isOverLimit(baseIncall, s.incall) ? 'bg-yellow-100 text-red-700 font-bold px-1 rounded' : ''}`}
                  title={isOverLimit(baseIncall, s.incall) ? 'Exceeds +33.33% of base price' : ''}
                >
                  {s.incall ? `$${s.incall}` : "Ask me"}
                </span>
              )}
              {hasOutcall && (
                <span
                  className={`text-right text-foreground ${isOverLimit(baseOutcall, s.outcall) ? 'bg-yellow-100 text-red-700 font-bold px-1 rounded' : ''}`}
                  title={isOverLimit(baseOutcall, s.outcall) ? 'Exceeds +33.33% of base price' : ''}
                >
                  {s.outcall ? `$${s.outcall}` : "Ask me"}
                </span>
              )}
            </div>
          ))}
          <div className="text-xs text-red-700 mt-2 px-4">
            * Valores destacados excedem +33.33% do valor base de 60min.
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {profile.incall_price ? (
            <div className="profile-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
              <span className="font-medium text-foreground">In-call</span>
              <span className="text-foreground font-semibold">${profile.incall_price}</span>
            </div>
          ) : null}
          {profile.outcall_price ? (
            <div className="profile-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
              <span className="font-medium text-foreground">Out-call</span>
              <span className="text-foreground font-semibold">${profile.outcall_price}</span>
            </div>
          ) : null}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Pricing may vary based on location and service type. Contact the therapist directly to confirm rates.
      </p>
    </section>
  );
}
