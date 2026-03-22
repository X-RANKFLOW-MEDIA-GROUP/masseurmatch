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
import { ProfileHero } from "./_components/ProfileHero";
import { ProfileGallery } from "./_components/ProfileGallery";
import { ProfileQuickInfo } from "./_components/ProfileQuickInfo";
import { ProfileAvailability } from "./_components/ProfileAvailability";
import { ProfileAbout } from "./_components/ProfileAbout";
import { ProfileServices } from "./_components/ProfileServices";
import { ProfilePricing } from "./_components/ProfilePricing";
import { ProfileAddOns } from "./_components/ProfileAddOns";
import { ProfilePromotions } from "./_components/ProfilePromotions";
import { ProfileTravel } from "./_components/ProfileTravel";
import { ProfileAreasServed } from "./_components/ProfileAreasServed";
import { ProfileTraining } from "./_components/ProfileTraining";
import { ProfileFaq } from "./_components/ProfileFaq";
import { ProfileContact } from "./_components/ProfileContact";
import { ProfileRelatedLocations } from "./_components/ProfileRelatedLocations";
import { ProfileStickyFooter } from "./_components/ProfileStickyFooter";
import { KnottyProfileTracker } from "./_components/KnottyProfileTracker";

type Params = { slug: string };

export const revalidate = 60;

export async function generateStaticParams() {
  const res = await getPublicTherapists({ page: 1, pageSize: 200 });
  return res.items.map((item) => ({ slug: item.slug || item.id }));
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

  const titleParts = [
    name,
    [verified ? "Verified" : null, topTechnique, "Therapist"].filter(Boolean).join(" "),
    [neighborhood, city].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" | ");

  const descParts = [
    `${name} is a${yearsExp ? ` ${yearsExp}+ year` : ""} professional massage therapist`,
    neighborhood ? `in ${neighborhood}, ${city}` : `in ${city}`,
    `specializing in ${topTechnique}.`,
    priceFrom ? `Sessions from $${priceFrom}.` : null,
    verified ? "Identity verified." : null,
    "View rates, availability & book directly.",
  ].filter(Boolean);

  const description = profile.bio
    ? profile.bio.length > 160 ? profile.bio.slice(0, 157) + "..." : profile.bio
    : descParts.join(" ");

  return createPageMetadata({
    title: titleParts,
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
      profile.city ? `gay massage ${profile.city}` : null,
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

  const photoLimit = galleryLimit(profile._tier);
  const [reviews, photos] = await Promise.all([
    getImportedReviews(profile.id, 5),
    getProfilePhotos(profile.id, photoLimit),
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

  const anchorLinks = [
    { href: "#gallery", label: "Gallery" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#pricing", label: "Rates" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];

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
          tier: profile._tier,
          incallPrice: profile.incall_price,
          outcallPrice: profile.outcall_price,
          reviews: reviews.map((review) => ({
            rating: review.rating,
            reviewText: review.review_text,
            reviewerName: review.reviewer_name,
          })),
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
          image: profile.avatar_url,
          phone: profile.phone,
          incallPrice: profile.incall_price,
          outcallPrice: profile.outcall_price,
          reviews: reviews.map((review) => ({
            rating: review.rating,
            reviewText: review.review_text,
            reviewerName: review.reviewer_name,
          })),
        })}
      />
      {faqItems.length > 0 ? <JsonLd data={buildFaqJsonLd(faqItems)} /> : null}

      <div className="profile-page-shell page-shell py-10 pb-28 md:pb-14">
        <KnottyProfileTracker
          therapistId={profile.id}
          city={profile.city}
          neighborhood={profile.neighborhood_name || profile.primary_area || null}
        />

        <div className="space-y-10">
          <ProfileHero profile={profile} cityPath={cityPath} />

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_22rem] xl:items-start">
            <div className="space-y-8">
              <nav className="profile-panel sticky top-4 z-20 flex flex-wrap gap-2 px-3 py-3">
                {anchorLinks.map((link) => (
                  <a key={link.href} href={link.href} className="profile-toolbar-link">
                    {link.label}
                  </a>
                ))}
              </nav>

              <ProfileGallery profile={profile} photos={photos} />
              <ProfileAbout profile={profile} />
              <ProfileServices profile={profile} />
              <ProfilePricing profile={profile} />
              <ProfileAddOns profile={profile} />
              <ProfilePromotions profile={profile} />
              <ProfileFaq profile={profile} />
            </div>

            <aside className="space-y-8 xl:sticky xl:top-24">
              <ProfileQuickInfo profile={profile} />
              <ProfileContact profile={profile} />
              <ProfileAvailability profile={profile} />
              <ProfileTravel profile={profile} />
              <ProfileAreasServed profile={profile} />
              <ProfileTraining profile={profile} />
            </aside>
          </div>

          <div className="space-y-10">
            <ProfileRelatedLocations profile={profile} />

            {reviews.length > 0 ? (
              <section className="profile-panel p-6 md:p-7">
                <h2 className="text-2xl font-semibold text-foreground">Reviews</h2>
                <div className="mt-4 space-y-3">
                  {reviews.map((review) => (
                    <article key={review.id} className="profile-panel-soft rounded-[1.5rem] p-4">
                      <p className="text-sm leading-6 text-muted-foreground">{review.review_text}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Rating: {review.rating ?? "N/A"}
                        {review.reviewer_name ? ` · ${review.reviewer_name}` : ""}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      <ProfileStickyFooter profile={profile} />
    </>
  );
}
