import { readContentStore } from "@/app/api/_lib/content-store";
import AdminBlogManager from "@/app/admin/_components/AdminBlogManager";

export default async function AdminBlogPage() {
  const store = await readContentStore();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Admin Blog</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Create, update, and remove posts backed by the admin content store.
      </p>
      <AdminBlogManager initialPosts={store.blogPosts} />
    </div>
  );
}
