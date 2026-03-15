import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return buildMetadata({
      title: "Article not found",
      description: "The requested article is not available.",
      path: `/blog/${resolvedParams.slug}`,
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.seoDescription,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="page-shell py-14">
      <div className="surface-panel mx-auto max-w-4xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
          {post.tags.join(" | ")}
        </p>
        <h1 className="mt-4 font-display text-5xl leading-tight">{post.title}</h1>
        <p className="mt-6 text-base leading-8 text-muted-foreground">{post.excerpt}</p>
        <div className="prose prose-slate mt-10 max-w-none text-sm leading-7 text-muted-foreground">
          {post.content.split("\n\n").map((block) =>
            block.startsWith("## ") ? (
              <h2 key={block} className="mt-8 font-display text-3xl text-foreground">
                {block.replace("## ", "")}
              </h2>
            ) : (
              <p key={block}>{block}</p>
            ),
          )}
        </div>
      </div>
    </article>
  );
}
