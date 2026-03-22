import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: BlogSection[];
  category: string;
  tags: string[];
  author: BlogAuthor;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  coverImage?: string;
  coverAlt?: string;
}

export interface BlogAuthor {
  name: string;
  title: string;
  bio: string;
}

export interface BlogSection {
  type: "paragraph" | "h2" | "h3" | "ul" | "ol" | "blockquote" | "callout";
  content: string | string[];
}

export interface BlogListItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
}

// Editorial team default author
const EDITORIAL_AUTHOR: BlogAuthor = {
  name: "MasseurMatch Editorial",
  title: "Wellness & Inclusivity Editor",
  bio: "The MasseurMatch editorial team produces evidence-based wellness content for LGBTQ+-inclusive audiences.",
};

// ─── Supabase Integration ─────────────────────────────────────────────────────

/**
 * Fetch all published blog post slugs for generateStaticParams.
 */
export async function getBlogSlugs(): Promise<string[]> {
  const { data } = await (supabase as any)
    .from("blog_posts")
    .select("slug")
    .order("published_at", { ascending: false });

  if (data?.length) {
    return data.map((row: { slug: string }) => row.slug);
  }

  // Fallback to hardcoded slugs
  return FALLBACK_POSTS.map((p) => p.slug);
}

/**
 * Fetch a single blog post by slug.
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data } = await (supabase as any)
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (data) {
    return mapSupabasePost(data);
  }

  // Fallback to hardcoded content
  return FALLBACK_FULL_POSTS[slug] ?? null;
}

/**
 * Fetch blog posts for the listing page.
 */
export async function getBlogListItems(options?: {
  category?: string;
  tag?: string;
  limit?: number;
}): Promise<{ featured: BlogListItem | null; posts: BlogListItem[] }> {
  const limit = options?.limit ?? 20;

  let query = (supabase as any)
    .from("blog_posts")
    .select("slug, title, excerpt, tags, published_at, seo_description")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (options?.tag) {
    query = query.contains("tags", [options.tag]);
  }

  const { data } = await query;

  if (data?.length) {
    const items: BlogListItem[] = data.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      category: inferCategory(row.tags),
      tags: row.tags || [],
      date: formatDate(row.published_at),
      readTime: estimateReadTime(row.excerpt),
    }));

    return { featured: items[0] ?? null, posts: items.slice(1) };
  }

  // Fallback
  const all = options?.category && options.category !== "All"
    ? FALLBACK_POSTS.filter((p) => p.category === options.category)
    : FALLBACK_POSTS;
  return { featured: all[0] ?? null, posts: all.slice(1) };
}

/**
 * Fetch related posts for sidebar.
 */
export async function getRelatedPosts(
  currentSlug: string,
  limit = 3,
): Promise<BlogListItem[]> {
  const { data } = await (supabase as any)
    .from("blog_posts")
    .select("slug, title, excerpt, tags, published_at")
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (data?.length) {
    return data.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      category: inferCategory(row.tags),
      tags: row.tags || [],
      date: formatDate(row.published_at),
      readTime: estimateReadTime(row.excerpt),
    }));
  }

  return FALLBACK_POSTS.filter((p) => p.slug !== currentSlug).slice(0, limit);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapSupabasePost(row: any): BlogPost {
  // The content field in Supabase can be either:
  // 1. A JSON string of BlogSection[] (structured)
  // 2. Plain text / markdown (legacy)
  let sections: BlogSection[];
  try {
    const parsed = typeof row.content === "string" ? JSON.parse(row.content) : row.content;
    if (Array.isArray(parsed)) {
      sections = parsed;
    } else {
      sections = [{ type: "paragraph", content: String(row.content) }];
    }
  } catch {
    // Treat as plain text paragraphs
    sections = String(row.content)
      .split("\n\n")
      .filter(Boolean)
      .map((p: string) => ({ type: "paragraph" as const, content: p }));
  }

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || row.seo_description || "",
    content: sections,
    category: inferCategory(row.tags),
    tags: row.tags || [],
    author: EDITORIAL_AUTHOR,
    publishedAt: row.published_at,
    updatedAt: row.updated_at || row.published_at,
    readTimeMinutes: Math.ceil(
      String(row.content).split(/\s+/).length / 200,
    ),
  };
}

function inferCategory(tags: string[] | null): string {
  if (!tags?.length) return "Wellness Tips";
  const t = tags.map((t) => t.toLowerCase());
  if (t.some((x) => x.includes("lgbtq") || x.includes("trans") || x.includes("queer")))
    return "LGBTQ+ Health";
  if (t.some((x) => x.includes("therapist") || x.includes("practice") || x.includes("business")))
    return "For Therapists";
  if (t.some((x) => x.includes("city") || x.includes("dallas") || x.includes("guide")))
    return "City Guides";
  if (t.some((x) => x.includes("industry") || x.includes("news")))
    return "Industry News";
  return "Wellness Tips";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function estimateReadTime(excerpt: string): string {
  // Rough estimate; real post length unknown from listing
  const words = excerpt.split(/\s+/).length;
  const mins = Math.max(3, Math.ceil(words / 40));
  return `${mins} min read`;
}

// ─── Fallback Data ────────────────────────────────────────────────────────────

const FALLBACK_POSTS: BlogListItem[] = [
  {
    slug: "what-to-expect-first-massage",
    category: "Wellness Tips",
    title: "What to Expect at Your First Massage Appointment",
    excerpt: "First-time clients often have questions about etiquette, comfort levels, and communication. Here's how to prepare for a relaxed, confident experience.",
    tags: ["first massage", "massage tips", "new clients", "wellness"],
    date: "March 15, 2025",
    readTime: "6 min read",
  },
  {
    slug: "lgbtq-affirming-massage-guide",
    category: "LGBTQ+ Health",
    title: "How to Find an LGBTQ+-Affirming Massage Therapist",
    excerpt: "Your therapeutic environment matters. Learn what signals to look for and what questions to ask when searching for an inclusive therapist.",
    tags: ["LGBTQ+", "affirming care", "massage therapy"],
    date: "March 8, 2025",
    readTime: "5 min read",
  },
  {
    slug: "deep-tissue-vs-swedish",
    category: "Wellness Tips",
    title: "Deep Tissue vs Swedish Massage: Which Is Right for You?",
    excerpt: "Two of the most popular massage modalities serve very different purposes. Break down the key differences before your next booking.",
    tags: ["deep tissue", "swedish", "modalities"],
    date: "February 28, 2025",
    readTime: "4 min read",
  },
  {
    slug: "massage-therapist-dallas-guide",
    category: "City Guides",
    title: "The Best Neighborhoods to Find Massage Therapists in Dallas",
    excerpt: "From Uptown to Oak Cliff, Dallas has a thriving wellness scene. Our guide maps the top areas for licensed massage therapy.",
    tags: ["dallas", "city guide", "Texas"],
    date: "February 20, 2025",
    readTime: "7 min read",
  },
  {
    slug: "grow-massage-practice-online",
    category: "For Therapists",
    title: "5 Ways to Grow Your Massage Practice Online in 2025",
    excerpt: "Independent therapists need a digital presence. Here are the highest-ROI strategies for building a sustainable client base.",
    tags: ["therapist business", "practice growth", "marketing"],
    date: "February 10, 2025",
    readTime: "8 min read",
  },
  {
    slug: "massage-anxiety-relief",
    category: "Wellness Tips",
    title: "Massage Therapy as an Anxiety Relief Tool: What the Research Says",
    excerpt: "The evidence for massage as a clinical stress intervention is growing. We break down the latest research in accessible language.",
    tags: ["anxiety", "research", "wellness"],
    date: "January 30, 2025",
    readTime: "5 min read",
  },
  {
    slug: "trans-inclusive-bodywork",
    category: "LGBTQ+ Health",
    title: "Trans-Inclusive Bodywork: What Therapists Need to Know",
    excerpt: "Creating genuine safety for transgender clients requires more than good intentions. Practical guidance for therapists committed to inclusive practice.",
    tags: ["trans", "LGBTQ+", "inclusive bodywork"],
    date: "January 22, 2025",
    readTime: "6 min read",
  },
];

// Full content for the one implemented hardcoded post
const FALLBACK_FULL_POSTS: Record<string, BlogPost> = {
  "what-to-expect-first-massage": {
    slug: "what-to-expect-first-massage",
    title: "What to Expect at Your First Massage Appointment",
    excerpt: "First-time clients often have questions about etiquette, comfort levels, and how to communicate with their therapist. Here's everything you need to arrive confident.",
    category: "Wellness Tips",
    tags: ["first massage", "massage tips", "new clients", "wellness"],
    publishedAt: "2025-03-15T09:00:00Z",
    updatedAt: "2025-03-15T09:00:00Z",
    readTimeMinutes: 6,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "Booking your first massage can come with questions — what do I wear? What do I say? What if I'm uncomfortable? These are completely normal concerns, and having clear answers makes the experience significantly better for everyone." },
      { type: "h2", content: "Before Your Appointment" },
      { type: "paragraph", content: "Arrive 10–15 minutes early for your first appointment. This buffer gives you time to complete intake forms, use the restroom, and begin to decompress. Rushing in stressed is counterproductive." },
      { type: "paragraph", content: "Hydrate well beforehand and avoid eating a heavy meal within 90 minutes of your session. Light eating is fine — arriving hungry can make it hard to relax." },
      { type: "h2", content: "What to Wear (and What Happens to It)" },
      { type: "paragraph", content: "Most full-body massage modalities are performed with the client unclothed or in underwear, under a draping sheet. You will only ever be uncovered in the area being actively worked on — professional therapists follow strict draping protocols at all times." },
      { type: "callout", content: "You are always in control. You can ask to remain fully clothed, request specific areas not be worked on, or stop the session at any point — a good therapist will never make you feel awkward for any of these requests." },
      { type: "h2", content: "Communicating with Your Therapist" },
      { type: "paragraph", content: "Good communication is the single biggest factor in massage quality. Tell your therapist about injuries, areas of tension, and your pressure preferences at the outset. Don't white-knuckle through pressure that's too intense — speaking up gets you a better result." },
      { type: "ul", content: ["\"Can we focus more on my shoulders and less on my legs?\"", "\"The pressure is a bit too deep — can you lighten up?\"", "\"I'd prefer not to have my abdomen worked on today.\"", "\"This is my first time, so I might need guidance.\""] },
      { type: "h2", content: "For LGBTQ+ Clients Specifically" },
      { type: "paragraph", content: "Therapeutic massage involves a level of physical vulnerability that can feel different depending on your relationship with your body, your history, and whether you feel genuinely safe with the person treating you. You deserve a therapist who creates real safety — not just tolerance." },
      { type: "paragraph", content: "Every therapist on MasseurMatch has committed to our LGBTQ+-Inclusive Practice Standards. You can filter by therapists with specific training in affirming care for transgender clients, clients with trauma histories, and others with specialized needs." },
      { type: "h2", content: "After Your Session" },
      { type: "paragraph", content: "Drink extra water after your session — massage mobilizes metabolic waste in muscle tissue and hydration helps clear it. Some soreness in the 24 hours following a deep tissue session is normal. A warm bath or light stretching can help." },
      { type: "paragraph", content: "Give feedback to your therapist — what worked, what didn't. This information shapes your next session and helps them serve you better over time." },
    ],
  },
};
