"use client";

import { useEffect, useState } from "react";
import AdminTherapistsManager from "@/app/admin/_components/AdminTherapistsManager";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Loader2 } from "lucide-react";
import type { AdminTherapist } from "@/app/admin/_lib/loaders";

export default function AdminTherapistsPage() {
  const [items, setItems] = useState<AdminTherapist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/therapists")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load therapists");
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
        title="Therapists"
        description="Moderate therapist profiles, verification state, availability, and featured placement."
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Therapists could not be loaded from Supabase admin right now: {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <AdminTherapistsManager initialTherapists={items} />
        </div>
      )}
    </div>
  );
}
