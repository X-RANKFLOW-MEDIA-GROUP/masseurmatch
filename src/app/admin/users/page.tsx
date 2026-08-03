import AdminAccountsManager from "@/app/admin/_components/AdminAccountsManager";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { loadAccounts } from "@/app/admin/_lib/loadAccounts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUsersPage() {
  const { items, error } = await loadAccounts();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Accounts"
        description="Manage each login account and its therapist profile together in one table."
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Accounts could not be loaded from Supabase admin right now: {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <AdminAccountsManager initialAccounts={items} />
      </div>
    </div>
  );
}
