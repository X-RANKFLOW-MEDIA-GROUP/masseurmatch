import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  getCities,
  getProfilePhotos,
  getPublicImportedReviews,
  getPublicTherapistBySlug,
  getPublicTherapists,
} from "@/app/_lib/directory";
import { buildProfilePageMetadata } from "@/app/_lib/profile-metadata";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { ProfileStructuredData } from "@/components/profile/ProfileStructuredData";
import { buildProfileFaq } from "@/components/profile/profile-faq";
import { buildProfileViewModel } from "@/components/profile/profile-utils";
import { VoxProfile } from "@/app/therapists/[slug]/_components/vox/VoxProfile";
import { DemoProfileBanner } from "@/app/_components/demo-profile-banner";
import { ProfileViewTracker } from "@/app/therapists/[slug]/_components/ProfileViewTracker";
import { ProfilePageTracker } from "@/app/therapists/[slug]/_components/ProfilePageTracker";
import { SITE_URL } from "@/lib/site";

type Params = { slug: string };

export const revalidate = 60;

function formatReviewDate(value: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export async function generateStaticParams() {
  // Public profiles are generated on demand to avoid build-time database dependency.
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const dbProfile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!dbProfile) {
    return createPageMetadata({
      title: "Therapist profile",
      description: "Public massage therapist profile.",
      path: `/therapists/${resolvedParams.slug}`,
      noIndex: true,
    });
  }

  const profile = buildProfileViewModel(dbProfile);

  return buildProfilePageMetadata(
    dbProfile,
    resolvedParams.slug,
    SITE_URL,
    profile.seoTitle,
    profile.seoDescription,
    profile.ogImage,
  );
}

export default async function TherapistPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const dbProfile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!dbProfile) notFound();

  const [photos, relatedResult, importedReviews] = await Promise.all([
    getProfilePhotos(dbProfile.id),
    getPublicTherapists({ city: dbProfile.city || undefined, page: 1, pageSize: 6 }),
    getPublicImportedReviews(dbProfile.id),
  ]);
  const profile = buildProfileViewModel(dbProfile, photos);
  const matchedCity = getCities().find((city) => city.name.toLowerCase() === profile.city.toLowerCase());
  const profilePath = `/therapists/${profile.slug}`;
  const faqItems = buildProfileFaq(
    profile,
    Array.isArray(dbProfile.custom_faq) ? dbProfile.custom_faq : [],
  );
  const relatedProfiles = relatedResult.items
    .map((item) => {
      const related = item as typeof item & Record<string, unknown>;
      return {
        name: item.display_name || item.full_name || String(related.name || "Therapist"),
        slug: item.slug || item.id,
        city: item.city || profile.city,
        profilePhotoUrl:
          (typeof related.profile_photo_url === "string" && related.profile_photo_url) ||
          item.profile_photo ||
          item.avatar_url ||
          undefined,
      };
    })
    .filter((item) => item.slug !== profile.slug)
    .slice(0, 6);

  const knottyPrompt = `Tell me about ${profile.name}, a massage therapist in ${profile.city}. What services and availability do they offer?`;
  const reviews = importedReviews.map((review) => ({
    quote: review.review_text,
    author: review.reviewer_name || "Imported reviewer",
    date: formatReviewDate(review.review_date),
    rating: review.rating ?? undefined,
    sourceLabel: review.public_label || "Imported review",
  }));
  const importedRatings = importedReviews
    .map((review) => review.rating)
    .filter((rating): rating is number => typeof rating === "number" && Number.isFinite(rating));
  const importedAverage = importedRatings.length > 0
    ? importedRatings.reduce((total, rating) => total + rating, 0) / importedRatings.length
    : undefined;
  const rating = typeof dbProfile.average_rating === "number" && dbProfile.average_rating > 0
    ? dbProfile.average_rating
    : importedAverage;
  const reviewCount = Math.max(dbProfile.review_count ?? 0, reviews.length);

  return (
    <>
      <ProfilePageTracker profile={profile} />
      <ProfileViewTracker profileId={dbProfile.id} source="direct" />
      {dbProfile.is_demo && <DemoProfileBanner />}
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Therapists", path: "/therapists" }, ...(matchedCity ? [{ name: matchedCity.name, path: `/${matchedCity.slug}` }] : []), { name: profile.name, path: profilePath }])} />
      <ProfileStructuredData profile={profile} />
      <VoxProfile
        profile={profile}
        faqItems={faqItems}
        relatedProfiles={relatedProfiles}
        availableNow={Boolean(dbProfile.available_now)}
        lgbtqAffirming={Boolean(dbProfile.lgbtq_affirming)}
        knottyPrompt={knottyPrompt}
        businessHours={dbProfile.business_hours}
        training={Array.isArray(dbProfile.training) ? dbProfile.training : []}
        education={Array.isArray(dbProfile.education) ? dbProfile.education : []}
        reviews={reviews}
        rating={rating}
        reviewCount={reviewCount}
      />
    </>
  );
}
