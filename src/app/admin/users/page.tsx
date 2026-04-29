import AdminUsersManager from "@/app/admin/_components/AdminUsersManager";
import { loadUsers } from "@/app/admin/_lib/loaders";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";

export default async function AdminUsersPage() {
  const { items, error } = await loadUsers();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description="Create new auth users with full profiles, then manage provider/admin roles."
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Users could not be loaded from Supabase admin right now: {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <AdminUsersManager initialUsers={items} />
      </div>
    </div>
  );
}
