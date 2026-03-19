import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import { BLOG_POSTS } from "@/app/blog/posts";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";

type Params = { slug: string };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = BLOG_POSTS.find((item) => item.slug === resolvedParams.slug);

  if (!post) {
    return createPageMetadata({
      title: "Article",
      description: "MasseurMatch article",
      path: `/blog/${resolvedParams.slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    keywords: ["massage guide", "therapist article", post.slug.replace(/-/g, " ")],
  });
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const post = BLOG_POSTS.find((item) => item.slug === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <JsonLd
        data={buildArticleJsonLd({
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          publishedAt: post.publishedAt,
          author: post.author,
        })}
      />

      <article className="container mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs text-muted-foreground">
          {post.publishedAt} · {post.author}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-foreground">{post.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-8 space-y-4">
          {post.blocks.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2 key={index} className="text-2xl font-semibold text-foreground">
                  {block.text}
                </h2>
              );
            }

            if (block.type === "list") {
              return (
                <ul key={index} className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {block.items.map((item, itemIndex) => (
                    <li key={`${index}-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={index} className="leading-relaxed text-muted-foreground">
                {block.text}
              </p>
            );
          })}
        </div>
      </article>
    </>
  );
}
