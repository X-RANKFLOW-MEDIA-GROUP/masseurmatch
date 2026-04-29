"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Star, Eye, Search, Filter, Clock } from "lucide-react";
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
  slug?: string | null;
  user_id: string;
  display_name: string | null;
  full_name: string;
  city: string | null;
  profile_status: string;
  subscription_tier: string | null;
  verification_status: string | null;
  is_featured: boolean;
  is_suspended: boolean;
  is_banned: boolean;
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
      action: therapist.is_featured ? "unfeature" : "approve",
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
  const [search, setSearch] = useState("");

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
      // Use the specific admin API routes created earlier
      let endpoint = `/api/admin/profile/${therapistId}/${draft.action}`;
      if (draft.action === "feature" || draft.action === "unfeature") {
        endpoint = `/api/admin/profile/${therapistId}/feature`; // Assuming a feature endpoint
      } else if (draft.action === "suspend" || draft.action === "ban") {
        endpoint = `/api/admin/user/${therapistId}/${draft.action}`;
      }

      await postJson(endpoint, {
        reason: draft.reason || undefined,
        days: draft.action === "suspend" && draft.days ? Number(draft.days) : undefined,
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

  const filteredTherapists = initialTherapists.filter(t => 
    (t.display_name || t.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.city || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredTherapists.length === 0 ? (
        <p className="text-sm text-muted-foreground">No therapist profiles found.</p>
      ) : null}

      <div className="grid gap-4">
        {filteredTherapists.map((therapist) => {
          const draft = drafts[therapist.id] || DEFAULT_ACTION;
          const name = therapist.display_name || therapist.full_name || "Therapist";

          return (
            <article key={therapist.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-slate-900">{name}</h2>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      therapist.subscription_tier === 'elite' ? 'bg-amber-100 text-amber-700' :
                      therapist.subscription_tier === 'pro' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {therapist.subscription_tier || 'free'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {therapist.city || "No city"} · ID: {therapist.id.slice(0, 8)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    <span className={`flex items-center gap-1 ${therapist.profile_status === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {therapist.profile_status === 'approved' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      Profile: {therapist.profile_status?.replace('_', ' ')}
                    </span>
                    <span className={`flex items-center gap-1 ${therapist.verification_status === 'verified' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <ShieldCheck className="h-3 w-3" />
                      Identity: {therapist.verification_status || 'unverified'}
                    </span>
                    {therapist.is_featured && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Star className="h-3 w-3 fill-current" /> Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`/therapists/${therapist.slug || therapist.id}`, '_blank')}
                  >
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <select
                  value={draft.action}
                  onChange={(event) =>
                    updateDraft(therapist.id, { action: event.target.value as TherapistAction })
                  }
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/5"
                >
                  <option value="approve">Approve Profile</option>
                  <option value="reject">Reject Profile</option>
                  <option value="suspend">Suspend User</option>
                  <option value="ban">Ban User</option>
                  <option value="verify_identity">Verify Identity</option>
                  <option value="feature">Feature Profile</option>
                  <option value="unfeature">Unfeature Profile</option>
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
                <Button 
                  type="button" 
                  className="bg-slate-900 text-white hover:bg-slate-800"
                  disabled={busyId === therapist.id} 
                  onClick={() => void handleApply(therapist.id)}
                >
                  {busyId === therapist.id ? "Applying..." : "Apply Action"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
