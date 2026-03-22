import Link from "next/link";
import type { PublicTherapist } from "@/app/_lib/directory";
import { getCities } from "@/app/_lib/directory";

interface Props {
  profile: PublicTherapist;
}

export function ProfileRelatedLocations({ profile }: Props) {
  const city = profile.city;
  if (!city) return null;

  const allCities = getCities();
  // Show up to 6 other cities from the same state, or nearby cities
  const related = allCities
    .filter((c) => c.name.toLowerCase() !== city.toLowerCase())
    .slice(0, 6);

  if (related.length === 0) return null;

  return (
    <section className="profile-panel p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Browse More Locations</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {related.map((c) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className="inline-flex items-center rounded-full border border-border-subtle bg-white/82 px-4 py-2 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-brand-secondary/30 hover:bg-white"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
