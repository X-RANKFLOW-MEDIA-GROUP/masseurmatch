import type { PublicTherapist } from "@/app/_lib/directory";

interface Props {
  profile: PublicTherapist;
}

export function ProfileServices({ profile }: Props) {
  const city = profile.city || "your area";
  const services = profile.specialties ?? [];

  if (services.length === 0) return null;

  return (
    <section id="services" className="profile-panel scroll-mt-24 p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Massage Services in {city}</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service} className="profile-panel-soft flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-action-primary" />
            {service}
          </li>
        ))}
      </ul>
    </section>
  );
}
