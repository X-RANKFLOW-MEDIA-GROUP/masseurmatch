import type { PublicTherapist } from "@/app/_lib/directory";

interface Props {
  profile: PublicTherapist;
}

export function ProfileAreasServed({ profile }: Props) {
  const areas = profile.areas_served;
  if (!areas || areas.length === 0) return null;

  return (
    <section className="profile-panel p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Areas Served</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <li key={area} className="profile-panel-soft flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-action-primary" />
            {area}
          </li>
        ))}
      </ul>
    </section>
  );
}
