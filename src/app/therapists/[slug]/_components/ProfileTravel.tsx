import type { PublicTherapist, ProfileTravelEntry } from "@/app/_lib/directory";

function normalizeTravelSchedule(value: unknown): ProfileTravelEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ProfileTravelEntry =>
      typeof item === "object" && item !== null && typeof (item as ProfileTravelEntry).city === "string",
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Returns "visiting_now" | "visiting_soon" | "upcoming" | "past" */
function getTripStatus(trip: ProfileTravelEntry): "visiting_now" | "visiting_soon" | "upcoming" | "past" {
  const now = Date.now();
  const start = new Date(trip.start_date).getTime();
  const end = new Date(trip.end_date).getTime() + 24 * 60 * 60 * 1000 - 1; // inclusive end of day
  const soonThreshold = 14 * 24 * 60 * 60 * 1000; // 14 days

  if (now >= start && now <= end) return "visiting_now";
  if (start > now && start - now <= soonThreshold) return "visiting_soon";
  if (start > now) return "upcoming";
  return "past";
}

interface Props {
  profile: PublicTherapist;
}

export function ProfileTravel({ profile }: Props) {
  const trips = normalizeTravelSchedule(profile.travel_schedule);
  if (trips.length === 0) return null;

  const tierLabel =
    profile._tier === "elite"
      ? "Unlimited trips/month"
      : profile._tier === "pro"
        ? "Up to 6 trips/month"
        : "Up to 2 trips/month";

  return (
    <div>
      <p className="text-xs text-[var(--text-muted)] mb-4">{tierLabel}</p>
      <div className="space-y-2">
        {trips.map((trip, i) => {
          const status = getTripStatus(trip);

          const badge =
            status === "visiting_now" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--green-dim)] border border-[rgba(46,204,138,0.25)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--green)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                Visiting Now
              </span>
            ) : status === "visiting_soon" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,138,31,0.12)] border border-[rgba(255,138,31,0.25)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--orange)]">
                Visiting Soon
              </span>
            ) : null;

          return (
            <div
              key={`trip-${i}`}
              className={[
                "flex items-center justify-between rounded-lg border px-4 py-3 text-sm",
                status === "visiting_now"
                  ? "border-[rgba(46,204,138,0.25)] bg-[var(--green-dim)]"
                  : status === "visiting_soon"
                    ? "border-[rgba(255,138,31,0.18)] bg-[rgba(255,138,31,0.06)]"
                    : "border-[var(--glass-border)] bg-[var(--cream-dim)]",
              ].join(" ")}
            >
              <div className="flex flex-col gap-1.5">
                <span className="font-medium text-[var(--cream)]">
                  {trip.city}{trip.state ? `, ${trip.state}` : ""}
                </span>
                {badge}
              </div>
              <span className="text-[var(--text-muted)] text-xs shrink-0 ml-4">
                {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
