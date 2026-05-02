import { readContentStore } from "@/app/api/_lib/content-store";
import AdminBlogManager from "@/app/admin/_components/AdminBlogManager";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";

export default async function AdminBlogPage() {
  const store = await readContentStore();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog"
        description="Create, update, and remove posts backed by the admin content store."
      />
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <AdminBlogManager initialPosts={store.blogPosts} />
      </div>
    </div>
  );
}
