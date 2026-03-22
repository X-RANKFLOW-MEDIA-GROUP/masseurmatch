import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";

interface Props {
  profile: PublicTherapist;
}

export function ProfileAbout({ profile }: Props) {
  const name = getPublicProfileName(profile);
  const city = profile.city || "the United States";
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const topTechniques = (profile.specialties || []).slice(0, 3).join(", ") || "massage therapy";
  const yearsExp = profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);

  const seoText = profile.bio
    || `I provide professional massage therapy in ${city}, specializing in ${topTechniques}. ${
      yearsExp ? `With over ${yearsExp} years of experience, I` : "I"
    } offer customized sessions focused on relaxation, recovery, and muscle relief. Serving clients in ${
      neighborhood ? `${neighborhood} and surrounding areas` : city
    }, I offer both incall and mobile massage services designed to meet individual needs.`;

  return (
    <section id="about" className="profile-panel scroll-mt-24 p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Professional Massage Therapist in {city}</h2>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{seoText}</p>
    </section>
  );
}
