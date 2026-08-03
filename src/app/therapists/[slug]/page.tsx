import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  getCities,
  getProfilePhotos,
  getPublicTherapistBySlug,
  getPublicTherapists,
} from "@/app/_lib/directory";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { buildProfilePageMetadata } from "@/app/_lib/profile-metadata";
import { ProfileStructuredData } from "@/components/profile/ProfileStructuredData";
import { buildProfileFaq } from "@/components/profile/profile-faq";
import { buildProfileViewModel } from "@/components/profile/profile-utils";
import { VoxProfile } from "@/app/therapists/[slug]/_components/vox/VoxProfile";
import { DemoProfileBanner } from "@/app/_components/demo-profile-banner";
import { ProfileViewTracker } from "@/app/therapists/[slug]/_components/ProfileViewTracker";
import { ProfilePageTracker } from "@/app/therapists/[slug]/_components/ProfilePageTracker";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

type Params = { slug: string };

type PublicImportedReview = {
  review_text: string | null;
  reviewer_name: string | null;
  reviewer_anonymized: boolean | null;
  review_date: string | null;
  rating: number | null;
};

export const revalidate = 60;

export async function generateStaticParams() {
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masseurmatch.com";

  return buildProfilePageMetadata(
    dbProfile,
    resolvedParams.slug,
    siteUrl,
    profile.seoTitle,
    profile.seoDescription,
    profile.ogImage,
  );
}

export default async function TherapistPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const dbProfile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!dbProfile) notFound();

  const supabase = createSupabaseAdminClient();
  const [photos, relatedResult, importedReviewsResult] = await Promise.all([
    getProfilePhotos(dbProfile.id),
    getPublicTherapists({ city: dbProfile.city || undefined, page: 1, pageSize: 6 }),
    supabase
      .from("imported_reviews")
      .select("review_text, reviewer_name, reviewer_anonymized, review_date, rating")
      .eq("profile_id", dbProfile.id)
      .eq("is_public", true)
      .order("review_date", { ascending: false })
      .limit(100),
  ]);

  const importedReviews = (importedReviewsResult.data ?? []) as PublicImportedReview[];
  const ratedReviews = importedReviews.filter((review) => typeof review.rating === "number");
  const rating = ratedReviews.length > 0
    ? ratedReviews.reduce((sum, review) => sum + Number(review.rating), 0) / ratedReviews.length
    : undefined;
  const reviewCount = importedReviews.length;
  const reviews = importedReviews
    .filter((review) => Boolean(review.review_text))
    .map((review) => ({
      quote: review.review_text || "",
      author: review.reviewer_anonymized || !review.reviewer_name ? "Verified client" : review.reviewer_name,
      date: review.review_date || undefined,
    }));

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
        reviews={reviews}
        rating={rating}
        reviewCount={reviewCount}
        businessHours={dbProfile.business_hours}
        training={Array.isArray(dbProfile.training) ? dbProfile.training : []}
        education={Array.isArray(dbProfile.education) ? dbProfile.education : []}
      />
    </>
  );
}
