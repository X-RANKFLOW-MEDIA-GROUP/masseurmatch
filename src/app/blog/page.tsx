import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import { SEO_BLOG_POSTS } from "@/lib/seo/contentTemplates";
import { buildMetadata } from "@/lib/seo/metadata";
import { schema } from "@/lib/seo/schema";

export const metadata = buildMetadata({
  title: "Blog | MasseurMatch",
  description: "Professional guides for finding massage therapists, comparing profiles, and contacting providers directly.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <JsonLd data={schema.breadcrumb([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <h1 className="text-3xl font-bold">MasseurMatch Blog</h1>
      <p className="mt-3 text-muted-foreground">Original editorial content for visitors and independent massage therapists.</p>
      <ul className="mt-8 space-y-6">
        {SEO_BLOG_POSTS.map((post) => (
          <li key={post.slug} className="rounded-lg border p-5">
            <Link href={`/blog/${post.slug}`} className="text-xl font-semibold hover:underline">{post.title}</Link>
            <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
