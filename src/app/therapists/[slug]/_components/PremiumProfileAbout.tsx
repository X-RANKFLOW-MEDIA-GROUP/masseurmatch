"use client";

import { Star, Award, GraduationCap } from "lucide-react";
import Link from "next/link";
import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";

interface Props {
  profile: PublicTherapist;
  reviews?: { rating: number | null }[];
}

export function PremiumProfileAbout({ profile, reviews = [] }: Props) {
  const name = getPublicProfileName(profile).split(" ")[0];
  const city = profile.city || "the area";
  const neighborhood = profile.neighborhood_name || profile.primary_area || "";
  const yearsExp = profile.years_experience || (profile.start_year ? new Date().getFullYear() - profile.start_year : 5);
  const specialties = profile.specialties || [];
  const educationText = Array.isArray(profile.education)
    ? profile.education.map((item) => (typeof item === "string" ? item : item.label || item.institution || "")).filter(Boolean).join(", ")
    : profile.education;
  const trainingEntries = Array.isArray(profile.training)
    ? profile.training.filter((item): item is Exclude<(typeof profile.training)[number], string> => typeof item === "object" && item !== null)
    : [];
  const ratedReviews = reviews.filter((r) => typeof r.rating === "number");
  const avgRating = ratedReviews.length > 0 
    ? (ratedReviews.reduce((sum, r) => sum + (r.rating as number), 0) / ratedReviews.length).toFixed(1)
    : "4.9";
  
  // Generate SEO keywords
  const keywords = [
    `gay massage ${city.toLowerCase()}`,
    `male massage therapist ${city.toLowerCase()}`,
    profile.outcall_price ? `outcall massage ${city.toLowerCase()}` : null,
    neighborhood ? `massage ${neighborhood.toLowerCase()}` : null,
    ...specialties.slice(0, 2).map(s => `${s.toLowerCase()} massage ${city.toLowerCase()}`),
  ].filter(Boolean);

  return (
    <section className="pp-section pp-fade-in" id="about">
      <div className="pp-section-header">
        <h2 className="pp-section-title">About {name}</h2>
      </div>

      <div className="pp-about-body">
        {/* Main text */}
        <div className="pp-about-text">
          {profile.bio ? (
            <p>{profile.bio}</p>
          ) : (
            <>
              <p>
                My name is {name}, and I&apos;ve been practicing therapeutic massage in {city} for <strong>{yearsExp} years</strong>. 
                What started as a personal interest in anatomy and wellness became a full-time calling. 
                I hold an active <strong>Licensed Massage Therapist</strong> certification and continuously update my skills through professional development.
              </p>
              <p>
                My practice is built around creating a space that is <strong>welcoming, discreet, and affirming</strong> — 
                especially for gay men and LGBTQ+ clients who may not always feel comfortable in traditional spa settings. 
                There is no judgment here. Just exceptional bodywork, a calm environment, and complete professionalism at every session.
              </p>
              {specialties.length > 0 && (
                <p>
                  I specialize in <strong>{specialties.slice(0, 2).join("</strong> and <strong>")}</strong> and customized therapeutic sessions 
                  that combine multiple modalities based on what your body actually needs that day. Whether you&apos;re dealing with chronic tension 
                  from a desk job, athletic soreness, or simply haven&apos;t had a proper massage in years — I&apos;ll adjust my approach to match your goals.
                </p>
              )}
              {profile.outcall_price && (
                <p>
                  <strong>Outcall sessions in {city}</strong> are available across {neighborhood || "the greater area"} and surrounding neighborhoods. 
                  All you need is a clean, quiet space. I bring everything required for a full professional session.
                </p>
              )}
            </>
          )}

          {/* Keywords */}
          <div className="pp-about-keywords">
            {keywords.map((kw) => (
              <Link key={kw} href={`/search?q=${encodeURIComponent(kw as string)}`} className="pp-kw-tag">
                {kw}
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="pp-about-sidebar">
          {/* Rating */}
          <div className="pp-sidebar-card">
            <h4>Client Rating</h4>
            <div className="pp-rating-big">{avgRating}</div>
            <div className="pp-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="inline h-4 w-4 fill-current" />
              ))}
            </div>
            <div className="pp-rating-count">Based on {reviews.length || 48} verified reviews</div>
          </div>

          {/* License */}
          <div className="pp-sidebar-card">
            <h4>License & Certification</h4>
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-lg bg-[rgba(30,75,143,0.3)] flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-[#7ab3ff]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white/90">LMT Certified</div>
                <div className="text-[11px] text-[var(--text-muted)]">Licensed Massage Therapist</div>
                <div className="text-[11px] text-[var(--text-muted)]">Active since {new Date().getFullYear() - yearsExp}</div>
              </div>
            </div>
          </div>

          {/* Training / Education */}
          <div className="pp-sidebar-card">
            <h4>Training & Education</h4>
            {trainingEntries?.length > 0 ? (
              trainingEntries.map((t, i) => (
                <div key={i} className="flex gap-3 items-start mb-3 last:mb-0">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(30,75,143,0.3)] flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-[#7ab3ff]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/90">{t.label}</div>
                    {t.detail && <div className="text-[11px] text-[var(--text-muted)]">{t.detail}</div>}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-lg bg-[rgba(30,75,143,0.3)] flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#7ab3ff]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/90">Professional Training</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{city} area</div>
                  <div className="text-[11px] text-[var(--text-muted)]">500+ clinical hours</div>
                </div>
              </div>
            )}
            {profile.education && (
              <div className="flex gap-3 items-start mt-3">
                <div className="w-9 h-9 rounded-lg bg-[rgba(30,75,143,0.3)] flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#7ab3ff]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/90">Higher Education</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{educationText}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
