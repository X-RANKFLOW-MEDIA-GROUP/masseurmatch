import type { City, Therapist } from "@/mm/types";
import { appUrl, appName } from "@/mm/lib/env";

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: appName,
    url: appUrl,
    sameAs: [appUrl],
  };
}

export function buildCityJsonLd(city: City, therapistCount: number): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${city.name} massage therapist directory`,
    description: city.description,
    url: `${appUrl}/${city.slug}`,
    about: {
      "@type": "City",
      name: city.name,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: therapistCount,
    },
  };
}

export function buildTherapistJsonLd(therapist: Therapist, city: City): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["Person", "LocalBusiness"],
    name: therapist.displayName,
    description: therapist.bio,
    image: therapist.photoUrl,
    url: `${appUrl}/therapists/${therapist.slug}`,
    telephone: therapist.phone,
    email: therapist.contactEmail,
    areaServed: city.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.stateCode,
      addressCountry: "US",
    },
  };
}
