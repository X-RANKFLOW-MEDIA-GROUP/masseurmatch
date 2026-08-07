import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PublicAdminBlogListItem } from "@/app/_lib/public-admin-blog";

export function AdminPublishedPosts({ posts }: { posts: PublicAdminBlogListItem[] }) {
  if (posts.length === 0) return null;

  const [featured, ...rest] = posts;

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8B1E2D", marginBottom: 8 }}>
          Latest from MasseurMatch
        </p>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 400, margin: 0 }}>Published Articles</h2>
      </div>

      {featured ? (
        <article style={{ background: "#111111", color: "#FFFFFF", padding: "40px", marginBottom: 2 }}>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: "#8B1E2D", textTransform: "uppercase", letterSpacing: "0.14em" }}>{featured.category}</p>
          <Link href={`/blog/${featured.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
            <h3 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 400, lineHeight: 1.2, margin: "14px 0" }}>{featured.title}</h3>
          </Link>
          <p style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.7, color: "rgba(255,255,255,.68)", maxWidth: 720 }}>{featured.excerpt}</p>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginTop: 24, fontFamily: "system-ui, sans-serif", fontSize: 12 }}>
            <span style={{ color: "rgba(255,255,255,.5)" }}>{featured.date} | {featured.readTime}</span>
            <Link href={`/blog/${featured.slug}`} style={{ color: "#FFFFFF", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
              Read article <ArrowRight size={14} />
            </Link>
          </div>
        </article>
      ) : null}

      {rest.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
          {rest.map((post) => (
            <article key={post.slug} style={{ border: "1px solid rgba(17,17,17,.08)", padding: 28 }}>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 10, color: "#8B1E2D", textTransform: "uppercase", letterSpacing: "0.14em" }}>{post.category}</p>
              <Link href={`/blog/${post.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                <h3 style={{ fontSize: 20, fontWeight: 400, lineHeight: 1.3, margin: "12px 0" }}>{post.title}</h3>
              </Link>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, lineHeight: 1.65, color: "#6B7280" }}>{post.excerpt}</p>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: "#9CA3AF", marginTop: 18 }}>{post.date} | {post.readTime}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
