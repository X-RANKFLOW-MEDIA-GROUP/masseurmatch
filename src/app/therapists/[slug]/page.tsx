import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  getCities,
  getProfilePhotos,
  getPublicTherapistBySlug,
  getPublicTherapists,
} from "@/app/_lib/directory";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { ProfileStructuredData } from "@/components/profile/ProfileStructuredData";
import { buildProfileFaq } from "@/components/profile/profile-faq";
import { buildProfileViewModel } from "@/components/profile/profile-utils";
import { VoxProfile } from "@/app/therapists/[slug]/_components/vox/VoxProfile";
import { DemoProfileBanner } from "@/app/_components/demo-profile-banner";

type Params = { slug: string };

export const revalidate = 60;

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

  return {
    title: profile.seoTitle,
    description: profile.seoDescription,
    keywords: profile.seoKeywords,
    alternates: { canonical: profile.canonicalUrl },
    openGraph: {
      title: profile.seoTitle,
      description: profile.seoDescription,
      images: [{ url: profile.ogImage, alt: `${profile.name} massage therapist in ${profile.city}, ${profile.state}` }],
      url: profile.canonicalUrl,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: profile.seoTitle,
      description: profile.seoDescription,
      images: [profile.ogImage],
    },
    robots: dbProfile.is_demo
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export default async function TherapistPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const dbProfile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!dbProfile) notFound();

  const [photos, relatedResult] = await Promise.all([
    getProfilePhotos(dbProfile.id),
    getPublicTherapists({ city: dbProfile.city || undefined, page: 1, pageSize: 6 }),
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

  return (
    <>
      {dbProfile.is_demo && <DemoProfileBanner />}
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Therapists", path: "/therapists" }, ...(matchedCity ? [{ name: matchedCity.name, path: `/${matchedCity.slug}` }] : []), { name: profile.name, path: profilePath }])} />
      {faqItems.length > 0 ? <JsonLd data={buildFaqJsonLd(faqItems)} /> : null}
      <ProfileStructuredData profile={profile} />
      <VoxProfile
        profile={profile}
        faqItems={faqItems}
        relatedProfiles={relatedProfiles}
        availableNow={Boolean(dbProfile.available_now)}
        lgbtqAffirming={Boolean(dbProfile.lgbtq_affirming)}
        knottyPrompt={knottyPrompt}
      />
    </>
  );
}
