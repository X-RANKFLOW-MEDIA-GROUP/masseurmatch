import { JsonLd } from "@/app/_components/JsonLd";
import type { ProfileViewModel } from "./profile-utils";

export function ProfileStructuredData({ profile }: { profile: ProfileViewModel }) {
  const address = { "@type": "PostalAddress", addressLocality: profile.city, addressRegion: profile.state, addressCountry: profile.country };
  const contactPoint = [profile.phone && { "@type": "ContactPoint", telephone: profile.phone, contactType: "phone" }, profile.email && { "@type": "ContactPoint", email: profile.email, contactType: "email" }].filter(Boolean);
  const data = [
    { "@context": "https://schema.org", "@type": "ProfilePage", name: profile.seoTitle, description: profile.seoDescription, url: profile.canonicalUrl, image: profile.ogImage, mainEntity: { "@type": "Person", name: profile.name, image: profile.profilePhotoUrl, address, knowsLanguage: profile.languages } },
    { "@context": "https://schema.org", "@type": "LocalBusiness", name: profile.name, description: profile.seoDescription, image: profile.ogImage, url: profile.canonicalUrl, address, areaServed: profile.serviceAreas, priceRange: profile.startingPrice, contactPoint },
    { "@context": "https://schema.org", "@type": "Service", name: `${profile.name} massage services`, description: `${profile.services.join(", ")} in ${profile.city}, ${profile.state}`, provider: { "@type": "Person", name: profile.name }, areaServed: profile.serviceAreas, serviceType: profile.services },
  ];
  return <>{data.map((item, index) => <JsonLd key={index} data={item} />)}</>;
}
