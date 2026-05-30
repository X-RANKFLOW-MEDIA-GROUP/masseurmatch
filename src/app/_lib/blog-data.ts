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
  const { data } = await supabase
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
  const { data } = await supabase
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

  let query = supabase
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
  const { data } = await supabase
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
    excerpt: "From Uptown to Oak Cliff, Dallas has a thriving wellness scene. Our guide maps the top areas for professional massage therapy.",
    tags: ["dallas", "city guide", "Texas"],
    date: "February 20, 2025",
    readTime: "7 min read",
  },
  {
    slug: "benefits-hiring-massage-therapist-near-you",
    category: "Wellness Tips",
    title: "Top 7 Benefits of Hiring a Massage Therapist Near You",
    excerpt: "Discover why local therapists often deliver faster scheduling, better communication, and a more consistent wellness routine.",
    tags: ["local seo", "near me", "massage therapist", "wellness"],
    date: "April 27, 2026",
    readTime: "6 min read",
  },
  {
    slug: "local-seo-strategies-therapists",
    category: "For Therapists",
    title: "6 Local SEO Strategies That Help Therapists Rank Higher",
    excerpt: "A practical playbook for improving local visibility on Google and Bing with location pages, reviews, and trust-first content.",
    tags: ["local seo", "google business profile", "bing places", "therapist marketing"],
    date: "April 27, 2026",
    readTime: "8 min read",
  },
  {
    slug: "compare-therapists-with-reviews",
    category: "Wellness Tips",
    title: "How to Compare Therapists Using Reviews, Rates, and Availability",
    excerpt: "Use a step-by-step framework to compare profiles quickly so you can choose the best therapist match with confidence.",
    tags: ["compare therapists", "reviews", "price transparency", "booking journey"],
    date: "April 27, 2026",
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

// Full content for hardcoded fallback posts
const FALLBACK_FULL_POSTS: Record<string, BlogPost> = {
  "lgbtq-affirming-massage-guide": {
    slug: "lgbtq-affirming-massage-guide",
    title: "How to Find an LGBTQ+-Affirming Massage Therapist",
    excerpt: "Your therapeutic environment matters. Learn what signals to look for and what questions to ask when searching for an inclusive therapist.",
    category: "LGBTQ+ Health",
    tags: ["LGBTQ+", "affirming care", "massage therapy"],
    publishedAt: "2025-03-08T09:00:00Z",
    updatedAt: "2025-03-08T09:00:00Z",
    readTimeMinutes: 5,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "Finding a massage therapist is straightforward. Finding one where you feel genuinely safe is a different task — and it matters more than most people acknowledge." },
      { type: "h2", content: "Why It Matters" },
      { type: "paragraph", content: "Massage involves physical vulnerability. For LGBTQ+ clients — particularly trans and nonbinary individuals, or anyone with a complex relationship to their body — the environment created by a therapist directly affects therapeutic outcomes. Stress and guardedness undermine relaxation and healing." },
      { type: "h2", content: "Signals to Look For" },
      { type: "ul", content: [
        "Explicit LGBTQ+-inclusive language on their profile or website",
        "Pronoun fields in intake forms",
        "Membership in LGBTQ+ wellness networks or continuing education in affirming care",
        "Reviews from LGBTQ+ clients that mention feeling comfortable",
        "Willingness to discuss your specific concerns before booking",
      ]},
      { type: "h2", content: "Questions Worth Asking" },
      { type: "paragraph", content: "A brief message before booking can tell you a lot. Ask about their experience with clients who share your background, how they handle pronoun preferences, and what their intake process looks like. A therapist who welcomes these questions is a good sign." },
      { type: "callout", content: "Every therapist on MasseurMatch has agreed to our LGBTQ+-Inclusive Practice Standards. You can further filter for therapists with specific affirming care training." },
      { type: "h2", content: "Trust Your Read" },
      { type: "paragraph", content: "If something feels off in early communication, trust that signal. There are enough affirming therapists that you don't need to settle for one who makes you work to feel welcome." },
    ],
  },
  "deep-tissue-vs-swedish": {
    slug: "deep-tissue-vs-swedish",
    title: "Deep Tissue vs Swedish Massage: Which Is Right for You?",
    excerpt: "Two of the most popular massage modalities serve very different purposes. Break down the key differences before your next booking.",
    category: "Wellness Tips",
    tags: ["deep tissue", "swedish", "modalities"],
    publishedAt: "2025-02-28T09:00:00Z",
    updatedAt: "2025-02-28T09:00:00Z",
    readTimeMinutes: 4,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "Swedish and deep tissue are the two most requested massage modalities — and the most frequently confused. Choosing the wrong one doesn't ruin a session, but choosing the right one meaningfully improves it." },
      { type: "h2", content: "Swedish Massage" },
      { type: "paragraph", content: "Swedish massage uses long, gliding strokes (effleurage), kneading, and circular movements at light-to-moderate pressure. It's designed to relax the whole body, improve circulation, and reduce surface muscle tension." },
      { type: "paragraph", content: "Best for: stress relief, first-time clients, general relaxation, and people who prefer lighter pressure." },
      { type: "h2", content: "Deep Tissue Massage" },
      { type: "paragraph", content: "Deep tissue uses slower, more forceful strokes to target deeper muscle layers and connective tissue. It's effective for chronic pain, injury recovery, and releasing persistent knots and adhesions." },
      { type: "paragraph", content: "Best for: chronic muscle pain, injury recovery, athletes, and clients with high-tension patterns in specific areas." },
      { type: "h2", content: "How to Choose" },
      { type: "ul", content: [
        "You want to unwind after a stressful week → Swedish",
        "You have a specific area of chronic pain or tightness → Deep Tissue",
        "You're recovering from an athletic event → Deep Tissue",
        "It's your first session or you prefer gentler pressure → Swedish",
        "You're unsure → ask for a hybrid session and communicate during",
      ]},
      { type: "callout", content: "More pressure is not always better. Deep tissue applied without therapeutic purpose can cause unnecessary soreness. Tell your therapist your goal, not just your pressure preference." },
    ],
  },
  "massage-therapist-dallas-guide": {
    slug: "massage-therapist-dallas-guide",
    title: "The Best Neighborhoods to Find Massage Therapists in Dallas",
    excerpt: "From Uptown to Oak Cliff, Dallas has a thriving wellness scene. Our guide maps the top areas for professional massage therapy.",
    category: "City Guides",
    tags: ["dallas", "city guide", "Texas"],
    publishedAt: "2025-02-20T09:00:00Z",
    updatedAt: "2025-02-20T09:00:00Z",
    readTimeMinutes: 7,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "Dallas has one of the fastest-growing wellness sectors in Texas, with a concentration of independent massage therapists spread across distinct neighborhoods — each with its own character." },
      { type: "h2", content: "Uptown" },
      { type: "paragraph", content: "Uptown has the highest density of wellness studios in Dallas. The area attracts professionals seeking convenient lunchtime or after-work sessions, so therapists here often offer flexible scheduling and premium facilities." },
      { type: "h2", content: "Oak Cliff / Bishop Arts District" },
      { type: "paragraph", content: "A hub for independent and holistic practitioners. Oak Cliff's wellness community skews toward integrative approaches — expect therapists who combine modalities and have longer client relationships. This area also has a notably LGBTQ+-inclusive wellness community." },
      { type: "h2", content: "Deep Ellum" },
      { type: "paragraph", content: "Primarily known for arts and nightlife, Deep Ellum has a growing number of sports recovery and performance-focused therapists catering to the athletic and active creative communities." },
      { type: "h2", content: "North Dallas / Plano Corridor" },
      { type: "paragraph", content: "The suburban north corridor has high therapist density and competitive pricing. Good option for clients who prioritize convenient parking, consistent availability, and established studio environments." },
      { type: "h2", content: "What to Consider When Searching" },
      { type: "ul", content: [
        "Travel time to the therapist vs. outcall availability",
        "Neighborhood character and your comfort level",
        "Proximity to your home or office for recurring appointments",
        "Studio vs. independent home-based practice setup",
      ]},
      { type: "paragraph", content: "MasseurMatch lets you filter Dallas therapists by neighborhood, modality, and availability. Client reviews help narrow the list further." },
    ],
  },
  "grow-massage-practice-online": {
    slug: "grow-massage-practice-online",
    title: "5 Ways to Grow Your Massage Practice Online in 2025",
    excerpt: "Independent therapists need a digital presence. Here are the highest-ROI strategies for building a sustainable client base.",
    category: "For Therapists",
    tags: ["therapist business", "practice growth", "marketing"],
    publishedAt: "2025-02-10T09:00:00Z",
    updatedAt: "2025-02-10T09:00:00Z",
    readTimeMinutes: 8,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "Most independent massage therapists rely heavily on word-of-mouth referrals — which works until it doesn't. Building a sustainable online presence creates a client acquisition channel that compounds over time." },
      { type: "h2", content: "1. Claim and Optimize Your Google Business Profile" },
      { type: "paragraph", content: "Your Google Business Profile is your highest-leverage free marketing asset. Keep it fully complete: photos, service descriptions, hours, and a link to your booking page. Respond to every review. Profiles with consistent engagement rank higher in local search." },
      { type: "h2", content: "2. Build a Specialty, Not Just a Service List" },
      { type: "paragraph", content: "Generalist profiles compete on price. Specialty profiles compete on fit. If you work primarily with athletes, LGBTQ+ clients, prenatal clients, or chronic pain patients, lead with that. The clients who need exactly what you offer will find you more easily — and stay longer." },
      { type: "h2", content: "3. Collect Reviews Systematically" },
      { type: "paragraph", content: "Reviews are the primary trust signal for new clients. After each session, send a brief, friendly follow-up asking if they'd be willing to leave a review. A consistent ask yields a consistent result." },
      { type: "h2", content: "4. List on Specialized Directories" },
      { type: "paragraph", content: "General directories like Yelp have high noise. Specialized platforms like MasseurMatch put your profile in front of clients who are specifically searching for massage therapy — which means higher intent and better conversion." },
      { type: "h2", content: "5. Publish Location-Specific Content" },
      { type: "paragraph", content: "A single blog post about massage therapy in your specific city — covering neighborhoods, what to look for, and your specialty — can rank for local searches for years. It builds authority and brings in clients who are already educated and ready to book." },
      { type: "callout", content: "Consistency beats perfection. A complete, maintained profile outperforms an elaborate one that's never updated." },
    ],
  },
  "massage-anxiety-relief": {
    slug: "massage-anxiety-relief",
    title: "Massage Therapy as an Anxiety Relief Tool: What the Research Says",
    excerpt: "The evidence for massage as a clinical stress intervention is growing. We break down the latest research in accessible language.",
    category: "Wellness Tips",
    tags: ["anxiety", "research", "wellness"],
    publishedAt: "2025-01-30T09:00:00Z",
    updatedAt: "2025-01-30T09:00:00Z",
    readTimeMinutes: 5,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "Massage is often discussed in terms of muscle tension and physical recovery. The evidence for its effects on anxiety and the nervous system is equally significant — and increasingly well-documented." },
      { type: "h2", content: "The Physiological Mechanism" },
      { type: "paragraph", content: "Massage activates the parasympathetic nervous system — the rest-and-digest counterpart to the fight-or-flight response. This reduces cortisol (the primary stress hormone), increases serotonin and dopamine, and lowers heart rate and blood pressure. These are measurable, reproducible effects." },
      { type: "h2", content: "What the Research Shows" },
      { type: "ul", content: [
        "A 2010 meta-analysis in the Journal of Clinical Psychiatry found massage significantly reduced anxiety symptoms across 17 studies",
        "Research published in Depression and Anxiety found Swedish massage reduced anxiety in people with Generalized Anxiety Disorder comparable to some pharmacological interventions",
        "Touch Research Institute studies consistently show cortisol reductions of 31% on average following massage sessions",
      ]},
      { type: "h2", content: "Practical Implications" },
      { type: "paragraph", content: "The evidence supports regular massage — not just occasional — as an anxiety management tool. Once-monthly sessions show measurable cortisol effects. Weekly sessions show accumulating benefit. The research mirrors what physical exercise shows: consistency matters more than intensity." },
      { type: "h2", content: "For Clients with Anxiety" },
      { type: "paragraph", content: "The therapeutic benefit of massage can be undermined if the session itself creates anxiety — unfamiliar environment, unclear expectations, feeling unsafe with the therapist. Choosing a therapist who explicitly creates psychological safety is not a luxury preference; it's clinically relevant." },
      { type: "callout", content: "If you experience anxiety about physical touch or healthcare settings generally, let your therapist know before the session. A good therapist will adjust their approach and communication style accordingly." },
    ],
  },
  "trans-inclusive-bodywork": {
    slug: "trans-inclusive-bodywork",
    title: "Trans-Inclusive Bodywork: What Therapists Need to Know",
    excerpt: "Creating genuine safety for transgender clients requires more than good intentions. Practical guidance for therapists committed to inclusive practice.",
    category: "LGBTQ+ Health",
    tags: ["trans", "LGBTQ+", "inclusive bodywork"],
    publishedAt: "2025-01-22T09:00:00Z",
    updatedAt: "2025-01-22T09:00:00Z",
    readTimeMinutes: 6,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "For many transgender clients, finding a safe massage therapist is genuinely difficult. Practitioners who want to serve this community well need to understand both practical protocols and the underlying dynamics that make safety meaningful." },
      { type: "h2", content: "Start with Intake" },
      { type: "paragraph", content: "Your intake form communicates your values before the client ever meets you. Include a pronoun field (not optional, not binary). Ask about areas they want to avoid or approach carefully. Offer an open field for anything they want you to know." },
      { type: "paragraph", content: "Never make assumptions about dysphoric areas based on physical presentation. Ask — and then respect the answer precisely." },
      { type: "h2", content: "Draping and Positioning" },
      { type: "paragraph", content: "Standard draping protocols apply — and take on additional importance. Be explicit about what will be uncovered and when. Give the client control: offer them the option to direct the session more actively than you might with other clients. This reduces anxiety and builds trust." },
      { type: "h2", content: "Language and Communication" },
      { type: "ul", content: [
        "Use the name and pronouns from the intake form throughout, without exception",
        "Refer to body areas functionally rather than with gendered terminology (\"your upper back\" rather than gender-specific framing)",
        "Ask before adjusting positioning",
        "Avoid comments about body characteristics",
      ]},
      { type: "h2", content: "Continuing Education" },
      { type: "paragraph", content: "Several organizations offer continuing education specifically in trans-affirming massage practice. The investment in this training is also a marketing signal: therapists who list affirming care credentials attract clients who need and will pay for that level of intentional care." },
      { type: "callout", content: "Inclusive practice is not a checklist. It's an ongoing relationship with learning and with the communities you want to serve. The most important signal you can send is that you genuinely want to get it right." },
    ],
  },
  "benefits-hiring-massage-therapist-near-you": {
    slug: "benefits-hiring-massage-therapist-near-you",
    title: "Top 7 Benefits of Hiring a Massage Therapist Near You",
    excerpt: "Discover why local therapists often deliver faster scheduling, better communication, and a more consistent wellness routine.",
    category: "Wellness Tips",
    tags: ["local seo", "near me", "massage therapist", "wellness"],
    publishedAt: "2026-04-27T09:00:00Z",
    updatedAt: "2026-04-27T09:00:00Z",
    readTimeMinutes: 6,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "Searching \"massage therapist near me\" is about more than convenience — it's a meaningful filter for quality. Proximity correlates with consistency, and consistency is what turns massage from an occasional treat into an effective wellness practice." },
      { type: "h2", content: "1. Faster Scheduling Windows" },
      { type: "paragraph", content: "Local therapists can often accommodate same-day or next-day bookings that therapists farther away cannot. When you need relief quickly — after a hard workout, a stressful week, or a flare of chronic pain — access speed matters." },
      { type: "h2", content: "2. Easier Repeat Appointments" },
      { type: "paragraph", content: "The research on massage benefits is clear: frequency compounds. Monthly or biweekly sessions produce meaningfully better outcomes than occasional ones. Local therapists reduce the friction that prevents consistency." },
      { type: "h2", content: "3. Lower Cancellation Rates" },
      { type: "paragraph", content: "Travel time is the most common reason people cancel or rebook. A 10-minute drive versus a 45-minute commute changes the calculus when you're tired after work." },
      { type: "h2", content: "4. Better Neighborhood Familiarity" },
      { type: "paragraph", content: "Local therapists understand the physical demands and stress patterns of your community. An urban office worker, a suburban parent, and a rural outdoor worker have different needs — and therapists who see many clients like you get better at serving them." },
      { type: "h2", content: "5. Stronger Ongoing Relationship" },
      { type: "paragraph", content: "Proximity enables continuity. When you see the same therapist regularly, they develop a detailed understanding of your body and goals that a new-to-you therapist can't replicate." },
      { type: "h2", content: "6. Easier Communication" },
      { type: "paragraph", content: "Same-time-zone, in-person follow-up is simply easier. Scheduling adjustments, feedback conversations, and quick check-ins happen more naturally with someone you can easily see again." },
      { type: "h2", content: "7. Community Investment" },
      { type: "paragraph", content: "Booking local keeps revenue in your community. Independent massage therapists are small businesses — your repeat patronage directly supports them." },
    ],
  },
  "local-seo-strategies-therapists": {
    slug: "local-seo-strategies-therapists",
    title: "6 Local SEO Strategies That Help Therapists Rank Higher",
    excerpt: "A practical playbook for improving local visibility on Google and Bing with location pages, reviews, and trust-first content.",
    category: "For Therapists",
    tags: ["local seo", "google business profile", "bing places", "therapist marketing"],
    publishedAt: "2026-04-27T09:00:00Z",
    updatedAt: "2026-04-27T09:00:00Z",
    readTimeMinutes: 8,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "Local search visibility for massage therapists is winnable — the competition is mostly other independent practitioners who aren't optimizing at all. These six strategies cover the highest-leverage moves." },
      { type: "h2", content: "1. Lock Down Your Google Business Profile" },
      { type: "paragraph", content: "This is non-negotiable. Claim your profile, verify it, and fill every field. Add a booking link, complete your service list with individual descriptions, upload at least 8 photos, and set your service area explicitly. Incomplete profiles rank lower and convert worse." },
      { type: "h2", content: "2. Build Bing Places Alongside Google" },
      { type: "paragraph", content: "Bing Places is underutilized by most therapists, which means the competition is lower. The setup process mirrors Google Business Profile. Bing also powers Apple Maps search, so coverage is broader than it appears." },
      { type: "h2", content: "3. Use City + Modality Heading Combinations" },
      { type: "paragraph", content: "Your profile and website headings should use phrases like \"Deep Tissue Massage in [City]\" and \"LGBTQ+-Affirming Massage Therapist in [Neighborhood].\" These are the terms clients actually search — match them exactly in your headings." },
      { type: "h2", content: "4. Build Review Velocity" },
      { type: "paragraph", content: "Google weighs recency of reviews heavily. A therapist with 40 reviews from 2019 ranks lower than one with 15 reviews from the last 6 months. Build a consistent ask process: a brief follow-up message after each session asking for a review produces steady, ongoing review accumulation." },
      { type: "h2", content: "5. Create One Location-Specific Content Piece" },
      { type: "paragraph", content: "A 600-word blog post or guide about massage therapy in your specific city — covering what clients look for, neighborhood options, your own specialty — can rank for local informational searches for years. This compounds in a way that paid ads don't." },
      { type: "h2", content: "6. List in Specialized Directories" },
      { type: "paragraph", content: "General directories (Yelp, Thumbtack) have high competition. Specialized directories like MasseurMatch surface your profile to high-intent clients specifically searching for massage therapists. Each directory listing also creates an inbound link to your profile, which improves your general search authority." },
    ],
  },
  "compare-therapists-with-reviews": {
    slug: "compare-therapists-with-reviews",
    title: "How to Compare Therapists Using Reviews, Rates, and Availability",
    excerpt: "Use a step-by-step framework to compare profiles quickly so you can choose the best therapist match with confidence.",
    category: "Wellness Tips",
    tags: ["compare therapists", "reviews", "price transparency", "booking journey"],
    publishedAt: "2026-04-27T09:00:00Z",
    updatedAt: "2026-04-27T09:00:00Z",
    readTimeMinutes: 7,
    author: EDITORIAL_AUTHOR,
    content: [
      { type: "paragraph", content: "Most booking hesitation comes down to comparison paralysis. Too many profiles, not enough time. This framework gets you to a confident booking decision in under 10 minutes." },
      { type: "h2", content: "Step 1: Filter by Non-Negotiables First" },
      { type: "paragraph", content: "Before comparing profiles, apply hard filters: location or travel range, session type (incall/outcall), availability window, and any specific requirements around inclusivity or specialty. This cuts the field dramatically before you spend time reading profiles." },
      { type: "h2", content: "Step 2: Scan for Profile Completeness" },
      { type: "paragraph", content: "An incomplete profile is a signal. Therapists who fill out their specialties, session types, pricing, and photos have invested in their professional presentation — and tend to bring that same care to sessions. Prioritize complete profiles in your shortlist." },
      { type: "h2", content: "Step 3: Evaluate Reviews by Specificity" },
      { type: "paragraph", content: "Five-star reviews with no content tell you little. Look for reviews that mention specific things: pressure technique, communication, follow-through, a particular modality, or how a therapist handled a client's specific need. Specific positive reviews are the strongest trust signal." },
      { type: "h2", content: "Step 4: Compare Starting Rates for the Same Duration" },
      { type: "paragraph", content: "Rates vary significantly. Compare 60-minute session rates (the most common booking) across your shortlist. Don't default to the cheapest — but do note whether higher-priced therapists have corresponding signals of higher experience or specialty." },
      { type: "h2", content: "Step 5: Check for Specialty Alignment" },
      { type: "paragraph", content: "The best therapist for chronic low back pain and the best therapist for general relaxation are not necessarily the same person. Match your primary goal to the therapist's stated specialty. A therapist who primarily works with athletes will get different results with a runner than a generalist will." },
      { type: "callout", content: "If you're between two similarly qualified therapists, send a brief message to both before booking. How they respond — speed, specificity, warmth — tells you a lot about the session experience." },
    ],
  },
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
