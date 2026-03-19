import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import { BLOG_POSTS } from "@/app/blog/posts";
import { BlogGrid } from "@/components";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Blog",
  description: "Guides, trust content, and directory updates for massage therapist discovery.",
  path: "/blog",
  keywords: ["massage blog", "therapist guides", "directory blog", "wellness articles"],
});

export default function BlogPage() {
  const enhancedPosts = BLOG_POSTS.map((post, index) => ({
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    author: post.author,
    publishedAt: post.publishedAt,
    readingTime: Math.max(3, Math.ceil(post.blocks.length * 1.2)),
    category: index % 2 === 0 ? "Guides" : "Directory Tips",
    image: `https://images.unsplash.com/photo-${index % 2 === 0 ? "1544161515-4ab6ce6db874" : "1477332552946-cfb384aeaf1c"}?auto=format&fit=crop&w=1200&q=80`,
    featured: index === 0,
    tags: ["massage", "discovery", "trust"],
  }));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch blog",
          description: "Editorial content for massage therapist discovery, first-session trust, and local search intent.",
          path: "/blog",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Blog articles",
          path: "/blog",
          items: BLOG_POSTS.map((post) => ({
            name: post.title,
            path: `/blog/${post.slug}`,
          })),
        })}
      />

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">MasseurMatch blog</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          Editorial content that supports discovery, trust, first-session questions, and specialty search intent
          across the public directory.
        </p>

        <div className="mt-8">
          <BlogGrid posts={enhancedPosts} />
        </div>

        <div className="mt-8">
          <Link href="/search" className="text-sm font-semibold text-primary hover:underline">
            Continue to therapist search
          </Link>
        </div>
      </div>
    </>
  );
}
