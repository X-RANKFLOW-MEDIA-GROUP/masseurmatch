import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import PeopleCrm from "./PeopleCrm";
import { loadPeople } from "./loadPeople";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPeoplePage() {
  const result = await loadPeople();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="People CRM"
        description="Manage accounts, therapist profiles, Cloudinary photos, access and administrative actions from one place."
      />

      {result.error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          People data could not be loaded. {result.error}
        </div>
      ) : null}

      <PeopleCrm people={result.items} />
    </div>
  );
}
