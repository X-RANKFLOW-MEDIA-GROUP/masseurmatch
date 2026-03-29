"use client";

import Link from "next/link";
import type { PublicTherapist, ImportedReview } from "@/app/_lib/directory";
import { useFadeInOnScroll } from "./useFadeInOnScroll";
import { PremiumProfileHero } from "./PremiumProfileHero";
import { PremiumProfileAbout } from "./PremiumProfileAbout";
import { PremiumProfileServices } from "./PremiumProfileServices";
import { PremiumProfilePricing } from "./PremiumProfilePricing";
import { PremiumProfileSidebar } from "./PremiumProfileSidebar";
import { PremiumProfileReviews } from "./PremiumProfileReviews";
import { ProfileAIChat } from "./ProfileAIChat";
import { KnottyProfileTracker } from "./KnottyProfileTracker";
import "./premium-profile.css";

interface Props {
  profile: PublicTherapist;
  reviews: ImportedReview[];
  cityPath: string;
}

export function PremiumProfilePage({ profile, reviews, cityPath }: Props) {
  useFadeInOnScroll();

  const city = profile.city || "United States";
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const name = profile.display_name || profile.full_name || "Therapist";
  const ratedReviews = reviews.filter((r): r is ImportedReview & { rating: number } => r.rating != null);

  const seoLinks = [
    `Gay massage ${city}`,
    `Deep tissue massage ${neighborhood || city}`,
    `Male massage therapist ${city}`,
    `LGBT massage ${city}`,
    `Sports massage ${neighborhood || city}`,
    `Mobile massage ${city}`,
    `Massage therapist near ${neighborhood || city}`,
  ];

  return (
    <div className="premium-profile min-h-screen">
      <KnottyProfileTracker
        therapistId={profile.id}
        city={profile.city}
        neighborhood={neighborhood || null}
      />

      <nav className="pp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="pp-bc-sep">/</span>
        <Link href={cityPath}>{city}</Link>
        <span className="pp-bc-sep">/</span>
        <Link href={cityPath.startsWith("/search") ? `${cityPath}&type=massage-therapists` : `${cityPath}/massage-therapists`}>Massage Therapists</Link>
        <span className="pp-bc-sep">/</span>
        <span className="pp-bc-current">{name}</span>
      </nav>

      <PremiumProfileHero profile={profile} reviews={ratedReviews} />

      <div className="pp-main">
        <div className="pp-left-col">
          <PremiumProfileAbout profile={profile} />

          <div className="pp-divider" />

          <PremiumProfileServices profile={profile} />

          <div className="pp-divider" />

          <PremiumProfilePricing profile={profile} />

          {reviews.length > 0 && (
            <>
              <div className="pp-divider" />
              <PremiumProfileReviews reviews={reviews} city={city} />
            </>
          )}
        </div>

        <aside className="pp-sidebar">
          <PremiumProfileSidebar profile={profile} />
        </aside>
      </div>

      <div className="pp-seo-footer">
        <div className="pp-seo-footer-inner">
          <h4>Related Searches</h4>
          <div className="pp-seo-links">
            {seoLinks.map((label) => (
              <Link
                key={label}
                href={`/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(label)}`}
                className="pp-seo-link"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="pp-site-footer">
        <div className="pp-footer-logo">Masseur<span>Match</span></div>
        <div className="pp-footer-copy">© {new Date().getFullYear()} XRankFlow Media Group LLC · {city} · MasseurMatch.com</div>
      </div>

      <ProfileAIChat profile={profile} />
    </div>
  );
}
