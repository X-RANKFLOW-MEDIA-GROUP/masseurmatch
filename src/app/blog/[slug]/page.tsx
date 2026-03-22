import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: BlogSection[];
  category: string;
  tags: string[];
  author: Author;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  coverImage?: string;
  coverAlt?: string;
}

interface Author {
  name: string;
  title: string;
  bio: string;
}

interface BlogSection {
  type: "paragraph" | "h2" | "h3" | "ul" | "ol" | "blockquote" | "callout";
  content: string | string[];
}

// ─── Data Layer ───────────────────────────────────────────────────────────────
// TODO: Replace with Supabase query:
//   const { data } = await supabase
//     .from("blog_posts")
//     .select("*")
//     .eq("slug", slug)
//     .eq("published", true)
//     .single();

async function getPost(slug: string): Promise<BlogPost | null> {
  const posts: Record<string, BlogPost> = {
    "what-to-expect-first-massage": {
      slug: "what-to-expect-first-massage",
      title: "What to Expect at Your First Massage Appointment",
      excerpt:
        "First-time clients often have questions about etiquette, comfort levels, and how to communicate with their therapist. Here's everything you need to arrive confident.",
      category: "Wellness Tips",
      tags: ["first massage", "massage tips", "new clients", "wellness"],
      publishedAt: "2025-03-15T09:00:00Z",
      updatedAt: "2025-03-15T09:00:00Z",
      readTimeMinutes: 6,
      author: {
        name: "MasseurMatch Editorial",
        title: "Wellness & Inclusivity Editor",
        bio: "The MasseurMatch editorial team produces evidence-based wellness content for LGBTQ+-inclusive audiences.",
      },
      content: [
        {
          type: "paragraph",
          content:
            "Booking your first massage can come with questions — what do I wear? What do I say? What if I'm uncomfortable? These are completely normal concerns, and having clear answers makes the experience significantly better for everyone.",
        },
        { type: "h2", content: "Before Your Appointment" },
        {
          type: "paragraph",
          content:
            "Arrive 10–15 minutes early for your first appointment. This buffer gives you time to complete intake forms, use the restroom, and begin to decompress. Rushing in stressed is counterproductive.",
        },
        {
          type: "paragraph",
          content:
            "Hydrate well beforehand and avoid eating a heavy meal within 90 minutes of your session. Light eating is fine — arriving hungry can make it hard to relax.",
        },
        { type: "h2", content: "What to Wear (and What Happens to It)" },
        {
          type: "paragraph",
          content:
            "Most full-body massage modalities are performed with the client unclothed or in underwear, under a draping sheet. You will only ever be uncovered in the area being actively worked on — professional therapists follow strict draping protocols at all times.",
        },
        {
          type: "callout",
          content:
            "You are always in control. You can ask to remain fully clothed, request specific areas not be worked on, or stop the session at any point — a good therapist will never make you feel awkward for any of these requests.",
        },
        { type: "h2", content: "Communicating with Your Therapist" },
        {
          type: "paragraph",
          content:
            "Good communication is the single biggest factor in massage quality. Tell your therapist about injuries, areas of tension, and your pressure preferences at the outset. Don't white-knuckle through pressure that's too intense — speaking up gets you a better result.",
        },
        {
          type: "ul",
          content: [
            '"Can we focus more on my shoulders and less on my legs?"',
            '"The pressure is a bit too deep — can you lighten up?"',
            '"I\'d prefer not to have my abdomen worked on today."',
            '"This is my first time, so I might need guidance."',
          ],
        },
        { type: "h2", content: "For LGBTQ+ Clients Specifically" },
        {
          type: "paragraph",
          content:
            "Therapeutic massage involves a level of physical vulnerability that can feel different depending on your relationship with your body, your history, and whether you feel genuinely safe with the person treating you. You deserve a therapist who creates real safety — not just tolerance.",
        },
        {
          type: "paragraph",
          content:
            "Every therapist on MasseurMatch has committed to our LGBTQ+-Inclusive Practice Standards. You can filter by therapists with specific training in affirming care for transgender clients, clients with trauma histories, and others with specialized needs.",
        },
        { type: "h2", content: "After Your Session" },
        {
          type: "paragraph",
          content:
            "Drink extra water after your session — massage mobilizes metabolic waste in muscle tissue and hydration helps clear it. Some soreness in the 24 hours following a deep tissue session is normal. A warm bath or light stretching can help.",
        },
        {
          type: "paragraph",
          content:
            "Give feedback to your therapist — what worked, what didn't. This information shapes your next session and helps them serve you better over time.",
        },
      ],
    },
  };

  return posts[slug] ?? null;
}

async function getRelatedPosts(currentSlug: string) {
  // TODO: Replace with Supabase query
  return [
    {
      slug: "lgbtq-affirming-massage-guide",
      title: "How to Find an LGBTQ+-Affirming Massage Therapist",
      category: "LGBTQ+ Health",
      date: "March 8, 2025",
    },
    {
      slug: "deep-tissue-vs-swedish",
      title: "Deep Tissue vs Swedish Massage: Which Is Right for You?",
      category: "Wellness Tips",
      date: "February 28, 2025",
    },
  ].filter((p) => p.slug !== currentSlug);
}

// ─── Static Params ────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  // TODO: const { data } = await supabase.from("blog_posts").select("slug").eq("published", true);
  return [{ slug: "what-to-expect-first-massage" }];
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found | MasseurMatch Blog" };

  return {
    title: `${post.title} | MasseurMatch Blog`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://masseurmatch.com/blog/${post.slug}`,
      siteName: "MasseurMatch",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: { canonical: `https://masseurmatch.com/blog/${post.slug}` },
  };
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
function articleSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `https://masseurmatch.com/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author.name,
      url: "https://masseurmatch.com",
    },
    publisher: {
      "@type": "Organization",
      name: "MasseurMatch",
      url: "https://masseurmatch.com",
      logo: { "@type": "ImageObject", url: "https://masseurmatch.com/logo.png" },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://masseurmatch.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    ...(post.coverImage && {
      image: { "@type": "ImageObject", url: post.coverImage, description: post.coverAlt },
    }),
  };
}

function breadcrumbSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://masseurmatch.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://masseurmatch.com/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://masseurmatch.com/blog/${post.slug}`,
      },
    ],
  };
}

// ─── Content Renderer ─────────────────────────────────────────────────────────
function Section({ s }: { s: BlogSection }) {
  const sans = "system-ui, sans-serif";
  const serif = "'Georgia', serif";

  if (s.type === "paragraph")
    return (
      <p style={{ fontSize: 17, lineHeight: 1.85, color: "#374151", fontFamily: sans, marginBottom: 24 }}>
        {s.content as string}
      </p>
    );

  if (s.type === "h2")
    return (
      <h2
        style={{
          fontSize: "clamp(20px, 2.5vw, 26px)",
          fontWeight: 400,
          color: "#0B1F3A",
          marginTop: 48,
          marginBottom: 18,
          paddingBottom: 12,
          borderBottom: "1px solid rgba(11,31,58,0.08)",
          fontFamily: serif,
        }}
      >
        {s.content as string}
      </h2>
    );

  if (s.type === "h3")
    return (
      <h3 style={{ fontSize: 18, fontWeight: 400, color: "#0B1F3A", marginTop: 32, marginBottom: 14, fontFamily: serif }}>
        {s.content as string}
      </h3>
    );

  if (s.type === "ul")
    return (
      <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {(s.content as string[]).map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", fontSize: 15, lineHeight: 1.7, color: "#374151", fontFamily: sans }}>
            <span style={{ color: "#FF8A1F", flexShrink: 0, marginTop: 3 }}>◎</span>
            {item}
          </li>
        ))}
      </ul>
    );

  if (s.type === "ol")
    return (
      <ol style={{ paddingLeft: 0, listStyle: "none", marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {(s.content as string[]).map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", fontSize: 15, lineHeight: 1.7, color: "#374151", fontFamily: sans }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#FF8A1F", fontFamily: sans, background: "rgba(255,138,31,0.1)", padding: "2px 8px", flexShrink: 0, marginTop: 2, minWidth: 28, textAlign: "center" }}>
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
    );

  if (s.type === "blockquote")
    return (
      <blockquote style={{ margin: "32px 0", padding: "24px 28px", borderLeft: "3px solid #FF8A1F", background: "rgba(255,138,31,0.04)", fontStyle: "italic", fontSize: 17, lineHeight: 1.75, color: "#374151", fontFamily: serif }}>
        {s.content as string}
      </blockquote>
    );

  if (s.type === "callout")
    return (
      <div style={{ margin: "32px 0", padding: "24px 28px", background: "#0B1F3A", color: "#FCFBF8", borderLeft: "3px solid #FF8A1F" }}>
        <p style={{ fontSize: 15, lineHeight: 1.75, fontFamily: sans, margin: 0 }}>{s.content as string}</p>
      </div>
    );

  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug);
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <Script id="article-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(post)) }} />
      <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(post)) }} />

      <main style={{ background: "#FCFBF8", color: "#0B1F3A", fontFamily: "'Georgia', serif" }}>

        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" style={{ background: "#0B1F3A", padding: "14px 24px 0" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", gap: 8, fontSize: 12, fontFamily: "system-ui, sans-serif", color: "rgba(252,251,248,0.4)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>›</span>
            <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Blog</Link>
            <span>›</span>
            <span style={{ color: "#FF8A1F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>{post.title}</span>
          </div>
        </nav>

        {/* Hero */}
        <header style={{ background: "#0B1F3A", color: "#FCFBF8", padding: "48px 24px 72px" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#FF8A1F", background: "rgba(255,138,31,0.12)", padding: "4px 10px", fontWeight: 700 }}>
                {post.category}
              </span>
              <span style={{ fontSize: 12, fontFamily: "system-ui, sans-serif", opacity: 0.4 }}>
                {post.readTimeMinutes} min read
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 400, lineHeight: 1.12, marginBottom: 22, maxWidth: 680 }}>
              {post.title}
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.65, opacity: 0.6, fontFamily: "system-ui, sans-serif", fontWeight: 300, maxWidth: 600, marginBottom: 32 }}>
              {post.excerpt}
            </p>

            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1E4B8F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#FF8A1F", flexShrink: 0 }}>
                ✦
              </div>
              <div>
                <div style={{ fontSize: 13, fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>{post.author.name}</div>
                <div style={{ fontSize: 11, fontFamily: "system-ui, sans-serif", opacity: 0.4, marginTop: 2 }}>{formattedDate}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Body + Sidebar */}
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "72px 24px 80px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 80, alignItems: "start" }}>

          {/* Article */}
          <article>
            {post.content.map((s, i) => <Section key={i} s={s} />)}

            {/* Tags */}
            <div style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid rgba(11,31,58,0.1)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#9CA3AF" }}>Tags:</span>
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} style={{ fontSize: 11, fontFamily: "system-ui, sans-serif", color: "#1E4B8F", textDecoration: "none", background: "rgba(30,75,143,0.06)", padding: "4px 10px" }}>
                  {tag}
                </Link>
              ))}
            </div>

            {/* Author box */}
            <div style={{ marginTop: 40, background: "#fff", padding: "28px 32px", display: "flex", gap: 20, alignItems: "flex-start", borderLeft: "3px solid #FF8A1F" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#0B1F3A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#FF8A1F", flexShrink: 0 }}>✦</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "system-ui, sans-serif", color: "#0B1F3A", marginBottom: 4 }}>{post.author.name}</div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#FF8A1F", marginBottom: 8 }}>{post.author.title}</div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "#6B7280", fontFamily: "system-ui, sans-serif", margin: 0 }}>{post.author.bio}</p>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ position: "sticky", top: 100 }}>
            {/* Search CTA */}
            <div style={{ background: "#0B1F3A", color: "#FCFBF8", padding: "32px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#FF8A1F", marginBottom: 12 }}>Find a Therapist</p>
              <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.6, fontFamily: "system-ui, sans-serif", marginBottom: 20 }}>Browse verified, LGBTQ+-inclusive therapists near you.</p>
              <Link href="/search" style={{ display: "block", textAlign: "center", padding: "12px 20px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", background: "#FF8A1F", color: "#0B1F3A", textDecoration: "none", fontWeight: 700 }}>
                Search Now
              </Link>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#FF8A1F", marginBottom: 16 }}>Related Articles</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {related.map((r) => (
                    <Link key={r.slug} href={`/blog/${r.slug}`} style={{ display: "block", background: "#fff", padding: "20px", textDecoration: "none", color: "#0B1F3A" }}>
                      <span style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#FF8A1F", display: "block", marginBottom: 6 }}>{r.category}</span>
                      <span style={{ fontSize: 13, lineHeight: 1.35, display: "block", marginBottom: 6 }}>{r.title}</span>
                      <span style={{ fontSize: 11, fontFamily: "system-ui, sans-serif", color: "#9CA3AF" }}>{r.date}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div style={{ background: "#1E4B8F", color: "#FCFBF8", padding: "28px", marginTop: 24 }}>
              <p style={{ fontSize: 14, fontWeight: 400, marginBottom: 10 }}>Monthly wellness tips</p>
              <p style={{ fontSize: 12, opacity: 0.6, fontFamily: "system-ui, sans-serif", lineHeight: 1.6, marginBottom: 16 }}>LGBTQ+ health resources — once a month, no spam.</p>
              <input type="email" placeholder="your@email.com" style={{ width: "100%", padding: "10px 14px", fontSize: 13, fontFamily: "system-ui, sans-serif", border: "none", background: "rgba(252,251,248,0.1)", color: "#FCFBF8", marginBottom: 8, boxSizing: "border-box", outline: "none" }} />
              <button style={{ width: "100%", padding: "10px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", background: "#FF8A1F", color: "#0B1F3A", border: "none", cursor: "pointer", fontWeight: 700 }}>
                Subscribe
              </button>
            </div>
          </aside>
        </div>

        {/* Back */}
        <div style={{ borderTop: "1px solid rgba(11,31,58,0.08)", padding: "32px 24px", textAlign: "center" }}>
          <Link href="/blog" style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#1E4B8F", textDecoration: "none", borderBottom: "1px solid #1E4B8F", paddingBottom: 2 }}>
            ← Back to All Articles
          </Link>
        </div>
      </main>
    </>
  );
}
