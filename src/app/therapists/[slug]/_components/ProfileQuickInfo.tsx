import type { PublicTherapist } from "@/app/_lib/directory";

interface Props {
  profile: PublicTherapist;
}

export function ProfileQuickInfo({ profile }: Props) {
  const yearsExp = profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
  const techniqueCount = profile.specialties?.length ?? 0;
  const isPro = profile._tier === "pro" || profile._tier === "elite";

  const items: { label: string; value: string | number; proOnly?: boolean }[] = [
    ...(yearsExp ? [{ label: "Years Experience", value: `${yearsExp}+` }] : []),
    ...(techniqueCount > 0 ? [{ label: "Techniques", value: techniqueCount }] : []),
    ...(isPro && profile.profile_views ? [{ label: "Views", value: profile.profile_views.toLocaleString(), proOnly: true }] : []),
    ...(isPro && profile.contact_clicks ? [{ label: "Contacts", value: profile.contact_clicks.toLocaleString(), proOnly: true }] : []),
  ];

  if (items.length === 0) return null;

  return (
    <section className="profile-panel p-6 md:p-7">
      <h2 className="sr-only">Quick Info</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="profile-panel-soft rounded-[1.5rem] p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {item.label}
              {item.proOnly && <span className="ml-1 text-[10px] uppercase text-primary">Pro+</span>}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
