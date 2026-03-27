"use client";

import { useEffect, useState } from "react";
import AdminBlogManager from "@/app/admin/_components/AdminBlogManager";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Loader2 } from "lucide-react";
import type { StoredBlogPost } from "@/app/api/_lib/content-store";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<StoredBlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blog posts");
        return res.json();
      })
      .then((data) => setPosts(data.blogPosts))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog"
        description="Create, update, and remove posts backed by the admin content store."
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Blog posts could not be loaded right now: {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <AdminBlogManager initialPosts={posts} />
        </div>
      )}
    </div>
  );
}
