"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  Check,
  ChevronRight,
  ExternalLink,
  ImageIcon,
  KeyRound,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  Star,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { postJson } from "@/app/_lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { AdminPerson } from "./loadPeople";

type StatusFilter = "all" | "approved" | "pending" | "suspended" | "banned";
type PlanFilter = "all" | "free" | "standard" | "pro" | "elite";

type AccountAction = "deactivate" | "reactivate" | "delete";

const planOptions = ["free", "standard", "pro", "elite"] as const;

function statusTone(status: string) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status.includes("pending")) return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "rejected") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function planTone(plan: string | null) {
  if (plan === "elite") return "bg-amber-100 text-amber-800";
  if (plan === "pro") return "bg-indigo-100 text-indigo-800";
  if (plan === "standard") return "bg-sky-100 text-sky-800";
  return "bg-slate-100 text-slate-700";
}

export default function PeopleCrm({ people }: { people: AdminPerson[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(people[0]?.profileId ?? null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [dangerReason, setDangerReason] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [showDanger, setShowDanger] = useState(false);

  const selected = people.find((person) => person.profileId === selectedId) ?? null;

  const stats = useMemo(() => ({
    total: people.length,
    approved: people.filter((person) => person.profileStatus === "approved").length,
    pending: people.filter((person) => person.profileStatus.includes("pending")).length,
    restricted: people.filter((person) => person.isSuspended || person.isBanned).length,
  }), [people]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return people.filter((person) => {
      const matchesSearch = !query || [
        person.name,
        person.email,
        person.city,
        person.role,
        person.profileStatus,
        person.subscriptionTier,
        person.userId,
        person.profileId,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus = statusFilter === "all"
        || (statusFilter === "suspended" && person.isSuspended)
        || (statusFilter === "banned" && person.isBanned)
        || (statusFilter === "pending" && person.profileStatus.includes("pending"))
        || person.profileStatus === statusFilter;

      const matchesPlan = planFilter === "all" || (person.subscriptionTier || "free") === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [people, search, statusFilter, planFilter]);

  const run = async (key: string, endpoint: string, payload: Record<string, unknown>, success: string) => {
    setBusyId(key);
    try {
      await postJson(endpoint, payload);
      toast({ title: success });
      router.refresh();
      return true;
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const sendPasswordReset = (person: AdminPerson) => run(
    person.userId,
    "/api/admin/users/reset-password",
    { userId: person.userId },
    "Password reset email sent",
  );

  const updatePlan = (person: AdminPerson, tier: string) => run(
    `plan-${person.profileId}`,
    `/api/admin/profile/${person.profileId}/upgrade`,
    { subscription_tier: tier },
    `Plan changed to ${tier}`,
  );

  const updateProfile = async (
    person: AdminPerson,
    action: "approve" | "reject" | "verify_identity" | "feature" | "unfeature",
  ) => {
    const succeeded = await run(
      `${action}-${person.profileId}`,
      action === "feature" || action === "unfeature"
        ? `/api/admin/profile/${person.profileId}/feature`
        : `/api/admin/profile/${person.profileId}/${action}`,
      action === "approve" || action === "reject" ? { reason: reviewReason.trim() || undefined } : {},
      `Profile ${action.replace("_", " ")} completed`,
    );

    if (succeeded && (action === "approve" || action === "reject")) {
      setReviewReason("");
    }
  };

  const accountAction = async (person: AdminPerson, action: AccountAction) => {
    const succeeded = await run(
      `${action}-${person.userId}`,
      "/api/admin/people/account-action",
      {
        userId: person.userId,
        profileId: person.profileId,
        action,
        confirmation: action === "delete" ? deleteConfirmation : undefined,
        reason: dangerReason || undefined,
      },
      action === "delete" ? "Account permanently deleted" : `Account ${action}d`,
    );
    if (!succeeded) return;

    if (action === "delete") setSelectedId(null);
    setDeleteConfirmation("");
    setDangerReason("");
    setShowDanger(false);
  };

  const photoAction = (photoId: string, action: "approve" | "reject" | "set_primary" | "delete" | "reprocess") => run(
    `${action}-${photoId}`,
    "/api/admin/photos/action",
    { photoId, action },
    `Photo ${action.replace("_", " ")} completed`,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total people", value: stats.total, icon: Users },
          { label: "Approved", value: stats.approved, icon: UserCheck },
          { label: "Needs review", value: stats.pending, icon: Shield },
          { label: "Restricted", value: stats.restricted, icon: Ban },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">People</h2>
              <p className="text-sm text-slate-500">Manage accounts, plans, profiles, access, verification and photos.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, city or ID" className="pl-9" />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Needs review</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
              <select value={planFilter} onChange={(event) => setPlanFilter(event.target.value as PlanFilter)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="all">All plans</option>
                {planOptions.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid min-h-[680px] xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,.85fr)]">
          <div className="overflow-x-auto border-r border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Person</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Photos</th>
                  <th className="px-4 py-3 font-semibold"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((person) => {
                  const primary = person.photos.find((photo) => photo.isPrimary) || person.photos[0];
                  const active = selectedId === person.profileId;
                  return (
                    <tr
                      key={person.profileId}
                      onClick={() => {
                        setSelectedId(person.profileId);
                        setReviewReason("");
                      }}
                      className={`cursor-pointer transition ${active ? "bg-slate-950 text-white" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 overflow-hidden rounded-xl ${active ? "bg-white/10" : "bg-slate-100"}`}>
                            {primary ? <img src={primary.url} alt="" className="h-full w-full object-cover" /> : <UserRound className="m-2.5 h-6 w-6 text-slate-400" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{person.name}</p>
                            <p className={`truncate text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{person.email || "No email"}</p>
                            <p className={`truncate text-xs ${active ? "text-slate-400" : "text-slate-400"}`}>{person.city || "No city"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${active ? "bg-white/10 text-white ring-white/20" : statusTone(person.profileStatus)}`}>{person.profileStatus}</span>
                        {(person.isSuspended || person.isBanned) && <p className={`mt-1 text-xs ${active ? "text-rose-300" : "text-rose-600"}`}>{person.isBanned ? "Banned" : "Suspended"}</p>}
                      </td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-white/10 text-white" : planTone(person.subscriptionTier)}`}>{person.subscriptionTier || "free"}</span></td>
                      <td className="px-4 py-3">{person.photos.length}</td>
                      <td className="px-4 py-3"><ChevronRight className="h-4 w-4" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No people match these filters.</div>}
          </div>

          <aside className="bg-slate-50/70 p-5">
            {!selected ? (
              <div className="flex h-full min-h-[500px] items-center justify-center text-center">
                <div><UserRound className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-medium text-slate-700">Select a person</p><p className="text-sm text-slate-500">Their account controls will appear here.</p></div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">Account overview</p>
                      <h2 className="mt-2 text-2xl font-semibold">{selected.name}</h2>
                      <p className="mt-1 text-sm text-slate-300">{selected.email || "No email"}</p>
                    </div>
                    <MoreHorizontal className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-400">Profile status</p><p className="mt-1 font-medium">{selected.profileStatus}</p></div>
                    <div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-400">Verification</p><p className="mt-1 font-medium">{selected.verificationStatus || "unverified"}</p></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-950">Quick actions</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="outline" disabled={!selected.email || busyId === selected.userId} onClick={() => void sendPasswordReset(selected)}><KeyRound className="mr-2 h-4 w-4" />Reset password</Button>
                    {selected.slug ? <Button variant="outline" asChild><a href={`/therapists/${selected.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Public profile</a></Button> : <Button variant="outline" disabled><ExternalLink className="mr-2 h-4 w-4" />No public page</Button>}
                    <Button variant="outline" onClick={() => void updateProfile(selected, selected.isFeatured ? "unfeature" : "feature")}><Star className="mr-2 h-4 w-4" />{selected.isFeatured ? "Unfeature" : "Feature"}</Button>
                    <Button variant="outline" onClick={() => void updateProfile(selected, "verify_identity")}><BadgeCheck className="mr-2 h-4 w-4" />Verify identity</Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-950">Profile review</h3>
                  <Input
                    value={reviewReason}
                    onChange={(event) => setReviewReason(event.target.value)}
                    placeholder="Review note (required to reject)"
                    className="mt-3"
                  />
                  <div className="mt-3 flex gap-2">
                    <Button disabled={busyId !== null} className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => void updateProfile(selected, "approve")}><Check className="mr-2 h-4 w-4" />Approve</Button>
                    <Button disabled={busyId !== null || !reviewReason.trim()} className="flex-1" variant="destructive" onClick={() => void updateProfile(selected, "reject")}><X className="mr-2 h-4 w-4" />Reject</Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-950">Subscription</h3>
                  <p className="mt-1 text-sm text-slate-500">Change access immediately without searching for a hidden action menu.</p>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {planOptions.map((plan) => (
                      <button key={plan} type="button" onClick={() => void updatePlan(selected, plan)} className={`rounded-xl border px-2 py-3 text-xs font-semibold capitalize transition ${selected.subscriptionTier === plan || (!selected.subscriptionTier && plan === "free") ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white hover:border-slate-400"}`}>{plan}</button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between"><div><h3 className="font-semibold text-slate-950">Photos</h3><p className="text-sm text-slate-500">{selected.photos.length} uploaded</p></div><ImageIcon className="h-5 w-5 text-slate-400" /></div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {selected.photos.map((photo) => (
                      <div key={photo.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="relative aspect-square bg-slate-100"><img src={photo.url} alt="" className="h-full w-full object-cover" />{photo.isPrimary && <span className="absolute left-2 top-2 rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white">Primary</span>}</div>
                        <div className="p-2">
                          <p className="truncate text-xs font-medium text-slate-700">{photo.moderationStatus}</p>
                          <div className="mt-2 grid grid-cols-5 gap-1">
                            <button aria-label="Approve photo" className="rounded-md border p-1.5 hover:bg-emerald-50" onClick={() => void photoAction(photo.id, "approve")}><Check className="h-3.5 w-3.5" /></button>
                            <button aria-label="Reject photo" className="rounded-md border p-1.5 hover:bg-rose-50" onClick={() => void photoAction(photo.id, "reject")}><X className="h-3.5 w-3.5" /></button>
                            <button aria-label="Set primary photo" disabled={photo.isPrimary} className="rounded-md border p-1.5 disabled:opacity-40" onClick={() => void photoAction(photo.id, "set_primary")}><Star className="h-3.5 w-3.5" /></button>
                            <button aria-label="Reprocess photo" className="rounded-md border p-1.5" onClick={() => void photoAction(photo.id, "reprocess")}><RefreshCw className="h-3.5 w-3.5" /></button>
                            <button aria-label="Delete photo" className="rounded-md border p-1.5 text-rose-600" onClick={() => void photoAction(photo.id, "delete")}><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!selected.photos.length && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No photos uploaded.</p>}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                  <p><strong className="text-slate-700">User ID:</strong> {selected.userId}</p>
                  <p className="mt-1"><strong className="text-slate-700">Profile ID:</strong> {selected.profileId}</p>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setShowDanger((value) => !value)}>
                    <div><p className="font-semibold text-rose-900">Danger zone</p><p className="text-sm text-rose-700">Deactivate or permanently delete this account.</p></div><AlertTriangle className="h-5 w-5 text-rose-600" />
                  </button>
                  {showDanger && (
                    <div className="mt-4 space-y-3 border-t border-rose-200 pt-4">
                      <Input value={dangerReason} onChange={(event) => setDangerReason(event.target.value)} placeholder="Reason for this action" />
                      <div className="grid grid-cols-2 gap-2">
                        {selected.isSuspended || selected.isBanned ? (
                          <Button variant="outline" className="border-emerald-300 text-emerald-700" onClick={() => void accountAction(selected, "reactivate")}><UserCheck className="mr-2 h-4 w-4" />Reactivate</Button>
                        ) : (
                          <Button variant="outline" className="border-amber-300 text-amber-700" onClick={() => void accountAction(selected, "deactivate")}><Ban className="mr-2 h-4 w-4" />Deactivate</Button>
                        )}
                        <Button variant="destructive" disabled={deleteConfirmation !== "DELETE"} onClick={() => void accountAction(selected, "delete")}><Trash2 className="mr-2 h-4 w-4" />Delete forever</Button>
                      </div>
                      <Input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder="Type DELETE to enable permanent deletion" />
                      <p className="text-xs text-rose-700">Permanent deletion removes the profile and authentication account. This cannot be undone.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
