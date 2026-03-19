import AdminUsersManager from "@/app/admin/_components/AdminUsersManager";
import { loadUsers } from "@/app/admin/_lib/loaders";

export default async function AdminUsersPage() {
  const { items, error } = await loadUsers();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Admin Users</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Review provider accounts and move them between provider and admin roles.
      </p>

      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Users could not be loaded from Supabase admin right now: {error}
        </div>
      ) : null}

      <AdminUsersManager initialUsers={items} />
    </div>
  );
}
