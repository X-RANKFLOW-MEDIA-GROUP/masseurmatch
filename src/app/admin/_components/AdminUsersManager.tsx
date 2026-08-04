"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Search } from "lucide-react";

import { postJson } from "@/app/_lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type AdminUser = {
  profileId: string;
  userId: string;
  fullName: string;
  city: string | null;
  status: string;
  role: "admin" | "provider" | null;
  email: string | null;
};

function buildDrafts(users: AdminUser[]) {
  return users.reduce<Record<string, "admin" | "provider">>((accumulator, user) => {
    accumulator[user.userId] = user.role || "provider";
    return accumulator;
  }, {});
}

export default function AdminUsersManager({ initialUsers }: { initialUsers: AdminUser[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, "admin" | "provider">>(() => buildDrafts(initialUsers));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetBusyId, setResetBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setDrafts(buildDrafts(initialUsers));
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return initialUsers;

    return initialUsers.filter((user) =>
      [user.fullName, user.email, user.city, user.status, user.role, user.userId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [initialUsers, search]);

  const handleSave = async (userId: string) => {
    setBusyId(userId);

    try {
      await postJson("/api/admin/users", { userId, role: drafts[userId] });
      toast({ title: "Role updated", description: `Saved ${drafts[userId]} role.` });
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not update role",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handlePasswordReset = async (user: AdminUser) => {
    if (!user.email) {
      toast({ title: "No email available", variant: "destructive" });
      return;
    }

    setResetBusyId(user.userId);
    try {
      await postJson("/api/admin/users/reset-password", { userId: user.userId });
      toast({
        title: "Password reset sent",
        description: `A secure reset link was sent to ${user.email}.`,
      });
    } catch (error) {
      toast({
        title: "Could not send reset",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setResetBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, city, status or user ID..."
          className="pl-10"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No people found.</p>
      ) : null}

      {filteredUsers.map((user) => (
        <article key={user.userId} className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{user.fullName}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {user.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {user.email || "No email"} · {user.city || "No city"}
              </p>
              <p className="mt-2 break-all text-xs text-muted-foreground">User ID: {user.userId}</p>
              <p className="break-all text-xs text-muted-foreground">Profile ID: {user.profileId}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!user.email || resetBusyId === user.userId}
                onClick={() => void handlePasswordReset(user)}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                {resetBusyId === user.userId ? "Sending..." : "Password reset"}
              </Button>

              <select
                aria-label={`Role for ${user.fullName}`}
                value={drafts[user.userId] || "provider"}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [user.userId]: event.target.value as "admin" | "provider",
                  }))
                }
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busyId === user.userId}
                onClick={() => void handleSave(user.userId)}
              >
                {busyId === user.userId ? "Saving..." : "Save role"}
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
