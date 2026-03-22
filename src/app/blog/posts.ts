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
