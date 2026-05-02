import AdminTherapistsManager from "@/app/admin/_components/AdminTherapistsManager";
import { loadTherapists } from "@/app/admin/_lib/loaders";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";

export default async function AdminTherapistsPage() {
  const { items, error } = await loadTherapists();

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

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <AdminTherapistsManager initialTherapists={items} />
      </div>
    </div>
  );
}
