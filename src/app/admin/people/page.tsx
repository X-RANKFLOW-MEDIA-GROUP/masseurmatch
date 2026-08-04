import AdminUsersManager from "@/app/admin/_components/AdminUsersManager";
import AdminTherapistsManager from "@/app/admin/_components/AdminTherapistsManager";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { loadTherapists, loadUsers } from "@/app/admin/_lib/loaders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPeoplePage() {
  const [usersResult, therapistsResult] = await Promise.all([
    loadUsers(),
    loadTherapists(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="People CRM"
        description="Manage accounts, therapist profiles, photos, access and administrative actions from one place."
      />

      {usersResult.error || therapistsResult.error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Some people data could not be loaded. {usersResult.error || therapistsResult.error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <p className="text-sm text-muted-foreground">Search people, review account information and manage access roles.</p>
        </div>
        <AdminUsersManager initialUsers={usersResult.items} />
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Therapist profiles and photos</h2>
          <p className="text-sm text-muted-foreground">Moderate profiles, verification, visibility, plans and public listings.</p>
        </div>
        <AdminTherapistsManager initialTherapists={therapistsResult.items} />
      </section>
    </div>
  );
}
