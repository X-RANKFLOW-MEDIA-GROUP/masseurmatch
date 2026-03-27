"use client";

import { useEffect, useState } from "react";
import AdminUsersManager from "@/app/admin/_components/AdminUsersManager";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Loader2 } from "lucide-react";
import type { AdminUser } from "@/app/admin/_lib/loaders";

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load users");
        return res.json();
      })
      .then((data) => {
        setItems(data.items);
        if (data.error) setError(data.error);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description="Review provider accounts and move them between provider and admin roles."
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Users could not be loaded from Supabase admin right now: {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <AdminUsersManager initialUsers={items} />
        </div>
      )}
    </div>
  );
}
