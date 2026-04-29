"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/app/_lib/client-api";
import { Button } from "@/components/ui/button";
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

export default function AdminUsersManager({
  initialUsers,
}: {
  initialUsers: AdminUser[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, "admin" | "provider">>(() => buildDrafts(initialUsers));
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(buildDrafts(initialUsers));
  }, [initialUsers]);

  const handleSave = async (userId: string) => {
    setBusyId(userId);

    try {
      await postJson("/api/admin/users", {
        userId,
        role: drafts[userId],
      });

      toast({
        title: "Role updated",
        description: `Saved ${drafts[userId]} for ${userId}.`,
      });
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

  return (
    <div className="space-y-4">
      {initialUsers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : null}

      {initialUsers.map((user) => (
        <article key={user.userId} className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                {user.email || "No email"} · {user.city || "No city"} · {user.status}
              </p>
              <h2 className="mt-1 font-semibold">{user.fullName}</h2>
              <p className="mt-2 text-sm text-muted-foreground">User ID: {user.userId}</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={drafts[user.userId] || "provider"}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [user.userId]: event.target.value as "admin" | "provider",
                  }))
                }
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="button" variant="outline" size="sm" disabled={busyId === user.userId} onClick={() => void handleSave(user.userId)}>
                {busyId === user.userId ? "Saving..." : "Save role"}
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
