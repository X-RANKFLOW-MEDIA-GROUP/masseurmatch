import { MODALITIES } from "@/lib/seo/modalities";

export type SeoBlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  excerpt: string;
  body: string[];
  faq: { question: string; answer: string }[];
  internalLinks: string[];
};

const topics = [
"How to choose a massage therapist near you",
"How to find a gay friendly massage therapist",
"How to find an LGBT friendly massage therapist",
"Gay massage versus LGBT friendly massage search intent explained professionally",
"What to expect from a professional massage session",
"Deep tissue massage versus Swedish massage",
"Sports massage for recovery",
"Therapeutic massage for stress and muscle tension",
"Incall versus outcall massage",
"Mobile massage guide",
"How to compare massage therapist profiles",
"Questions to ask before contacting a massage therapist",
"Massage etiquette for first time clients",
"How to prepare for an outcall massage",
"How to choose between mobile and studio massage",
"What makes a massage profile trustworthy",
"How independent massage therapists get discovered online",
"How massage directories help independent providers",
"How to write a massage therapist bio",
"Profile photo guidelines for massage therapists",
"How therapists can improve their MasseurMatch profile",
"How to get more direct inquiries as a massage therapist",
"Local SEO for independent massage therapists",
"How to safely contact a massage therapist online",
"What details to check before scheduling a massage",
"How to find massage therapists while traveling",
"Best massage styles for back tension",
"Best massage styles for athletes",
"Best massage styles for stress relief",
"How to describe massage services professionally",
"Why direct contact directories are different from booking platforms",
"How to search for massage by city",
"How to search for massage by modality",
"How to choose a male massage therapist",
"How to find professional massage providers online",
"How to build trust as an independent massage therapist",
"How clear service details improve massage profile conversion",
"How availability signals help users choose providers",
"How location pages help users find local massage therapists",
"How MasseurMatch works",
];

export const SEO_BLOG_POSTS: SeoBlogPost[] = topics.map((title, index) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  const keyword = index % 2 === 0 ? "massage therapist near me" : "lgbt friendly massage";
  return {
    slug,
    title,
    metaTitle: `${title} | MasseurMatch Blog`,
    metaDescription: `Professional guidance from MasseurMatch on ${title.toLowerCase()}. Learn how to browse profiles and contact therapists directly with confidence.`,
    category: index % 3 === 0 ? "Client Guides" : index % 3 === 1 ? "Therapist Growth" : "Massage Education",
    primaryKeyword: keyword,
    secondaryKeywords: ["independent massage therapist", "massage profiles", "contact directly"],
    excerpt: `Learn ${title.toLowerCase()} with a practical, safety-first checklist built for directory users and independent therapists.`,
    body: [
      `MasseurMatch is a directory where users browse professional profiles and contact therapists directly by phone, SMS, WhatsApp, email, or website. This guide explains ${title.toLowerCase()} with practical steps and professional language.`,
      "Start by comparing profile clarity: city coverage, modalities, session format, and contact options. Well-structured profiles reduce confusion and improve response quality for both visitors and providers.",
      "Use search pages by city and modality, then shortlist therapists with complete profile details. Reach out directly with concise messages, session goals, and preferred contact method.",
      "MasseurMatch does not provide in-platform booking or payment handling. Every inquiry is direct, transparent, and controlled by the therapist.",
    ],
    faq: [
      { question: "Does MasseurMatch offer in-platform booking?", answer: "No. MasseurMatch is a directory only. Users contact therapists directly." },
      { question: "Can I compare therapists by style and location?", answer: "Yes. Compare by city, modality, availability signals, and contact preference." },
    ],
    internalLinks: ["/search", "/near-me", "/therapists", "/massage"],
  };
});

export function buildCityIntro(city: string): string {
  return `Find independent massage therapists in ${city}. Compare profile quality, massage style, availability, and direct contact preferences in one place.`;
}

export const POPULAR_MODALITY_LINKS = MODALITIES.filter((m) => m.slug !== "available-now").map((m) => m.slug);
