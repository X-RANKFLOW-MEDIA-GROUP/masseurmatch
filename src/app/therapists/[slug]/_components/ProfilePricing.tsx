import type { PublicTherapist, PricingSessionItem } from "@/app/_lib/directory";

type FlexiblePricingSession = PricingSessionItem & {
  id?: string | null;
  mode?: "simple" | "technique" | "ask_me" | null;
  technique?: string | null;
  minutes?: number | null;
  incall_rate?: number | null;
  outcall_rate?: number | null;
  incall_ask_me?: boolean | null;
  outcall_ask_me?: boolean | null;
};

function normalizePricingSessions(value: unknown): FlexiblePricingSession[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      ...item,
      mode: item.mode === "technique" || item.mode === "ask_me" ? item.mode : "simple",
      technique: typeof item.technique === "string" ? item.technique : typeof item.name === "string" ? item.name : null,
      minutes: typeof item.minutes === "number" ? item.minutes : typeof item.duration === "number" ? item.duration : 60,
      incall_rate: typeof item.incall_rate === "number" ? item.incall_rate : typeof item.incall === "number" ? item.incall : null,
      outcall_rate: typeof item.outcall_rate === "number" ? item.outcall_rate : typeof item.outcall === "number" ? item.outcall : null,
      incall_ask_me: item.incall_ask_me === true,
      outcall_ask_me: item.outcall_ask_me === true,
    }));
}

interface Props {
  profile: PublicTherapist;
}

function rateLabel(rate: number | null | undefined, askMe: boolean | null | undefined) {
  if (askMe || rate === null || rate === undefined) return "Ask Me";
  return `$${rate}`;
}

export function ProfilePricing({ profile }: Props) {
  const city = profile.city || "your area";
  const sessions = normalizePricingSessions(profile.pricing_sessions);
  const mode = sessions[0]?.mode || "simple";
  const hasAny = sessions.length > 0 || profile.incall_price || profile.outcall_price;

  if (!hasAny) return null;

  if (mode === "ask_me") {
    return (
      <section id="pricing" className="profile-panel scroll-mt-24 p-6 md:p-7">
        <h2 className="text-2xl font-semibold text-foreground">Massage Rates in {city}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="profile-panel-soft rounded-2xl px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Incall</p>
            <p className="mt-1 text-lg font-semibold text-foreground">Ask Me</p>
          </div>
          <div className="profile-panel-soft rounded-2xl px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Outcall</p>
            <p className="mt-1 text-lg font-semibold text-foreground">Ask Me</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Contact the therapist directly for current pricing and session details.</p>
      </section>
    );
  }

  if (sessions.length > 0) {
    return (
      <section id="pricing" className="profile-panel scroll-mt-24 p-6 md:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Massage Rates in {city}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "technique" ? "Rates are organized by massage technique." : "Flexible session pricing based on total time."}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {sessions.map((session, index) => {
            const minutes = session.minutes || 60;
            return (
              <div key={session.id || `price-${index}`} className="overflow-hidden rounded-2xl border border-border bg-background">
                <div className="border-b border-border bg-secondary/50 px-4 py-3">
                  <p className="font-semibold text-foreground">
                    {mode === "technique" && session.technique ? session.technique : `${minutes} minutes`}
                  </p>
                  {mode === "technique" && <p className="mt-0.5 text-xs text-muted-foreground">{minutes}-minute session</p>}
                </div>
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Incall</p>
                    <p className="mt-1 font-semibold text-foreground">{rateLabel(session.incall_rate, session.incall_ask_me)}</p>
                  </div>
                  <div className="px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Outcall</p>
                    <p className="mt-1 font-semibold text-foreground">{rateLabel(session.outcall_rate, session.outcall_ask_me)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Contact the therapist directly to confirm current rates, travel details, and availability. MasseurMatch does not process appointments or session payments.
        </p>
      </section>
    );
  }

  return (
    <section id="pricing" className="profile-panel scroll-mt-24 p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Massage Rates in {city}</h2>
      <div className="mt-4 space-y-3">
        <div className="profile-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
          <span className="font-medium text-foreground">Incall</span>
          <span className="font-semibold text-foreground">{profile.incall_price ? `$${profile.incall_price}` : "Ask Me"}</span>
        </div>
        <div className="profile-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
          <span className="font-medium text-foreground">Outcall</span>
          <span className="font-semibold text-foreground">{profile.outcall_price ? `$${profile.outcall_price}` : "Ask Me"}</span>
        </div>
      </div>
    </section>
  );
}
