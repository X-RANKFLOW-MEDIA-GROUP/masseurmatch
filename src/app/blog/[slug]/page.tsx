import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import { SEO_BLOG_POSTS } from "@/lib/seo/contentTemplates";
import { buildMetadata } from "@/lib/seo/metadata";
import { schema } from "@/lib/seo/schema";

export function generateStaticParams() {
  return SEO_BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = SEO_BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) return buildMetadata({ title: "Blog post", description: "Blog post not found", path: `/blog/${slug}`, noIndex: true });
  return buildMetadata({ title: post.metaTitle, description: post.metaDescription, path: `/blog/${post.slug}` });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = SEO_BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <main className="container mx-auto px-4 py-10">
      <JsonLd data={schema.article(post.title, post.metaDescription, `/blog/${post.slug}`)} />
      <JsonLd data={schema.faq(post.faq)} />
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="mt-3 text-muted-foreground">{post.excerpt}</p>
      <article className="mt-8 space-y-4">{post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>
      <h2 className="mt-10 text-xl font-semibold">FAQ</h2>
      {post.faq.map((item) => <div key={item.question} className="mt-3"><h3 className="font-medium">{item.question}</h3><p className="text-muted-foreground">{item.answer}</p></div>)}
      <h2 className="mt-10 text-xl font-semibold">Related links</h2>
      <ul className="mt-3 space-y-2">{post.internalLinks.map((href) => <li key={href}><Link href={href} className="text-primary hover:underline">{href}</Link></li>)}</ul>
    </main>
  );
}
