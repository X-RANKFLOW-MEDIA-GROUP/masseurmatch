import { siteUrl } from "@/lib/site";
import { SITE_NAME } from "@/app/_lib/seo";

type FAQ = { question: string; answer: string };

export function buildCompetitorArticleSchema(input: {
  slug: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl("/"),
    },
    mainEntityOfPage: siteUrl(`/massage-directories/${input.slug}`),
    datePublished: "2026-04-28",
    dateModified: "2026-04-28",
  };
}

export function buildCompetitorBreadcrumbSchema(slug: string, crumb: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Massage Directories", item: siteUrl("/massage-directories") },
      { "@type": "ListItem", position: 3, name: crumb, item: siteUrl(`/massage-directories/${slug}`) },
    ],
  };
}

export function buildCompetitorFaqSchema(slug: string, faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    url: siteUrl(`/massage-directories/${slug}`),
  };
}
