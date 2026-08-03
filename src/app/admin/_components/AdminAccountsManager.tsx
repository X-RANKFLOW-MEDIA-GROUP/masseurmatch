"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Search } from "lucide-react";

import { postJson } from "@/app/_lib/client-api";
import type { AdminAccount } from "@/app/admin/_lib/loadAccounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ProfileAction = "approve" | "reject" | "activate" | "suspend" | "ban" | "verify_identity" | "feature" | "unfeature" | "upgrade";

export default function AdminAccountsManager({ initialAccounts }: { initialAccounts: AdminAccount[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Record<string, "admin" | "provider">>(() =>
    Object.fromEntries(initialAccounts.map((account) => [account.userId, account.role === "admin" ? "admin" : "provider"])),
  );
  const [actions, setActions] = useState<Record<string, ProfileAction>>(() =>
    Object.fromEntries(initialAccounts.map((account) => [account.profileId, account.isFeatured ? "unfeature" : "approve"])),
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return initialAccounts;
    return initialAccounts.filter((account) =>
      [account.displayName, account.email, account.city, account.userId, account.profileId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [initialAccounts, search]);

  const saveRole = async (account: AdminAccount) => {
    setBusyId(account.userId);
    try {
      await postJson("/api/admin/users", { userId: account.userId, role: roles[account.userId] });
      toast({ title: "Role updated", description: `${account.displayName} is now ${roles[account.userId]}.` });
      router.refresh();
    } catch (error) {
      toast({ title: "Could not update role", description: error instanceof Error ? error.message : "Unknown error.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const applyProfileAction = async (account: AdminAccount) => {
    const action = actions[account.profileId];
    setBusyId(account.profileId);
    try {
      let endpoint = `/api/admin/profile/${account.profileId}/${action}`;
      if (action === "suspend" || action === "ban") endpoint = `/api/admin/user/${account.userId}/${action}`;
      if (action === "feature" || action === "unfeature") endpoint = `/api/admin/profile/${account.profileId}/feature`;
      if (action === "upgrade") endpoint = `/api/admin/profile/${account.profileId}/upgrade`;
      await postJson(endpoint, {});
      toast({ title: "Account updated", description: `Applied ${action} to ${account.displayName}.` });
      router.refresh();
    } catch (error) {
      toast({ title: "Could not apply action", description: error instanceof Error ? error.message : "Unknown error.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input id="admin-accounts-search" name="adminAccountsSearch" aria-label="Search accounts" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, city, user ID, or profile ID..." className="pl-10" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Profile</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Admin action</th>
              <th className="px-4 py-3">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filtered.map((account) => {
              const roleFieldId = `account-role-${account.userId}`;
              const actionFieldId = `account-action-${account.profileId}`;

              return (
                <tr key={account.userId} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{account.displayName}</p>
                    <p className="text-xs text-slate-500">{account.email || "No email"}</p>
                    <p className="mt-1 text-[11px] text-slate-400">User: {account.userId.slice(0, 8)} · Profile: {account.profileId.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{account.city || "No city"}</td>
                  <td className="px-4 py-4">
                    <p className="capitalize text-slate-700">{account.profileStatus.replaceAll("_", " ")}</p>
                    <p className="text-xs text-slate-500">{account.verificationStatus || "unverified"}</p>
                    <div className="mt-1 flex gap-1 text-[10px]">
                      {account.isFeatured ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">Featured</span> : null}
                      {account.isSuspended ? <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700">Suspended</span> : null}
                      {account.isBanned ? <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700">Banned</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 capitalize text-slate-700">{account.subscriptionTier || "free"}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <select id={roleFieldId} name={roleFieldId} aria-label={`Role for ${account.displayName}`} value={roles[account.userId]} onChange={(event) => setRoles((current) => ({ ...current, [account.userId]: event.target.value as "admin" | "provider" }))} className="h-9 rounded-md border border-slate-200 bg-white px-2">
                        <option value="provider">Provider</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button size="sm" variant="outline" disabled={busyId === account.userId} onClick={() => void saveRole(account)}>Save</Button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <select id={actionFieldId} name={actionFieldId} aria-label={`Admin action for ${account.displayName}`} value={actions[account.profileId]} onChange={(event) => setActions((current) => ({ ...current, [account.profileId]: event.target.value as ProfileAction }))} className="h-9 rounded-md border border-slate-200 bg-white px-2">
                        <option value="approve">Approve profile</option>
                        <option value="reject">Reject profile</option>
                        <option value="activate">Activate profile</option>
                        <option value="suspend">Suspend user</option>
                        <option value="ban">Ban user</option>
                        <option value="verify_identity">Verify identity</option>
                        <option value="feature">Feature profile</option>
                        <option value="unfeature">Unfeature profile</option>
                        <option value="upgrade">Upgrade plan</option>
                      </select>
                      <Button size="sm" disabled={busyId === account.profileId} onClick={() => void applyProfileAction(account)}>Apply</Button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Button size="sm" variant="ghost" disabled={!account.slug} onClick={() => account.slug && window.open(`/therapists/${account.slug}`, "_blank")}>
                      <Eye className="mr-1 h-4 w-4" /> Profile
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No accounts found.</p> : null}
    </div>
  );
}
