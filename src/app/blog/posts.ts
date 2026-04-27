export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  blocks: BlogBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "benefits-of-booking-local-massage-therapists",
    title: "Top 7 Benefits of Booking Local Massage Therapists Near You",
    excerpt: "Learn why local therapists improve convenience, consistency, and recovery outcomes for busy clients.",
    publishedAt: "2026-04-25",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: `Searching for "massage therapists near me" is about speed, trust, and repeatable quality. Local therapists reduce travel friction and make regular wellness routines easier to maintain.` },
      { type: "heading", text: "Why local booking performs better" },
      { type: "list", items: ["Faster scheduling windows", "Easier repeat appointments", "Better neighborhood familiarity", "Lower travel-related cancellations"] },
    ],
  },
  {
    slug: "local-seo-strategies-for-therapists",
    title: "6 Local SEO Strategies to Rank Higher in Google and Bing for Massage Services",
    excerpt: "Actionable local SEO playbook for therapists who want more profile views and qualified leads.",
    publishedAt: "2026-04-25",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: `Local intent keywords like "deep tissue massage in Dallas" convert better when profile metadata, headings, and reviews align around one city and one core service cluster.` },
      { type: "heading", text: "Fast SEO wins" },
      { type: "list", items: ["City + modality headings", "Neighborhood-specific copy", "Consistent photo alt text", "Schema markup with location context"] },
    ],
  },
  {
    slug: "compare-therapist-profiles-before-booking",
    title: "How to Compare Therapist Profiles Before Booking (Reviews, Rates, and Service Fit)",
    excerpt: "Use this quick framework to compare experience, pricing, and service style before contacting a therapist.",
    publishedAt: "2026-04-25",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "A strong comparison process reduces booking hesitation. Focus on starting rates, session formats, specialties, and review depth before reaching out." },
      { type: "heading", text: "3-minute compare checklist" },
      { type: "list", items: ["Check neighborhood and travel range", "Compare starting rates for 60 minutes", "Prioritize complete profiles with clear specialties"] },
    ],
  },
  {
    slug: "how-to-choose-a-massage-therapist",
    title: "How to Choose the Right Massage Therapist",
    excerpt: "A simple checklist to find a therapist who matches your goals, budget, and comfort level.",
    publishedAt: "2026-03-10",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "Choosing the right therapist starts with clarity: what do you need right now? Relief, recovery, or deep relaxation?" },
      { type: "heading", text: "Start with your goal" },
      { type: "list", items: ["Pain relief and recovery", "Stress reduction", "Athletic maintenance"] },
      { type: "paragraph", text: "Then compare specialties, session formats, and communication style before booking." },
    ],
  },
  {
    slug: "incall-vs-outcall-guide",
    title: "Incall vs Outcall: Which Session Type Is Better?",
    excerpt: "Understand the tradeoffs between visiting a studio and booking a therapist to come to you.",
    publishedAt: "2026-02-28",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "Incall often offers a fully prepared treatment environment. Outcall gives convenience and privacy at home or hotel." },
      { type: "heading", text: "Quick decision framework" },
      { type: "list", items: ["Need convenience: choose outcall", "Need specialized setup: choose incall", "Traveling: confirm outcall coverage first"] },
    ],
  },
  {
    slug: "first-session-etiquette",
    title: "First Session Etiquette: What to Expect",
    excerpt: "A short guide to communication, boundaries, and preparation before your first appointment.",
    publishedAt: "2026-02-15",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "Clear communication and mutual respect create better outcomes for both client and therapist." },
      { type: "list", items: ["Arrive clean and on time", "Discuss goals and pressure preferences", "Respect boundaries and posted policies"] },
    ],
  },
];
