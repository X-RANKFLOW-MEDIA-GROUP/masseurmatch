import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import { BLOG_POSTS } from "@/app/blog/posts";
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

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="rounded-3xl border border-border p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">{post.publishedAt}</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
                Read article
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
