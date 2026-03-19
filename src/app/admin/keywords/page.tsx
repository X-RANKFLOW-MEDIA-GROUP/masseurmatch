import AdminKeywordsManager from "@/app/admin/_components/AdminKeywordsManager";
import { readContentStore } from "@/app/api/_lib/content-store";
import { getPublicTherapists } from "@/app/_lib/directory";

export default async function AdminKeywordsPage() {
  const [store, therapists] = await Promise.all([
    readContentStore(),
    getPublicTherapists({ page: 1, pageSize: 50 }),
  ]);

  const keywordCounts = therapists.items.reduce<Record<string, number>>((accumulator, therapist) => {
    for (const specialty of therapist.specialties || []) {
      const key = specialty.toLowerCase();
      accumulator[key] = (accumulator[key] || 0) + 1;
    }

    return accumulator;
  }, {});

  const suggestions = Object.entries(keywordCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 24)
    .map(([term, count]) => ({ term, count }));

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Admin Keywords</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Save curated keyword targets and seed them from the specialties already showing up in public profiles.
      </p>
      <AdminKeywordsManager initialKeywords={store.keywords} suggestions={suggestions} />
    </div>
  );
}
