import { siteUrl } from "@/lib/site";

export interface BlogPostMetadata {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: string;
  readTime: number; // minutes
  category: "client-guide" | "therapist-guide" | "wellness" | "local-seo";
  keywords: string[];
  imageUrl?: string;
}

export const generateArticleSchema = ({
  title,
  excerpt,
  slug,
  publishedAt,
  updatedAt,
  author,
  imageUrl,
}: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: string;
  imageUrl?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description: excerpt,
  url: siteUrl(`/blog/${slug}`),
  datePublished: publishedAt.toISOString(),
  ...(updatedAt ? { dateModified: updatedAt.toISOString() } : {}),
  author: {
    "@type": "Organization",
    name: author,
    url: siteUrl("/"),
  },
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: siteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: siteUrl("/logo.png"),
      width: 600,
      height: 60,
    },
  },
  ...(imageUrl ? { image: imageUrl } : {}),
  mainEntity: {
    "@type": "BlogPosting",
    headline: title,
  },
});

export const BLOG_SEO_STRATEGY = {
  "client-guides": [
    {
      title: "How to Find an LGBTQ+-Affirming Male Massage Therapist Near Me",
      slug: "find-lgbtq-affirming-massage-therapist",
      keywords: [
        "LGBTQ+ affirming massage therapist",
        "gay-friendly massage near me",
        "inclusive massage therapy",
      ],
      category: "client-guide",
      intent: "informational + navigational",
    },
    {
      title: "Deep Tissue Massage: Benefits, Techniques, and What to Expect",
      slug: "deep-tissue-massage-guide",
      keywords: ["deep tissue massage benefits", "deep tissue massage techniques"],
      category: "wellness",
      intent: "informational",
    },
    {
      title: "Sports Massage for Athletes: Recovery and Performance",
      slug: "sports-massage-athletes",
      keywords: ["sports massage", "athletic recovery", "massage for athletes"],
      category: "wellness",
      intent: "informational",
    },
    {
      title: "Swedish Massage vs Deep Tissue: Which Is Right for You?",
      slug: "swedish-vs-deep-tissue",
      keywords: ["Swedish massage", "massage comparison"],
      category: "client-guide",
      intent: "commercial",
    },
  ],
  "therapist-guides": [
    {
      title: "6 Local SEO Strategies for Massage Therapists to Rank Higher",
      slug: "local-seo-massage-therapists",
      keywords: [
        "SEO for massage therapists",
        "local SEO strategy",
        "how to rank massage therapy",
      ],
      category: "therapist-guide",
      intent: "informational",
    },
    {
      title: "How to Build a Massage Therapy Practice in [City]",
      slug: "build-massage-practice",
      keywords: ["massage therapy business", "private practice setup"],
      category: "therapist-guide",
      intent: "informational",
    },
    {
      title: "Marketing Tips for Independent Massage Therapists",
      slug: "marketing-massage-therapists",
      keywords: ["massage therapist marketing", "client acquisition"],
      category: "therapist-guide",
      intent: "informational",
    },
  ],
};

export const generateFAQFromBlogPost = (
  title: string,
  keywords: string[]
): Array<{ question: string; answer: string }> => [
  {
    question: `What is ${title.toLowerCase()}?`,
    answer: `${title} is a key topic in wellness and massage therapy. Understanding this concept helps both clients make better choices and therapists provide better service.`,
  },
  {
    question: `Why is ${keywords[0]?.toLowerCase() || "this topic"} important?`,
    answer: `This topic directly impacts client satisfaction, recovery outcomes, and the overall effectiveness of massage therapy services.`,
  },
  {
    question: `How can I ${title.includes("How") ? "learn more" : "benefit from"} ${keywords[0]?.toLowerCase() || "this"}?`,
    answer: `Research, experimentation, and consultation with qualified professionals are the best approaches to understanding and implementing these practices.`,
  },
];
