import { JsonLd } from "@/app/_components/JsonLd";
import type { ProfileViewModel } from "./profile-utils";

type Credential = { "@type": string; credentialCategory: string; name: string; description: string };

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

export function ProfileStructuredData({ profile }: { profile: ProfileViewModel }) {
  const address = { "@type": "PostalAddress", addressLocality: profile.city, addressRegion: profile.state, addressCountry: profile.country };
  const contactPoint = [profile.phone && { "@type": "ContactPoint", telephone: profile.phone, contactType: "phone" }, profile.email && { "@type": "ContactPoint", email: profile.email, contactType: "email" }].filter(Boolean);
  const credentials = buildCredentials(profile);
  const offerCatalog = buildOfferCatalog(profile);
  const allServices = Array.from(new Set([...profile.services, ...profile.specialties, ...profile.massageTypes]));

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: profile.seoTitle,
      description: profile.seoDescription,
      url: profile.canonicalUrl,
      image: profile.ogImage,
      mainEntity: {
        "@type": "Person",
        name: profile.name,
        image: profile.profilePhotoUrl,
        address,
        knowsLanguage: profile.languages,
        knowsAbout: allServices.length ? allServices : undefined,
        ...(credentials.length ? { hasCredential: credentials } : {}),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: profile.name,
      description: profile.seoDescription,
      image: profile.ogImage,
      url: profile.canonicalUrl,
      address,
      areaServed: profile.serviceAreas,
      priceRange: profile.startingPrice,
      contactPoint,
      ...(offerCatalog ? { hasOfferCatalog: offerCatalog } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${profile.name} massage services`,
      description: `${profile.services.join(", ")} in ${profile.city}, ${profile.state}`,
      provider: { "@type": "Person", name: profile.name },
      areaServed: profile.serviceAreas,
      serviceType: profile.services,
    },
  ];
  return <>{data.map((item, index) => <JsonLd key={index} data={item} />)}</>;
}
