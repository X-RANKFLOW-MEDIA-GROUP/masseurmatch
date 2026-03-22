import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Massage Therapy Tips, Wellness & LGBTQ+ Resources – MasseurMatch",
  description:
    "Expert massage therapy advice, wellness guides, LGBTQ+ health resources, and industry insights from the MasseurMatch editorial team.",
  openGraph: {
    title: "Blog | MasseurMatch",
    description:
      "Expert massage therapy advice, wellness guides, and LGBTQ+ health resources.",
    url: "https://masseurmatch.com/blog",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/blog" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "MasseurMatch Blog",
  url: "https://masseurmatch.com/blog",
  description:
    "Expert massage therapy advice, wellness guides, and LGBTQ+ inclusive health resources.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
};

const categories = [
  "All",
  "Wellness Tips",
  "LGBTQ+ Health",
  "For Therapists",
  "City Guides",
  "Industry News",
];

const featuredPost = {
  slug: "what-to-expect-first-massage",
  category: "Wellness Tips",
  title: "What to Expect at Your First Massage Appointment",
  excerpt:
    "First-time clients often have questions about etiquette, comfort levels, and communication. Here's how to prepare for a relaxed, confident experience.",
  date: "March 15, 2025",
  readTime: "6 min read",
};

const posts = [
  {
    slug: "lgbtq-affirming-massage-guide",
    category: "LGBTQ+ Health",
    title: "How to Find an LGBTQ+-Affirming Massage Therapist",
    excerpt:
      "Your therapeutic environment matters. Learn what signals to look for and what questions to ask when searching for an inclusive therapist.",
    date: "March 8, 2025",
    readTime: "5 min read",
  },
  {
    slug: "deep-tissue-vs-swedish",
    category: "Wellness Tips",
    title: "Deep Tissue vs Swedish Massage: Which Is Right for You?",
    excerpt:
      "Two of the most popular massage modalities serve very different purposes. Break down the key differences before your next booking.",
    date: "February 28, 2025",
    readTime: "4 min read",
  },
  {
    slug: "massage-therapist-dallas-guide",
    category: "City Guides",
    title: "The Best Neighborhoods to Find Massage Therapists in Dallas",
    excerpt:
      "From Uptown to Oak Cliff, Dallas has a thriving wellness scene. Our guide maps the top areas for licensed massage therapy.",
    date: "February 20, 2025",
    readTime: "7 min read",
  },
  {
    slug: "grow-massage-practice-online",
    category: "For Therapists",
    title: "5 Ways to Grow Your Massage Practice Online in 2025",
    excerpt:
      "Independent therapists need a digital presence. Here are the highest-ROI strategies for building a sustainable client base.",
    date: "February 10, 2025",
    readTime: "8 min read",
  },
  {
    slug: "massage-anxiety-relief",
    category: "Wellness Tips",
    title: "Massage Therapy as an Anxiety Relief Tool: What the Research Says",
    excerpt:
      "The evidence for massage as a clinical stress intervention is growing. We break down the latest research in accessible language.",
    date: "January 30, 2025",
    readTime: "5 min read",
  },
  {
    slug: "trans-inclusive-bodywork",
    category: "LGBTQ+ Health",
    title: "Trans-Inclusive Bodywork: What Therapists Need to Know",
    excerpt:
      "Creating genuine safety for transgender clients requires more than good intentions. Practical guidance for therapists committed to inclusive practice.",
    date: "January 22, 2025",
    readTime: "6 min read",
  },
];

const categoryColors: Record<string, string> = {
  "LGBTQ+ Health": "#FF8A1F",
  "Wellness Tips": "#1E4B8F",
  "For Therapists": "#0B1F3A",
  "City Guides": "#6B7280",
  "Industry News": "#374151",
};

export default function BlogPage() {
  return (
    <>
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        style={{
          background: "#FCFBF8",
          color: "#0B1F3A",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minHeight: "100vh",
        }}
      >
        {/* ── Header ── */}
        <section
          style={{
            background: "#0B1F3A",
            padding: "80px 24px 72px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#FF8A1F",
              marginBottom: 20,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Editorial
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 400,
              color: "#FCFBF8",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            The MasseurMatch Journal
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "rgba(252,251,248,0.65)",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Wellness insight, LGBTQ+ health resources, and industry expertise
            — curated for clients and therapists alike.
          </p>
        </section>

        {/* ── Categories ── */}
        <nav
          aria-label="Blog categories"
          style={{
            borderBottom: "1px solid rgba(11,31,58,0.1)",
            padding: "0 24px",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 0,
              maxWidth: 1100,
              margin: "0 auto",
            }}
          >
            {categories.map((cat, i) => (
              <button
                key={cat}
                style={{
                  padding: "18px 24px",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                  background: "transparent",
                  border: "none",
                  borderBottom: i === 0 ? "2px solid #FF8A1F" : "2px solid transparent",
                  color: i === 0 ? "#FF8A1F" : "#6B7280",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
          {/* ── Featured ── */}
          <article
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0,
              marginBottom: 80,
              background: "#0B1F3A",
              color: "#FCFBF8",
            }}
          >
            {/* image placeholder */}
            <div
              style={{
                background: "linear-gradient(135deg, #1E4B8F 0%, #0B1F3A 100%)",
                minHeight: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,138,31,0.2)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,138,31,0.35)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
              />
              <span
                style={{
                  fontSize: 48,
                  opacity: 0.3,
                }}
              >
                ✦
              </span>
            </div>
            <div
              style={{
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#FF8A1F",
                    fontFamily: "system-ui, sans-serif",
                    background: "rgba(255,138,31,0.12)",
                    padding: "4px 10px",
                  }}
                >
                  Featured
                </span>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(252,251,248,0.5)",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {featuredPost.category}
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(20px, 2.5vw, 30px)",
                  fontWeight: 400,
                  lineHeight: 1.25,
                  marginBottom: 20,
                }}
              >
                {featuredPost.title}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.75,
                  opacity: 0.65,
                  fontFamily: "system-ui, sans-serif",
                  marginBottom: 32,
                }}
              >
                {featuredPost.excerpt}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "system-ui, sans-serif",
                    opacity: 0.45,
                  }}
                >
                  {featuredPost.date} · {featuredPost.readTime}
                </span>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#FF8A1F",
                    textDecoration: "none",
                    fontFamily: "system-ui, sans-serif",
                    borderBottom: "1px solid #FF8A1F",
                    paddingBottom: 2,
                  }}
                >
                  Read Article →
                </Link>
              </div>
            </div>
          </article>

          {/* ── Grid ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 2,
            }}
          >
            {posts.map((post) => (
              <article
                key={post.slug}
                className="mm-card-hover"
                style={{
                  background: "#fff",
                  padding: "36px 32px",
                  borderBottom: "3px solid transparent",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      fontFamily: "system-ui, sans-serif",
                      color: categoryColors[post.category] ?? "#6B7280",
                      fontWeight: 600,
                    }}
                  >
                    {post.category}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 400,
                    lineHeight: 1.3,
                    marginBottom: 14,
                    color: "#0B1F3A",
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#6B7280",
                    fontFamily: "system-ui, sans-serif",
                    marginBottom: 24,
                  }}
                >
                  {post.excerpt}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "system-ui, sans-serif",
                      color: "#9CA3AF",
                    }}
                  >
                    {post.date} · {post.readTime}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#0B1F3A",
                      textDecoration: "none",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* ── Load More ── */}
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <button
              style={{
                padding: "14px 40px",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
                background: "transparent",
                border: "1px solid #0B1F3A",
                color: "#0B1F3A",
                cursor: "pointer",
              }}
            >
              Load More Articles
            </button>
          </div>
        </div>

        {/* ── Newsletter ── */}
        <section
          style={{
            background: "#1E4B8F",
            color: "#FCFBF8",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 38px)",
              fontWeight: 400,
              marginBottom: 14,
            }}
          >
            Stay in the loop
          </h2>
          <p
            style={{
              fontSize: 15,
              opacity: 0.7,
              marginBottom: 36,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            New articles, wellness tips, and LGBTQ+ resources — delivered monthly.
          </p>
          <div
            style={{
              display: "flex",
              gap: 0,
              maxWidth: 460,
              margin: "0 auto",
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address for newsletter"
              style={{
                flex: 1,
                padding: "14px 20px",
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
                border: "none",
                background: "rgba(252,251,248,0.1)",
                color: "#FCFBF8",
                outline: "none",
              }}
            />
            <button
              style={{
                padding: "14px 28px",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
                background: "#FF8A1F",
                color: "#0B1F3A",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Subscribe
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
