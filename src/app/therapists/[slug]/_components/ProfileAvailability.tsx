import type { PublicTherapist } from "@/app/_lib/directory";

type HoursMap = Record<string, string>;

function normalizeHours(value: unknown): { incall: HoursMap; outcall: HoursMap } {
  if (!value || typeof value !== "object") return { incall: {}, outcall: {} };
  if ("incall" in value || "outcall" in value) {
    const s = value as { incall?: HoursMap; outcall?: HoursMap };
    return { incall: s.incall || {}, outcall: s.outcall || {} };
  }
  return { incall: value as HoursMap, outcall: {} };
}

interface Props {
  profile: PublicTherapist;
}

export function ProfileAvailability({ profile }: Props) {
  const hours = normalizeHours(profile.business_hours);
  const hasIncall = Object.keys(hours.incall).length > 0;
  const hasOutcall = Object.keys(hours.outcall).length > 0;

  if (!hasIncall && !hasOutcall) return null;

  const city = profile.city || "your area";

  return (
    <section className="profile-panel p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Massage Availability in {city}</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Incall */}
        <div className="profile-panel-soft rounded-[1.5rem] p-5">
          <h3 className="text-lg font-semibold text-foreground">Incall</h3>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            {hasIncall ? (
              Object.entries(hours.incall).map(([day, time]) => (
                <div key={day} className="flex items-center justify-between gap-4">
                  <span className="font-medium text-foreground">{day}</span>
                  <span>{time}</span>
                </div>
              ))
            ) : (
              <p>Schedule shared directly with clients.</p>
            )}
          </div>
        </div>

        {/* Outcall */}
        <div className="profile-panel-soft rounded-[1.5rem] p-5">
          <h3 className="text-lg font-semibold text-foreground">Outcall</h3>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            {hasOutcall ? (
              Object.entries(hours.outcall).map(([day, time]) => (
                <div key={day} className="flex items-center justify-between gap-4">
                  <span className="font-medium text-foreground">{day}</span>
                  <span>{time}</span>
                </div>
              ))
            ) : (
              <p>Outcall hours available by appointment.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
