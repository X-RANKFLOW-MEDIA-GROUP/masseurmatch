import { AdminBlogManager } from "@/mm/components/admin-tools";
import { SectionHeading } from "@/mm/components/primitives";
import { getBlogPosts } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Admin blog",
  description: "Create, review, and delete editorial content from the MasseurMatch admin console.",
  path: "/admin/blog",
});

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Editorial management."
        description="Draft and publish new directory articles, or remove outdated posts when they no longer fit the product story."
      />
      <div className="mt-10">
        <AdminBlogManager posts={posts} />
      </div>
    </section>
  );
}
