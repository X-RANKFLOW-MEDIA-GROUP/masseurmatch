import AdminKeywordsManager from "@/app/admin/_components/AdminKeywordsManager";
import { readContentStore } from "@/app/api/_lib/content-store";
import { getPublicTherapists } from "@/app/_lib/directory";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";

export default async function AdminKeywordsPage() {
  const [store, therapists] = await Promise.all([
    readContentStore(),
    getPublicTherapists({ page: 1, pageSize: 50 }),
  ]);

  const keywordCounts = (therapists.items as any[]).reduce<Record<string, number>>((accumulator, therapist) => {
    for (const specialty of (therapist.specialties || [])) {
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
    <div className="space-y-6">
      <AdminPageHeader
        title="Keywords"
        description="Save curated keyword targets and seed them from the specialties already showing up in public profiles."
      />
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <AdminKeywordsManager initialKeywords={store.keywords} suggestions={suggestions} />
      </div>
    </div>
  );
}
