import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  getCities,
  getProfilePhotos,
  getPublicTherapistBySlug,
  getPublicTherapists,
} from "@/app/_lib/directory";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { InternalLinks } from "@/components/profile/InternalLinks";
import { MobileContactCTA, StickyContactCard } from "@/components/profile/StickyContactCard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileKnotty } from "@/components/profile/ProfileKnotty";
import { ProfileLocationMap } from "@/components/profile/ProfileLocationMap";
import { ProfileQandA } from "@/components/profile/ProfileQandA";
import { ProfileStructuredData } from "@/components/profile/ProfileStructuredData";
import { SeoContentSections } from "@/components/profile/SeoContentSections";
import { buildProfileFaq } from "@/components/profile/profile-faq";
import { buildProfileViewModel } from "@/components/profile/profile-utils";

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
    robots: {
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
  const knottyFacts = {
    name: profile.name,
    firstName: profile.name.split(" ")[0] || profile.name,
    city: profile.city,
    neighborhood: profile.neighborhood,
    services: profile.services,
    specialties: profile.specialties,
    startingPrice: profile.startingPrice,
    incallPrice: profile.incallPrice,
    outcallPrice: profile.outcallPrice,
    incallAvailable: profile.incallAvailable,
    outcallAvailable: profile.outcallAvailable,
    travelRadius: /mile/i.test(profile.travelRadius) ? profile.travelRadius : "",
    availabilityDays: profile.availabilityDays,
    availabilityHours: profile.availabilityHours,
    yearsExperience: profile.yearsExperience,
    preferredContactMethod: profile.preferredContactMethod,
    lgbtqAffirming: Boolean(dbProfile.lgbtq_affirming),
    availableNow: Boolean(dbProfile.available_now),
  };

  return (
    <main className="min-h-screen bg-[#071018] text-[#F8FAFC]" style={{ background: "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 35%), radial-gradient(circle at bottom right, rgba(14,165,233,0.08), transparent 30%), #071018" }}>
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Therapists", path: "/therapists" }, ...(matchedCity ? [{ name: matchedCity.name, path: `/${matchedCity.slug}` }] : []), { name: profile.name, path: profilePath }])} />
      {faqItems.length > 0 ? <JsonLd data={buildFaqJsonLd(faqItems)} /> : null}
      <ProfileStructuredData profile={profile} />

      <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#071018]/[0.72] backdrop-blur-2xl" aria-label="Profile navigation">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link href="/" className="font-display text-lg font-bold tracking-[-0.03em] text-white">MasseurMatch</Link>
          <div className="hidden items-center gap-5 text-sm text-[#94A3B8] md:flex">
            <a href="#services" className="hover:text-white">Services</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#location" className="hover:text-white">Location</a>
            <a href="#faq" className="hover:text-white">Q&amp;A</a>
            <a href="#ask-knotty" className="hover:text-white">Ask Knotty</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </nav>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-6 pb-28 sm:px-8 sm:py-8 lg:grid-cols-[1fr_380px] lg:pb-12">
        <div className="space-y-8">
          <ProfileHero profile={profile} />
          <SeoContentSections profile={profile} />
          <ProfileLocationMap profile={profile} />
          <ProfileQandA items={faqItems} name={profile.name} />
          <ProfileKnotty facts={knottyFacts} />
          <InternalLinks profile={profile} relatedProfiles={relatedResult.items} />
        </div>
        <StickyContactCard profile={profile} />
      </div>
      <MobileContactCTA profile={profile} />
    </main>
  );
}
