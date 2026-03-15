import Link from "next/link";
import { Card, SectionHeading } from "@/mm/components/primitives";
import { getBlogPosts } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Read directory strategy, therapist profile, and city-search articles from MasseurMatch.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Editorial"
        title="Articles built around therapist discovery and city search."
        description="A small editorial library focused on cleaner profile discovery, local directory structure, and direct therapist outreach."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{post.tags.join(" · ")}</p>
            <h2 className="mt-4 font-display text-3xl">{post.title}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex text-sm font-semibold text-foreground underline underline-offset-4">
              Read article
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
