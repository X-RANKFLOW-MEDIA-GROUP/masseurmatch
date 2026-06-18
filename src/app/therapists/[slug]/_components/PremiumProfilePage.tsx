"use client";

import Link from "next/link";
import type { PublicTherapist, ProfilePhoto, ImportedReview } from "@/app/_lib/directory";
import { useFadeInOnScroll } from "./useFadeInOnScroll";
import { PremiumProfileHero } from "./PremiumProfileHero";
import { PremiumProfileAbout } from "./PremiumProfileAbout";
import { PremiumProfileServices } from "./PremiumProfileServices";
import { PremiumProfilePricing } from "./PremiumProfilePricing";
import { PremiumProfileCTA } from "./PremiumProfileCTA";
import { ProfileAIChat } from "./ProfileAIChat";
import { PremiumProfileGallery } from "./PremiumProfileGallery";
import { PremiumProfileAvailability } from "./PremiumProfileAvailability";
import { PremiumProfileFaq } from "./PremiumProfileFaq";
import { ProfileTravel } from "./ProfileTravel";
import { KnottyProfileTracker } from "./KnottyProfileTracker";
import { ProfileAreasServed } from "./ProfileAreasServed";
import { PremiumProfileContact } from "./PremiumProfileContact";
import { ReviewsDisplay } from "@/components/reviews/ReviewsDisplaySection";
import { SocialProofBadges } from "@/components/social/SocialProofBadges";
import "./premium-profile.css";

interface Props {
  profile: PublicTherapist;
  photos: ProfilePhoto[];
  reviews: ImportedReview[];
  cityPath: string;
}

export function PremiumProfilePage({ profile, photos, reviews, cityPath }: Props) {
  useFadeInOnScroll();

  const city = profile.city || "United States";
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  return (
    <div className="premium-profile min-h-screen">
      <div className="pp-wrap">
        <KnottyProfileTracker
          therapistId={profile.id}
          city={profile.city}
          neighborhood={neighborhood || null}
        />

        <nav className="pp-breadcrumb" aria-label="Breadcrumb">
          <Link href={cityPath}>{city}</Link>
          <span>{">"}</span>
          <Link href={cityPath}>Massage Therapists</Link>
          <span>{">"}</span>
          <span className="text-[var(--cream)]">{profile.display_name || profile.full_name}</span>
        </nav>

        <PremiumProfileHero profile={profile} cityPath={cityPath} reviews={reviews} />

        <section className="pp-section pp-fade-in" id="gallery">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Gallery</h2>
            <Link href="#upgrade" className="pp-section-link">
              View all photos {"->"}
            </Link>
          </div>
          <PremiumProfileGallery profile={profile} photos={photos} />
        </section>

        <section className="pp-section pp-fade-in">
          <SocialProofBadges
            isTopRated={avgRating >= 4.7}
            isMostReviewed={reviews.length >= 20}
            isRising={Boolean(profile.available_now)}
            reviewCount={reviews.length}
            averageRating={avgRating}
            viewCount={profile.profile_views ?? 0}
          />
        </section>

        {reviews.length > 0 && (
          <section className="pp-section pp-fade-in" id="reviews">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Client Reviews</h2>
              <span className="text-sm text-slate-500">{reviews.length} verified reviews</span>
            </div>
            <ReviewsDisplay
              reviews={reviews.map((review) => ({
                id: review.id,
                author_name: review.reviewer_name || "Verified Client",
                rating: review.rating ?? 5,
                body: review.review_text || "",
                created_at: review.review_date || new Date().toISOString(),
              }))}
              averageRating={avgRating}
              totalReviews={reviews.length}
            />
          </section>
        )}

        <PremiumProfileAbout profile={profile} reviews={reviews} />
        <PremiumProfileServices profile={profile} />
        <PremiumProfilePricing profile={profile} />
        <PremiumProfileContact profile={profile} />

        <section className="pp-section pp-fade-in" id="availability">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Availability</h2>
            <span className="flex items-center gap-2 text-xs text-[var(--green)]">
              <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
              Updated in real time
            </span>
          </div>
          <PremiumProfileAvailability profile={profile} />
        </section>

        {Array.isArray(profile.travel_schedule) && profile.travel_schedule.length > 0 && (
          <section className="pp-section pp-fade-in" id="travel">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Travel Schedule</h2>
            </div>
            <ProfileTravel profile={profile} />
          </section>
        )}

        <section className="pp-section pp-fade-in" id="location">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Location</h2>
          </div>
          <ProfileAreasServed profile={profile} />
        </section>

        <section className="pp-section pp-fade-in" id="faq">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Frequently Asked Questions</h2>
          </div>
          <PremiumProfileFaq profile={profile} />
        </section>

        <section className="pp-section pp-fade-in" id="browse-more">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Browse More in {city}</h2>
          </div>
          <div className="pp-internal-links">
            <Link href={`/search?city=${encodeURIComponent(city)}&keyword=gay+massage`} className="pp-int-link">
              Gay Massage {city}
            </Link>
            <Link href={`/search?city=${encodeURIComponent(city)}`} className="pp-int-link">
              All {city} Therapists
            </Link>
            {neighborhood && (
              <Link href={`/search?city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(neighborhood)}`} className="pp-int-link">
                {neighborhood} Massage
              </Link>
            )}
            <Link href={`/search?city=${encodeURIComponent(city)}&keyword=outcall`} className="pp-int-link">
              Outcall {city}
            </Link>
            <Link href={`/search?city=${encodeURIComponent(city)}&keyword=deep+tissue`} className="pp-int-link">
              Deep Tissue {city}
            </Link>
            <Link href={`/search?city=${encodeURIComponent(city)}&keyword=swedish`} className="pp-int-link">
              Swedish Massage {city}
            </Link>
            <Link href={`/search?city=${encodeURIComponent(city)}&keyword=lgbtq`} className="pp-int-link">
              LGBTQ+ Massage {city}
            </Link>
          </div>
        </section>

        <PremiumProfileCTA profile={profile} />
      </div>

      {profile.subscription_tier === "elite" && <ProfileAIChat profile={profile} />}
    </div>
  );
}
