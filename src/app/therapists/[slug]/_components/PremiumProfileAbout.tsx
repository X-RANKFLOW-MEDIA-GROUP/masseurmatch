"use client";

import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfileAbout({ profile }: Props) {
  const name = getPublicProfileName(profile).split(" ")[0];
  const city = profile.city || "the area";
  const neighborhood = profile.neighborhood_name || profile.primary_area || "";
  const yearsExp = profile.years_experience || (profile.start_year ? new Date().getFullYear() - profile.start_year : 5);
  const specialties = profile.specialties || [];

  return (
    <section className="pp-fade-in" id="about">
      <div className="pp-sec-label">About</div>
      <div className="pp-sec-title">
        Therapeutic Bodywork<br />in {city}
      </div>
      <div className="pp-about-text">
        {profile.bio ? (
          <p>{profile.bio}</p>
        ) : (
          <>
            <p>
              My name is <strong>{name}</strong> — a massage therapist with <strong>{yearsExp} years of experience</strong> providing
              professional therapeutic bodywork in a respectful, inclusive environment.
            </p>
            <p>
              Every session is <strong>LGBT+ welcoming</strong> and focuses on physical recovery and stress relief
              {specialties.length > 0 && (
                <> through specialized {specialties.slice(0, 3).map((s, i) => (
                  <span key={s}>{i > 0 && (i === specialties.slice(0, 3).length - 1 ? ", and " : ", ")}<strong>{s}</strong></span>
                ))}</>
              )}.
            </p>
            {(profile.incall_price || profile.outcall_price) && (
              <p>
                {profile.incall_price && (
                  <>I work from a <strong>private studio in {neighborhood || city}</strong></>
                )}
                {profile.incall_price && profile.outcall_price && ", and also offer "}
                {profile.outcall_price && (
                  <>{!profile.incall_price ? "I offer " : ""}<strong>mobile outcall services</strong> to homes and hotels</>
                )}
                {neighborhood && <> throughout <strong>{neighborhood}</strong> and surrounding areas</>}.
              </p>
            )}
            <p>Each session delivers a specialized therapeutic experience tailored to your wellness goals.</p>
          </>
        )}
      </div>
    </section>
  );
}
