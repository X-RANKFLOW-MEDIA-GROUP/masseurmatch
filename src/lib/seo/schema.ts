import { siteUrl, SITE_NAME } from "@/lib/seo/site";

export const schema = {
  website: () => ({ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: siteUrl("/") }),
  organization: () => ({ "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: siteUrl("/") }),
  breadcrumb: (items: { name: string; path: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: siteUrl(item.path) })),
  }),
  itemList: (name: string, urls: string[]) => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: urls.map((url, index) => ({ "@type": "ListItem", position: index + 1, url: siteUrl(url) })),
  }),
  person: (name: string, city: string, profilePath: string) => ({ "@context": "https://schema.org", "@type": "Person", name, url: siteUrl(profilePath), homeLocation: city }),
  professionalService: (name: string, city: string, profilePath: string) => ({ "@context": "https://schema.org", "@type": "ProfessionalService", name, areaServed: city, url: siteUrl(profilePath) }),
  faq: (items: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  }),
  article: (title: string, description: string, path: string) => ({ "@context": "https://schema.org", "@type": "Article", headline: title, description, url: siteUrl(path), publisher: { "@type": "Organization", name: SITE_NAME } }),
};
