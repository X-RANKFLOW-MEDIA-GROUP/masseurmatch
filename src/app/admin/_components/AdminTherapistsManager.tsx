"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/app/_lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type TherapistAction =
  | "approve"
  | "reject"
  | "activate"
  | "suspend"
  | "ban"
  | "verify_identity"
  | "feature"
  | "unfeature";

type AdminTherapist = {
  id: string;
  user_id: string;
  display_name: string | null;
  full_name: string;
  city: string | null;
  status: string;
  is_active: boolean;
  is_verified_profile: boolean;
  is_verified_identity: boolean;
  tier: string | null;
  featured: {
    display_order: number;
    is_active: boolean;
  } | null;
};

type ActionDraft = {
  action: TherapistAction;
  reason: string;
  days: string;
  displayOrder: string;
};

const DEFAULT_ACTION: ActionDraft = {
  action: "approve",
  reason: "",
  days: "",
  displayOrder: "",
};

function buildDrafts(therapists: AdminTherapist[]) {
  return therapists.reduce<Record<string, ActionDraft>>((accumulator, therapist) => {
    accumulator[therapist.id] = {
      ...DEFAULT_ACTION,
      action: therapist.featured?.is_active ? "unfeature" : "approve",
      displayOrder:
        therapist.featured && typeof therapist.featured.display_order === "number"
          ? String(therapist.featured.display_order)
          : "",
    };
    return accumulator;
  }, {});
}

export default function AdminTherapistsManager({
  initialTherapists,
}: {
  initialTherapists: AdminTherapist[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, ActionDraft>>(() => buildDrafts(initialTherapists));
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(buildDrafts(initialTherapists));
  }, [initialTherapists]);

  const updateDraft = (therapistId: string, updates: Partial<ActionDraft>) => {
    setDrafts((current) => ({
      ...current,
      [therapistId]: {
        ...current[therapistId],
        ...updates,
      },
    }));
  };

  const handleApply = async (therapistId: string) => {
    const draft = drafts[therapistId];
    setBusyId(therapistId);

    try {
      await postJson("/api/admin/therapists", {
        therapistId,
        action: draft.action,
        reason: draft.reason || undefined,
        days: draft.action === "suspend" && draft.days ? Number(draft.days) : undefined,
        displayOrder:
          draft.action === "feature" && draft.displayOrder ? Number(draft.displayOrder) : undefined,
      });

      toast({
        title: "Therapist updated",
        description: `Applied ${draft.action} to ${therapistId}.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not apply admin action",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {initialTherapists.length === 0 ? (
        <p className="text-sm text-muted-foreground">No therapist profiles found.</p>
      ) : null}

      {initialTherapists.map((therapist) => {
        const draft = drafts[therapist.id] || DEFAULT_ACTION;
        const name = therapist.display_name || therapist.full_name || "Therapist";

        return (
          <article key={therapist.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {therapist.city || "No city"} · {therapist.tier || "free"} · {therapist.status}
                </p>
                <h2 className="mt-1 font-semibold">{name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Active: {therapist.is_active ? "yes" : "no"} · Profile verified:{" "}
                  {therapist.is_verified_profile ? "yes" : "no"} · Identity verified:{" "}
                  {therapist.is_verified_identity ? "yes" : "no"} · Featured:{" "}
                  {therapist.featured?.is_active ? `yes (#${therapist.featured.display_order})` : "no"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <select
                value={draft.action}
                onChange={(event) =>
                  updateDraft(therapist.id, { action: event.target.value as TherapistAction })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="activate">Activate</option>
                <option value="suspend">Suspend</option>
                <option value="ban">Ban</option>
                <option value="verify_identity">Verify identity</option>
                <option value="feature">Feature</option>
                <option value="unfeature">Unfeature</option>
              </select>
              <Input
                placeholder="Reason (optional)"
                value={draft.reason}
                onChange={(event) => updateDraft(therapist.id, { reason: event.target.value })}
              />
              <Input
                type="number"
                min="1"
                placeholder="Suspend days"
                value={draft.days}
                disabled={draft.action !== "suspend"}
                onChange={(event) => updateDraft(therapist.id, { days: event.target.value })}
              />
              <Input
                type="number"
                min="0"
                placeholder="Feature order"
                value={draft.displayOrder}
                disabled={draft.action !== "feature"}
                onChange={(event) => updateDraft(therapist.id, { displayOrder: event.target.value })}
              />
            </div>

            <div className="mt-3">
              <Button type="button" variant="outline" size="sm" disabled={busyId === therapist.id} onClick={() => void handleApply(therapist.id)}>
                {busyId === therapist.id ? "Applying..." : "Apply action"}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
