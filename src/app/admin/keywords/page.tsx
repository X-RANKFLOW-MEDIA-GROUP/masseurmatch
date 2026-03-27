"use client";

import { useEffect, useState } from "react";
import AdminKeywordsManager from "@/app/admin/_components/AdminKeywordsManager";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Loader2 } from "lucide-react";
import type { StoredKeyword } from "@/app/api/_lib/content-store";

export default function AdminKeywordsPage() {
  const [keywords, setKeywords] = useState<StoredKeyword[]>([]);
  const [suggestions, setSuggestions] = useState<{ term: string; count: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/keywords")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load keywords");
        return res.json();
      })
      .then((data) => {
        setKeywords(data.keywords);
        setSuggestions(data.suggestions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Keywords"
        description="Save curated keyword targets and seed them from the specialties already showing up in public profiles."
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Keywords could not be loaded right now: {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <AdminKeywordsManager initialKeywords={keywords} suggestions={suggestions} />
        </div>
      )}
    </div>
  );
}
