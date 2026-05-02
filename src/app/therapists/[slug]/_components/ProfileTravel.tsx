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
        {trips.map((trip, i) => (
          <div
            key={`trip-${i}`}
            className="flex items-center justify-between rounded-lg border border-[var(--glass-border)] bg-[var(--cream-dim)] px-4 py-3 text-sm"
          >
            <span className="font-medium text-[var(--cream)]">
              {trip.city}{trip.state ? `, ${trip.state}` : ""}
            </span>
            <span className="text-[var(--text-muted)]">
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
