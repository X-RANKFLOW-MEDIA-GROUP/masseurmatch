import { JsonLd } from "@/app/_components/JsonLd";
import type { ProfileViewModel } from "./profile-utils";

type Credential = { "@type": string; credentialCategory: string; name: string; description: string };

type SourceProfile = Record<string, unknown>;

function buildCredentials(profile: ProfileViewModel) {
  const credentials: Credential[] = [];
  if (profile.isVerified) {
    credentials.push({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: "Platform Verified",
      description: "Profile reviewed by MasseurMatch before listing",
    });
  }
  return credentials;
}

function buildOfferCatalog(profile: ProfileViewModel) {
  if (!profile.pricing.length && !profile.services.length) return undefined;

  const offers = profile.pricing.length
    ? profile.pricing.map((session) => ({
        "@type": "Offer",
        name: session.name,
        description: `${session.duration}${session.incall !== "Contact for rates" ? ` — Incall: ${session.incall}` : ""}${session.outcall !== "Contact for rates" ? `, Outcall: ${session.outcall}` : ""}`,
        priceCurrency: profile.currency || "USD",
        availability: "https://schema.org/InStock",
        itemOffered: { "@type": "Service", name: session.name },
      }))
    : profile.services.slice(0, 6).map((service) => ({
        "@type": "Offer",
        name: service,
        priceCurrency: profile.currency || "USD",
        availability: "https://schema.org/InStock",
        itemOffered: { "@type": "Service", name: service },
      }));

  return { "@type": "OfferCatalog", name: `${profile.name} massage services`, itemListElement: offers };
}

function dateValue(value: unknown) {
  if (typeof value !== "string" || !value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function verifiedSameAs(sourceProfile: SourceProfile) {
  const values = [sourceProfile.website, sourceProfile.instagram, sourceProfile.facebook, sourceProfile.linkedin]
    .filter((value): value is string => typeof value === "string" && /^https?:\/\//i.test(value));
  return values.length ? Array.from(new Set(values)) : undefined;
}

export function ProfileStructuredData({
  profile,
  sourceProfile = {},
}: {
  profile: ProfileViewModel;
  sourceProfile?: SourceProfile;
}) {
  const address = { "@type": "PostalAddress", addressLocality: profile.city, addressRegion: profile.state, addressCountry: profile.country };
  const contactPoint = [profile.phone && { "@type": "ContactPoint", telephone: profile.phone, contactType: "phone" }, profile.email && { "@type": "ContactPoint", email: profile.email, contactType: "email" }].filter(Boolean);
  const credentials = buildCredentials(profile);
  const offerCatalog = buildOfferCatalog(profile);
  const allServices = Array.from(new Set([...profile.services, ...profile.specialties, ...profile.massageTypes]));
  const dateCreated = dateValue(sourceProfile.created_at || sourceProfile.member_since);
  const dateModified = dateValue(sourceProfile.updated_at || sourceProfile.last_active_at);
  const sameAs = verifiedSameAs(sourceProfile);

  const person = {
    "@type": "Person",
    "@id": `${profile.canonicalUrl}#provider`,
    identifier: profile.id,
    name: profile.name,
    image: profile.galleryImages.length ? profile.galleryImages : [profile.profilePhotoUrl],
    address,
    knowsLanguage: profile.languages,
    knowsAbout: allServices.length ? allServices : undefined,
    sameAs,
    ...(credentials.length ? { hasCredential: credentials } : {}),
  };

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${profile.canonicalUrl}#profile-page`,
      identifier: profile.id,
      name: profile.seoTitle,
      description: profile.seoDescription,
      url: profile.canonicalUrl,
      image: profile.galleryImages.length ? profile.galleryImages : [profile.ogImage],
      dateCreated,
      dateModified,
      mainEntity: person,
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${profile.canonicalUrl}#business`,
      identifier: profile.id,
      name: profile.name,
      description: profile.seoDescription,
      image: profile.galleryImages.length ? profile.galleryImages : [profile.ogImage],
      url: profile.canonicalUrl,
      address,
      areaServed: profile.serviceAreas,
      priceRange: profile.startingPrice,
      contactPoint,
      sameAs,
      ...(offerCatalog ? { hasOfferCatalog: offerCatalog } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${profile.canonicalUrl}#service`,
      name: `${profile.name} massage services`,
      description: `${profile.services.join(", ")} in ${profile.city}, ${profile.state}`,
      provider: { "@id": `${profile.canonicalUrl}#provider` },
      areaServed: profile.serviceAreas,
      serviceType: profile.services,
    },
  ];
  return <>{data.map((item, index) => <JsonLd key={index} data={item} />)}</>;
}
