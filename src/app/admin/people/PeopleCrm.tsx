"use client";

import { useMemo, useState } from "react";
import { Check, ExternalLink, ImageIcon, KeyRound, RefreshCw, Search, Star, Trash2, UserRound, X } from "lucide-react";

import { postJson } from "@/app/_lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { AdminPerson } from "./loadPeople";

export default function PeopleCrm({ people }: { people: AdminPerson[] }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return people;
    return people.filter((person) =>
      [person.name, person.email, person.city, person.role, person.profileStatus, person.subscriptionTier, person.userId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [people, search]);

  const sendPasswordReset = async (person: AdminPerson) => {
    setBusyId(person.userId);
    try {
      await postJson("/api/admin/users/reset-password", { userId: person.userId });
      toast({ title: "Password reset sent", description: `A secure reset email was sent to ${person.email || "the user"}.` });
    } catch (error) {
      toast({ title: "Could not send password reset", description: error instanceof Error ? error.message : "Unknown error.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const runPhotoAction = async (photoId: string, action: "approve" | "reject" | "set_primary" | "delete" | "reprocess") => {
    setBusyId(photoId);
    try {
      await postJson("/api/admin/photos/action", { photoId, action });
      toast({ title: "Photo updated", description: `Action ${action.replace("_", " ")} completed.` });
      window.location.reload();
    } catch (error) {
      toast({ title: "Could not update photo", description: error instanceof Error ? error.message : "Unknown error.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, city, status or ID..." className="pl-10" />
      </div>

      <div className="grid gap-4">
        {filtered.map((person) => {
          const expanded = expandedId === person.profileId;
          const primaryPhoto = person.photos.find((photo) => photo.isPrimary) || person.photos[0];
          return (
            <article key={person.profileId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button type="button" onClick={() => setExpandedId(expanded ? null : person.profileId)} className="flex w-full items-center gap-4 p-5 text-left hover:bg-slate-50">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                  {primaryPhoto ? <img src={primaryPhoto.url} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-6 w-6 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-slate-900">{person.name}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{person.role || "provider"}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{person.profileStatus}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">{person.email || "No email"} · {person.city || "No city"} · {person.photos.length} photo(s)</p>
                </div>
                <span className="text-xs font-medium text-slate-500">{expanded ? "Close" : "Open"}</span>
              </button>

              {expanded ? (
                <div className="border-t border-slate-100 p-5">
                  <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
                    <div className="space-y-4">
                      <div className="rounded-xl bg-slate-50 p-4 text-sm">
                        <p><strong>User ID:</strong> {person.userId}</p>
                        <p className="mt-1"><strong>Profile ID:</strong> {person.profileId}</p>
                        <p className="mt-1"><strong>Plan:</strong> {person.subscriptionTier || "free"}</p>
                        <p className="mt-1"><strong>Verification:</strong> {person.verificationStatus || "unverified"}</p>
                        <p className="mt-1"><strong>Featured:</strong> {person.isFeatured ? "Yes" : "No"}</p>
                        <p className="mt-1"><strong>Suspended:</strong> {person.isSuspended ? "Yes" : "No"}</p>
                        <p className="mt-1"><strong>Banned:</strong> {person.isBanned ? "Yes" : "No"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" disabled={!person.email || busyId === person.userId} onClick={() => void sendPasswordReset(person)}>
                          <KeyRound className="mr-2 h-4 w-4" />{busyId === person.userId ? "Sending..." : "Send password reset"}
                        </Button>
                        {person.slug ? <Button type="button" variant="outline" asChild><a href={`/therapists/${person.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />View public profile</a></Button> : null}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-slate-500" /><h3 className="font-semibold">Cloudinary gallery</h3></div>
                      {person.photos.length ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {person.photos.map((photo) => (
                            <div key={photo.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                              <div className="aspect-square bg-slate-100"><img src={photo.url} alt="" className="h-full w-full object-cover" /></div>
                              <div className="space-y-2 p-3 text-xs text-slate-600">
                                <div className="flex items-center justify-between gap-2"><span>{photo.moderationStatus}</span>{photo.isPrimary ? <span className="font-medium text-amber-700">Primary</span> : null}</div>
                                {photo.moderationReason ? <p className="truncate">{photo.moderationReason}</p> : null}
                                <div className="flex flex-wrap gap-1.5">
                                  <Button size="sm" variant="outline" disabled={busyId === photo.id} onClick={() => void runPhotoAction(photo.id, "approve")}><Check className="h-3.5 w-3.5" /></Button>
                                  <Button size="sm" variant="outline" disabled={busyId === photo.id} onClick={() => void runPhotoAction(photo.id, "reject")}><X className="h-3.5 w-3.5" /></Button>
                                  <Button size="sm" variant="outline" disabled={busyId === photo.id || photo.isPrimary} onClick={() => void runPhotoAction(photo.id, "set_primary")}><Star className="h-3.5 w-3.5" /></Button>
                                  <Button size="sm" variant="outline" disabled={busyId === photo.id} onClick={() => void runPhotoAction(photo.id, "reprocess")}><RefreshCw className="h-3.5 w-3.5" /></Button>
                                  <Button size="sm" variant="outline" disabled={busyId === photo.id} onClick={() => void runPhotoAction(photo.id, "delete")}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-slate-500">No photos registered in profile_photos.</p>}
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      {filtered.length === 0 ? <p className="text-sm text-slate-500">No people found.</p> : null}
    </div>
  );
}
