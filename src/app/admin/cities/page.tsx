"use client";

import { useEffect, useState } from "react";
import AdminCitiesManager from "@/app/admin/_components/AdminCitiesManager";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Loader2 } from "lucide-react";
import type { StoredCity } from "@/app/api/_lib/content-store";

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<StoredCity[]>([]);
  const [therapistCounts, setTherapistCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cities")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cities");
        return res.json();
      })
      .then((data) => {
        setCities(data.cities);
        setTherapistCounts(data.therapistCounts);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cities"
        description="Manage custom city copy and compare it against the current public therapist footprint."
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Cities could not be loaded right now: {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <AdminCitiesManager initialCities={cities} therapistCounts={therapistCounts} />
        </div>
      )}
    </div>
  );
}
