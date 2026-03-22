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
    <section className="profile-panel p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Travel Schedule</h2>
      <p className="mt-1 text-xs text-muted-foreground">{tierLabel}</p>

      <div className="mt-4 space-y-2">
        {trips.map((trip, i) => (
          <div key={`trip-${i}`} className="profile-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
            <span className="font-medium text-foreground">
              {trip.city}{trip.state ? `, ${trip.state}` : ""}
            </span>
            <span className="text-muted-foreground">
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
