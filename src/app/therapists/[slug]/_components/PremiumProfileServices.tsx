"use client";

import type { PublicTherapist } from "@/app/_lib/directory";

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfileServices({ profile }: Props) {
  const specialties = profile.specialties || ["Swedish", "Deep Tissue", "Sports", "Relaxing", "Therapeutic"];
  const featured = new Set(specialties.slice(0, 3).map(s => s.toLowerCase()));

  return (
    <section className="pp-fade-in" id="specialties">
      <div className="pp-sec-label">Specialties</div>
      <div className="pp-sec-title">{specialties.length} Massage Techniques</div>
      <div className="pp-techniques-grid">
        {specialties.map((specialty) => (
          <span
            key={specialty}
            className={`pp-technique-pill${featured.has(specialty.toLowerCase()) ? " featured" : ""}`}
          >
            {specialty}
          </span>
        ))}
      </div>
    </section>
  );
}
