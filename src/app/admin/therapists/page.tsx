import AdminTherapistsManager from "@/app/admin/_components/AdminTherapistsManager";
import { loadTherapists } from "@/app/admin/_lib/loaders";

export default async function AdminTherapistsPage() {
  const { items, error } = await loadTherapists();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Admin Therapists</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Moderate therapist profiles, verification state, availability, and featured placement.
      </p>

      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Therapists could not be loaded from Supabase admin right now: {error}
        </div>
      ) : null}

      <AdminTherapistsManager initialTherapists={items} />
    </div>
  );
}
