import type { PublicTherapist, ProfileTrainingEntry } from "@/app/_lib/directory";

function normalizeTraining(value: unknown): ProfileTrainingEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ProfileTrainingEntry =>
      typeof item === "object" && item !== null && typeof (item as ProfileTrainingEntry).label === "string",
  );
}

interface Props {
  profile: PublicTherapist;
}

export function ProfileTraining({ profile }: Props) {
  const entries = normalizeTraining(profile.training);
  const yearsExp = profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
  const education = Array.isArray(profile.education)
    ? profile.education.map((item) => (typeof item === "string" ? item : item.label || item.institution || "")).filter(Boolean).join(", ")
    : profile.education;

  if (entries.length === 0 && !yearsExp && !education) return null;

  return (
    <section className="profile-panel p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Training and Experience</h2>

      <div className="mt-4 space-y-3">
        {entries.map((entry, i) => (
          <div key={`train-${i}`} className="profile-panel-soft rounded-2xl px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{entry.label}</p>
            {entry.detail && <p className="mt-1 text-muted-foreground">{entry.detail}</p>}
          </div>
        ))}

        {education && (
          <div className="profile-panel-soft rounded-2xl px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{education}</p>
          </div>
        )}

        {yearsExp && (
          <div className="profile-panel-soft rounded-2xl px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{yearsExp}+ Years Experience</p>
          </div>
        )}

        {profile.specialties && profile.specialties.length > 0 && (
          <div className="profile-panel-soft rounded-2xl px-4 py-3 text-sm">
            <p className="font-medium text-foreground">Specialized in:</p>
            <ul className="mt-2 list-inside list-disc text-muted-foreground">
              {profile.specialties.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
