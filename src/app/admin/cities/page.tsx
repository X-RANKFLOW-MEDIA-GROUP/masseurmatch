import AdminCitiesManager from "@/app/admin/_components/AdminCitiesManager";
import { readContentStore } from "@/app/api/_lib/content-store";
import { getPublicTherapists } from "@/app/_lib/directory";

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
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Admin Cities</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage custom city copy and compare it against the current public therapist footprint.
      </p>
      <AdminCitiesManager initialCities={store.cities} therapistCounts={therapistCounts} />
    </div>
  );
}
