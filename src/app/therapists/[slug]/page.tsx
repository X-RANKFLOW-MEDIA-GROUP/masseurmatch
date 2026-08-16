import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  getCities,
  getProfilePhotos,
  getPublicImportedReviews,
  getPublicTherapistBySlug,
  getPublicTherapists,
  type PublicTherapist,
} from "@/app/_lib/directory";
import {
  getCanonicalIdentityStatusForProfile,
  isIdentityVerified,
} from "@/app/_lib/identity-verification";
import { buildProfilePageMetadata } from "@/app/_lib/profile-metadata";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { ProfileStructuredData } from "@/components/profile/ProfileStructuredData";
import { buildProfileFaq } from "@/components/profile/profile-faq";
import { buildProfileViewModel } from "@/components/profile/profile-utils";
import { VoxProfile } from "@/app/therapists/[slug]/_components/vox/VoxProfile";
import { ImportedReviewsSection } from "@/app/therapists/[slug]/_components/vox/ImportedReviewsSection";
import { DemoProfileBanner } from "@/app/_components/demo-profile-banner";
import { ProfileViewTracker } from "@/app/therapists/[slug]/_components/ProfileViewTracker";
import { ProfilePageTracker } from "@/app/therapists/[slug]/_components/ProfilePageTracker";
import { getPublicProfileExtras } from "@/app/therapists/[slug]/_lib/profile-extras";
import { SITE_URL } from "@/lib/site";

type Params = { slug: string };
type ProfileHoursEntry = {
  day?: string;
  enabled?: boolean;
  start_time?: string;
  end_time?: string;
};
type RuntimePublicTherapist = PublicTherapist & {
  studio_hours?: ProfileHoursEntry[] | null;
  mobile_hours?: ProfileHoursEntry[] | null;
  current_status?: string | null;
};

export const revalidate = 60;

async function withCanonicalIdentity(profile: PublicTherapist): Promise<PublicTherapist> {
  const status = await getCanonicalIdentityStatusForProfile(profile.id);
  const verified = isIdentityVerified(status);

  return {
    ...profile,
    verification_status: status,
    is_verified_identity: verified,
    is_verified_profile: false,
  };
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const storedProfile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!storedProfile) {
    return createPageMetadata({
      title: "Therapist profile",
      description: "Public massage therapist profile.",
      path: `/therapists/${resolvedParams.slug}`,
      noIndex: true,
    });
  }

  const dbProfile = await withCanonicalIdentity(storedProfile);
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
  const storedProfile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!storedProfile) notFound();

  const [dbProfile, photos, relatedResult, extras, importedReviews] = await Promise.all([
    withCanonicalIdentity(storedProfile),
    getProfilePhotos(storedProfile.id),
    getPublicTherapists({ city: storedProfile.city || undefined, page: 1, pageSize: 6 }),
    getPublicProfileExtras(storedProfile.id),
    getPublicImportedReviews(storedProfile.id, 100),
  ]);

  const expandedServices = unique([
    ...(dbProfile.service_categories ?? []),
    ...extras.additional_services,
    ...extras.massage_setup,
    ...extras.mobile_extras,
  ]);

  const enrichedDbProfile = {
    ...dbProfile,
    service_categories: expandedServices,
    latitude: extras.latitude ?? dbProfile.latitude ?? null,
    longitude: extras.longitude ?? dbProfile.longitude ?? null,
  } as PublicTherapist;

  const runtimeProfile = dbProfile as RuntimePublicTherapist;
  const profile = buildProfileViewModel(enrichedDbProfile, photos);
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

  const publicDetails: Array<{ label: string; detail?: string | null }> = [];
  if (extras.massage_setup.length) publicDetails.push({ label: "Massage setup", detail: extras.massage_setup.join(", ") });
  if (extras.mobile_extras.length) publicDetails.push({ label: "Mobile / outcall extras", detail: extras.mobile_extras.join(", ") });
  if (extras.additional_services.length) publicDetails.push({ label: "Additional services", detail: extras.additional_services.join(", ") });
  if (extras.studio_amenities.length) publicDetails.push({ label: "Studio amenities", detail: extras.studio_amenities.join(", ") });
  if (extras.products_used.length) publicDetails.push({ label: "Products used", detail: extras.products_used.join(", ") });
  if (extras.products_sold.length) publicDetails.push({ label: "Products available", detail: extras.products_sold.join(", ") });
  if (extras.payment_methods.length) publicDetails.push({ label: "Payment methods", detail: extras.payment_methods.join(", ") });
  if (extras.rate_disclaimers.length) publicDetails.push({ label: "Rate notes", detail: extras.rate_disclaimers.join(" · ") });
  if (extras.regular_discounts.length) publicDetails.push({ label: "Regular discounts", detail: extras.regular_discounts.join(", ") });
  if (extras.day_of_week_discount) {
    const percent = extras.day_of_week_discount.percent;
    const day = extras.day_of_week_discount.day;
    if (typeof percent === "number" && typeof day === "string") {
      publicDetails.push({ label: "Weekly discount", detail: `${percent}% on ${day}` });
    }
  }
  for (const affiliation of extras.affiliations) {
    publicDetails.push({ label: affiliation, detail: "Professional affiliation" });
  }

  const training = [
    ...(Array.isArray(dbProfile.training) ? dbProfile.training : []),
    ...publicDetails,
  ];

  const education = extras.education_entries.length
    ? extras.education_entries.map((item) => ({
        label: typeof item.degree === "string" && item.degree ? item.degree : "Education",
        institution: typeof item.institution === "string" ? item.institution : null,
      }))
    : Array.isArray(dbProfile.education)
      ? dbProfile.education
      : [];

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
        studioHours={Array.isArray(runtimeProfile.studio_hours) ? runtimeProfile.studio_hours : []}
        mobileHours={Array.isArray(runtimeProfile.mobile_hours) ? runtimeProfile.mobile_hours : []}
        currentStatus={typeof runtimeProfile.current_status === "string" ? runtimeProfile.current_status : ""}
        training={training}
        education={education}
      />
      <ImportedReviewsSection reviews={importedReviews} />
    </>
  );
}
