import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/JsonLd";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/app/_lib/seo";
import { ProfileStructuredData } from "@/components/profile/ProfileStructuredData";
import { buildProfileFaq } from "@/components/profile/profile-faq";
import { VoxProfile } from "@/app/therapists/[slug]/_components/vox/VoxProfile";
import { BRUNO_PROFILE, BRUNO_REVIEWS } from "@/app/therapists/[slug]/_components/vox/bruno-demo";

export const metadata: Metadata = {
  title: BRUNO_PROFILE.seoTitle,
  description: BRUNO_PROFILE.seoDescription,
  alternates: { canonical: "/therapists/bruno-dallas-tx" },
};

export default function BrunoDallasTxPage() {
  const faqItems = buildProfileFaq(BRUNO_PROFILE);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Therapists", path: "/therapists" },
          { name: "Dallas", path: "/dallas" },
          { name: BRUNO_PROFILE.name, path: "/therapists/bruno-dallas-tx" },
        ])}
      />
      {faqItems.length > 0 ? <JsonLd data={buildFaqJsonLd(faqItems)} /> : null}
      <ProfileStructuredData profile={BRUNO_PROFILE} />
      <VoxProfile
        profile={BRUNO_PROFILE}
        faqItems={faqItems}
        relatedProfiles={[]}
        availableNow
        lgbtqAffirming
        knottyPrompt="Tell me about Bruno, a massage therapist in Oak Lawn, Dallas. What services and availability does he offer?"
        reviews={BRUNO_REVIEWS}
        rating={5.0}
        reviewCount={12}
      />
    </>
  );
}
