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
  const [createBusy, setCreateBusy] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    displayName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    state: "",
    neighborhood: "",
    tagline: "",
    bio: "",
    languages: "",
    education: "",
    certifications: "",
    yearsExperience: "",
    serviceCategories: "",
    sessionLengths: "60 min",
    locationType: "both" as "incall" | "outcall" | "both",
    startingPrice: "",
    addOns: "",
    role: "provider" as "admin" | "provider" | "client",
    profileStatus: "pending_approval" as "draft" | "pending_approval" | "active",
    availableNow: false,
  });

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

  const handleCreateUser = async () => {
    setCreateBusy(true);

    try {
      await postJson("/api/admin/users", {
        fullName: createForm.fullName,
        displayName: createForm.displayName || undefined,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone || undefined,
        city: createForm.city || undefined,
        state: createForm.state || undefined,
        neighborhood: createForm.neighborhood || undefined,
        tagline: createForm.tagline || undefined,
        bio: createForm.bio || undefined,
        languages: createForm.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        education: createForm.education || undefined,
        certifications: createForm.certifications || undefined,
        yearsExperience: createForm.yearsExperience || undefined,
        serviceCategories: createForm.serviceCategories
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        sessionLengths: createForm.sessionLengths
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        locationType: createForm.locationType,
        startingPrice: createForm.startingPrice || undefined,
        addOns: createForm.addOns || undefined,
        role: createForm.role,
        profileStatus: createForm.profileStatus,
        availableNow: createForm.availableNow,
      });

      toast({
        title: "User profile created",
        description: `${createForm.fullName} was created with a complete profile.`,
      });
      setCreateForm({
        fullName: "",
        displayName: "",
        email: "",
        password: "",
        phone: "",
        city: "",
        state: "",
        neighborhood: "",
        tagline: "",
        bio: "",
        languages: "",
        education: "",
        certifications: "",
        yearsExperience: "",
        serviceCategories: "",
        sessionLengths: "60 min",
        locationType: "both",
        startingPrice: "",
        addOns: "",
        role: "provider",
        profileStatus: "pending_approval",
        availableNow: false,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not create profile",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <article className="rounded-lg border border-border p-4">
        <h2 className="font-semibold">Create user + full profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an auth user and prefill complete profile details in one action.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input placeholder="Full name *" className="rounded-md border px-3 py-2 text-sm" value={createForm.fullName} onChange={(event) => setCreateForm((current) => ({ ...current, fullName: event.target.value }))} />
          <input placeholder="Display name" className="rounded-md border px-3 py-2 text-sm" value={createForm.displayName} onChange={(event) => setCreateForm((current) => ({ ...current, displayName: event.target.value }))} />
          <input placeholder="Email *" type="email" className="rounded-md border px-3 py-2 text-sm" value={createForm.email} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} />
          <input placeholder="Temporary password *" type="password" className="rounded-md border px-3 py-2 text-sm" value={createForm.password} onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))} />
          <input placeholder="Phone" className="rounded-md border px-3 py-2 text-sm" value={createForm.phone} onChange={(event) => setCreateForm((current) => ({ ...current, phone: event.target.value }))} />
          <input placeholder="City" className="rounded-md border px-3 py-2 text-sm" value={createForm.city} onChange={(event) => setCreateForm((current) => ({ ...current, city: event.target.value }))} />
          <input placeholder="State" className="rounded-md border px-3 py-2 text-sm" value={createForm.state} onChange={(event) => setCreateForm((current) => ({ ...current, state: event.target.value }))} />
          <input placeholder="Neighborhood" className="rounded-md border px-3 py-2 text-sm" value={createForm.neighborhood} onChange={(event) => setCreateForm((current) => ({ ...current, neighborhood: event.target.value }))} />
          <input placeholder="Tagline" className="rounded-md border px-3 py-2 text-sm md:col-span-2" value={createForm.tagline} onChange={(event) => setCreateForm((current) => ({ ...current, tagline: event.target.value }))} />
          <textarea placeholder="Bio" className="min-h-24 rounded-md border px-3 py-2 text-sm md:col-span-2" value={createForm.bio} onChange={(event) => setCreateForm((current) => ({ ...current, bio: event.target.value }))} />
          <input placeholder="Languages (comma separated)" className="rounded-md border px-3 py-2 text-sm" value={createForm.languages} onChange={(event) => setCreateForm((current) => ({ ...current, languages: event.target.value }))} />
          <input placeholder="Education" className="rounded-md border px-3 py-2 text-sm" value={createForm.education} onChange={(event) => setCreateForm((current) => ({ ...current, education: event.target.value }))} />
          <input placeholder="Certifications" className="rounded-md border px-3 py-2 text-sm" value={createForm.certifications} onChange={(event) => setCreateForm((current) => ({ ...current, certifications: event.target.value }))} />
          <input placeholder="Years experience" className="rounded-md border px-3 py-2 text-sm" value={createForm.yearsExperience} onChange={(event) => setCreateForm((current) => ({ ...current, yearsExperience: event.target.value }))} />
          <input placeholder="Service categories (comma separated)" className="rounded-md border px-3 py-2 text-sm" value={createForm.serviceCategories} onChange={(event) => setCreateForm((current) => ({ ...current, serviceCategories: event.target.value }))} />
          <input placeholder="Session lengths (e.g. 60 min, 90 min)" className="rounded-md border px-3 py-2 text-sm" value={createForm.sessionLengths} onChange={(event) => setCreateForm((current) => ({ ...current, sessionLengths: event.target.value }))} />
          <input placeholder="Starting price (USD)" className="rounded-md border px-3 py-2 text-sm" value={createForm.startingPrice} onChange={(event) => setCreateForm((current) => ({ ...current, startingPrice: event.target.value }))} />
          <input placeholder="Add-ons (e.g. CBD +$30)" className="rounded-md border px-3 py-2 text-sm" value={createForm.addOns} onChange={(event) => setCreateForm((current) => ({ ...current, addOns: event.target.value }))} />

          <select value={createForm.locationType} onChange={(event) => setCreateForm((current) => ({ ...current, locationType: event.target.value as "incall" | "outcall" | "both" }))} className="rounded-md border px-3 py-2 text-sm">
            <option value="both">Both incall + outcall</option>
            <option value="incall">Incall only</option>
            <option value="outcall">Outcall only</option>
          </select>
          <select value={createForm.role} onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value as "admin" | "provider" | "client" }))} className="rounded-md border px-3 py-2 text-sm">
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
          </select>
          <select value={createForm.profileStatus} onChange={(event) => setCreateForm((current) => ({ ...current, profileStatus: event.target.value as "draft" | "pending_approval" | "active" }))} className="rounded-md border px-3 py-2 text-sm">
            <option value="pending_approval">Pending approval</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={createForm.availableNow} onChange={(event) => setCreateForm((current) => ({ ...current, availableNow: event.target.checked }))} />
            Available now
          </label>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            disabled={createBusy || !createForm.fullName || !createForm.email || !createForm.password}
            onClick={() => void handleCreateUser()}
          >
            {createBusy ? "Creating..." : "Create full profile"}
          </Button>
        </div>
      </article>

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
