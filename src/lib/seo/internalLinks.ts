import { SEO_CITIES } from "@/lib/seo/cities";
import { MODALITIES } from "@/lib/seo/modalities";

export function homepageInternalLinks() {
  return [
    ...SEO_CITIES.slice(0, 8).map((city) => ({ href: `/massage/${city.slug}`, anchor: `Massage therapists in ${city.name}` })),
    { href: "/search", anchor: "Find massage therapists near you" },
    { href: "/therapists", anchor: "View therapist profiles" },
    { href: "/near-me", anchor: "Search by current location" },
  ];
}

export function cityInternalLinks(citySlug: string) {
  return MODALITIES.map((m) => ({ href: `/massage/${citySlug}/${m.slug}`, anchor: `${m.label} in this city` }));
}
