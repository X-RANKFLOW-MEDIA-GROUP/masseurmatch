"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
  "LGBTQ+ Health": "#C8102E",
  "Wellness Tips": "#C8102E",
  "For Therapists": "#1A1A1A",
  "City Guides": "#6B7280",
  "Industry News": "#374151",
};

export function BlogContent() {
  const [active, setActive] = useState("All");

  const showFeatured =
    active === "All" || featuredPost.category === active;
  const filtered =
    active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      <nav
        aria-label="Blog categories"
        style={{
          borderBottom: "1px solid rgba(26,26,26,0.1)",
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
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActive(category)}
              style={{
                padding: "18px 24px",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
                background: "transparent",
                border: "none",
                borderBottom:
                  category === active
                    ? "2px solid #C8102E"
                    : "2px solid transparent",
                color: category === active ? "#C8102E" : "#6B7280",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
        {showFeatured && (
          <article
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0,
              marginBottom: 80,
              background: "#1A1A1A",
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, #C8102E 0%, #1A1A1A 100%)",
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
                  border: "1px solid rgba(200,16,46,0.2)",
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
                  border: "1px solid rgba(200,16,46,0.35)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
              />
              <span style={{ fontSize: 48, opacity: 0.3 }}>*</span>
            </div>
            <div
              style={{
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 24,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#C8102E",
                    fontFamily: "system-ui, sans-serif",
                    background: "rgba(200,16,46,0.12)",
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
              <Link
                href={`/blog/${featuredPost.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
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
              </Link>
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
                  {featuredPost.date} | {featuredPost.readTime}
                </span>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#C8102E",
                    textDecoration: "none",
                    fontFamily: "system-ui, sans-serif",
                    borderBottom: "1px solid #C8102E",
                    paddingBottom: 2,
                  }}
                >
                  Read Article
                  <ArrowRight size={12} strokeWidth={2.25} />
                </Link>
              </div>
            </div>
          </article>
        )}

        {filtered.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#6B7280",
              fontFamily: "system-ui, sans-serif",
              fontSize: 15,
              padding: "48px 0",
            }}
          >
            No articles in this category yet. Check back soon.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 2,
            }}
          >
            {filtered.map((post) => (
              <article
                key={post.slug}
                style={{
                  background: "#fff",
                  padding: "36px 32px",
                  borderBottom: "3px solid transparent",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderBottomColor =
                    categoryColors[post.category] ?? "#C8102E")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderBottomColor =
                    "transparent")
                }
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
                <Link
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 400,
                      lineHeight: 1.3,
                      marginBottom: 14,
                      color: "#1A1A1A",
                    }}
                  >
                    {post.title}
                  </h3>
                </Link>
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
                    {post.date} | {post.readTime}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#1A1A1A",
                      textDecoration: "none",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    Read
                    <ArrowRight size={12} strokeWidth={2.25} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
