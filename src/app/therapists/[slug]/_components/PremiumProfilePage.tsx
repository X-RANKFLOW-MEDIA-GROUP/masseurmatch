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
import { PremiumProfileLocation } from "./PremiumProfileLocation";
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

        {/* Breadcrumb */}
        <nav className="pp-breadcrumb" aria-label="Breadcrumb">
          <Link href={cityPath}>{city}</Link>
          <span>{">"}</span>
          <Link href={cityPath}>Massage Therapists</Link>
          <span>{">"}</span>
          <span className="text-[var(--cream)]">{profile.display_name || profile.full_name}</span>
        </nav>

        {/* Hero */}
        <PremiumProfileHero profile={profile} cityPath={cityPath} reviews={reviews} />

        {/* Gallery */}
        <section className="pp-section pp-fade-in" id="gallery">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Gallery</h2>
            <Link href="#upgrade" className="pp-section-link">
              View all photos {"->"}
            </Link>
          </div>
          <PremiumProfileGallery profile={profile} photos={photos} />
        </section>

        {/* Social Proof Badges */}
        <section className="pp-section pp-fade-in">
          <SocialProofBadges
            isTopRated={avgRating >= 4.5}
            isMostReviewed={reviews.length >= 10}
            isRising={Boolean(profile.available_now)}
            reviewCount={reviews.length}
            averageRating={avgRating}
            viewCount={profile.profile_views ?? 0}
          />
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="pp-section pp-fade-in" id="reviews">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Client Reviews</h2>
              <span className="text-sm text-slate-500">{reviews.length} verified reviews</span>
            </div>
            <ReviewsDisplay
              reviews={reviews.map(r => ({
                id: r.id,
                author_name: r.reviewer_name ?? "Anonymous",
                rating: r.rating ?? 0,
                body: r.review_text,
                created_at: r.review_date ?? new Date().toISOString()
              }))}
              averageRating={avgRating}
              totalReviews={reviews.length}
            />
          </section>
        )}

        {/* About */}
        <PremiumProfileAbout profile={profile} reviews={reviews} />

        {/* Services */}
        <PremiumProfileServices profile={profile} />

        {/* Pricing */}
        <PremiumProfilePricing profile={profile} />

        {/* Contact */}
        <PremiumProfileContact profile={profile} />

        {/* Availability */}
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

        {/* Travel */}
        {profile.travel_schedule && profile.travel_schedule.length > 0 && (
          <section className="pp-section pp-fade-in" id="travel">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Travel Schedule</h2>
            </div>
            <ProfileTravel profile={profile} />
          </section>
        )}

        {/* Areas Served */}
        <section className="pp-section pp-fade-in" id="location">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Location</h2>
          </div>
          <ProfileAreasServed profile={profile} />
        </section>

        {/* FAQ - always show, will use defaults if no custom FAQ */}
        <section className="pp-section pp-fade-in" id="faq">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Frequently Asked Questions</h2>
          </div>
          <PremiumProfileFaq profile={profile} />
        </section>

        {/* Browse More Links */}
        <section className="pp-section pp-fade-in" id="browse-more">
          <div className="pp-section-header">
            <h2 className="pp-section-title">Browse More in {city}</h2>
          </div>
          <div className="pp-internal-links">
            <Link href={`/search?city=${encodeURIComponent(city)}&q=gay+massage`} className="pp-int-link">
              Gay Massage {city}
            </Link>
            <Link href={`/search?city=${encodeURIComponent(city)}`} className="pp-int-link">
              All {city} Therapists
            </Link>
            {neighborhood && (
              <Link href={`/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(neighborhood)}`} className="pp-int-link">
                {neighborhood} Massage
              </Link>
            )}
            <Link href={`/search?city=${encodeURIComponent(city)}&q=outcall`} className="pp-int-link">
              Outcall {city}
            </Link>
            <Link href={`/search?city=${encodeURIComponent(city)}&q=deep+tissue`} className="pp-int-link">
              Deep Tissue {city}
            </Link>
            <Link href={`/search?city=${encodeURIComponent(city)}&q=swedish`} className="pp-int-link">
              Swedish Massage {city}
            </Link>
            <Link href={`/search?city=${encodeURIComponent(city)}&q=lgbtq`} className="pp-int-link">
              LGBTQ+ Massage {city}
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <PremiumProfileCTA profile={profile} />

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="pp-section pp-fade-in" id="reviews">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Reviews</h2>
            </div>
            <div className="space-y-4">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-[var(--glass-border)] bg-[var(--cream-dim)] p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-[var(--orange)]">
                      {"★".repeat(review.rating || 5)}
                      {"☆".repeat(5 - (review.rating || 5))}
                    </div>
                    {review.reviewer_name && (
                      <span className="text-xs text-[var(--text-muted)]">by {review.reviewer_name}</span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--cream-soft)]">{review.review_text}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* AI Chat Widget */}
      <ProfileAIChat profile={profile} />
    </div>
  );
}
