import AdminCitiesManager from "@/app/admin/_components/AdminCitiesManager";
import { readContentStore } from "@/app/api/_lib/content-store";
import { getPublicTherapists } from "@/app/_lib/directory";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";

export default async function AdminCitiesPage() {
  const [store, therapists] = await Promise.all([
    readContentStore(),
    getPublicTherapists({ page: 1, pageSize: 50 }),
  ]);

  const therapistCounts = therapists.items.reduce<Record<string, number>>((accumulator, therapist) => {
    const key = therapist.city?.toLowerCase();
    if (!key) {
      return accumulator;
    }

    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cities"
        description="Manage custom city copy and compare it against the current public therapist footprint."
      />
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <AdminCitiesManager initialCities={store.cities} therapistCounts={therapistCounts} />
      </div>
    </div>
  );
}
