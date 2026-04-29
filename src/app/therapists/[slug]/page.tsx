import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  getCities,
  getImportedReviews,
  getProfilePhotos,
  getPublicTherapistBySlug,
  getPublicTherapists,
} from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildHealthAndBeautyBusinessJsonLd,
  buildProfilePageJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { galleryLimit } from "./_components/galleryLimit";
import { PremiumProfilePage } from "./_components/PremiumProfilePage";

type Params = { slug: string };

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await getPublicTherapists({ page: 1, pageSize: 200 });
    return res.items.map((item) => ({ slug: item.slug || item.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!profile) {
    return createPageMetadata({
      title: "Therapist profile",
      description: "Public massage therapist profile.",
      path: `/therapists/${resolvedParams.slug}`,
      noIndex: true,
    });
  }

  const name = getPublicProfileName(profile);
  const city = profile.city || "US";
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const topTechnique = profile.specialties?.[0] || profile.modality || "Massage";
  const yearsExp =
    profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
  const verified = profile.is_verified_identity || profile.is_verified_profile;
  const priceFrom = [profile.incall_price, profile.outcall_price]
    .filter((p): p is number => typeof p === "number" && p > 0)
    .sort((a, b) => a - b)[0];

  const descriptionParts = [
    `${name} is a${yearsExp ? ` ${yearsExp}+ year` : ""} professional massage therapist`,
    neighborhood ? `in ${neighborhood}, ${city}` : `in ${city}`,
    `specializing in ${topTechnique}.`,
    priceFrom ? `Sessions from $${priceFrom}.` : null,
    verified ? "Identity verified." : null,
    "View rates, availability, and contact options directly.",
  ].filter(Boolean);

  const description = profile.bio
    ? profile.bio.length > 160 ? `${profile.bio.slice(0, 157)}...` : profile.bio
    : descriptionParts.join(" ");

  return createPageMetadata({
    title: `${name} | Massage Therapist in ${city} | MasseurMatch`,
    description,
    path: `/therapists/${profile.slug || profile.id}`,
    type: "profile",
    image: profile.avatar_url || undefined,
    keywords: [
      profile.city,
      neighborhood,
      profile.modality,
      ...(profile.specialties || []),
      "massage therapist",
      "male massage therapist",
      "verified massage therapist",
      neighborhood ? `massage ${neighborhood}` : null,
      profile.city ? `LGBTQ massage ${profile.city}` : null,
    ].filter((value): value is string => Boolean(value)),
  });
}

export default async function TherapistPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const profile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!profile) {
    notFound();
  }

  const [reviews, photos] = await Promise.all([
    getImportedReviews(profile.id, 5),
    getProfilePhotos(profile.id, galleryLimit()),
  ]);

  const name = getPublicProfileName(profile);
  const profilePath = `/therapists/${profile.slug || profile.id}`;
  const matchedCity = getCities().find((city) => city.name.toLowerCase() === (profile.city || "").toLowerCase());
  const cityPath = matchedCity
    ? `/${matchedCity.slug}`
    : profile.city
      ? `/search?city=${encodeURIComponent(profile.city)}`
      : "/search";

  const faqItems =
    Array.isArray(profile.custom_faq) && profile.custom_faq.length > 0
      ? (profile.custom_faq as { question: string; answer: string }[])
      : [];

  const reviewSchema = reviews.map((review) => ({
    rating: review.rating,
    reviewText: review.review_text,
    reviewerName: review.reviewer_name,
  }));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Therapists", path: "/therapists" },
          ...(matchedCity ? [{ name: matchedCity.name, path: `/${matchedCity.slug}` }] : []),
          { name, path: profilePath },
        ])}
      />
      <JsonLd
        data={buildProfilePageJsonLd({
          name,
          path: profilePath,
          description:
            profile.bio ||
            `${name} is listed on MasseurMatch with city context, specialties, and direct contact information.`,
          city: profile.city,
          specialties: profile.specialties,
          image: profile.avatar_url,
          incallPrice: profile.incall_price,
          outcallPrice: profile.outcall_price,
          reviews: reviewSchema,
        })}
      />
      <JsonLd
        data={buildHealthAndBeautyBusinessJsonLd({
          name,
          slug: profile.slug || profile.id,
          description:
            profile.bio ||
            `${name} is a professional massage therapist in ${profile.city || "the US"} specializing in ${profile.specialties?.[0] || profile.modality || "Massage"}.`,
          city: profile.city,
          stateCode: matchedCity?.stateCode,
          specialty: profile.specialties?.[0] || profile.modality || "Massage",
          specialties: profile.specialties,
          image: profile.avatar_url,
          phone: profile.phone,
          incallPrice: profile.incall_price,
          outcallPrice: profile.outcall_price,
          reviews: reviewSchema,
        })}
      />
      {faqItems.length > 0 ? <JsonLd data={buildFaqJsonLd(faqItems)} /> : null}

      <PremiumProfilePage profile={profile} photos={photos} reviews={reviews} cityPath={cityPath} />
    </>
  );
}
