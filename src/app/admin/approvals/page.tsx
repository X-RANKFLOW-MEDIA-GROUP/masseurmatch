"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, EyeOff, ShieldAlert, PhoneOff, CreditCard } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { requestJson } from "@/app/_lib/request";

type TherapistProfile = {
  id: string;
  full_name: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  status: string;
  profile_status: string | null;
  visibility_status: string | null;
  subscription_tier: string | null;
  created_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  is_verified_identity: boolean;
  is_verified_phone: boolean;
  profile_completion: number;
};

type ApprovalFilter = "pending" | "approved" | "rejected" | "changes_requested" | "hidden" | "missing_id" | "missing_phone" | "paid_hidden" | "all";

const filters: { value: ApprovalFilter; label: string; icon?: typeof AlertCircle }[] = [
  { value: "pending", label: "Pending Review", icon: Clock },
  { value: "paid_hidden", label: "Paid but Hidden", icon: CreditCard },
  { value: "hidden", label: "Hidden", icon: EyeOff },
  { value: "missing_id", label: "Missing ID", icon: ShieldAlert },
  { value: "missing_phone", label: "Missing Phone", icon: PhoneOff },
  { value: "approved", label: "Approved", icon: CheckCircle2 },
  { value: "changes_requested", label: "Changes Requested", icon: AlertCircle },
  { value: "rejected", label: "Rejected", icon: XCircle },
  { value: "all", label: "All" },
];

function prettyStatus(value: string | null | undefined) {
  if (!value) return "Unknown";
  return value.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export default function ApprovalsPage() {
  const [profiles, setProfiles] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApprovalFilter>("pending");

  useEffect(() => {
    setLoading(true);
    setError(null);
    requestJson<{ ok: boolean; profiles: TherapistProfile[] }>(`/api/admin/approvals?status=${filter}`)
      .then((data) => setProfiles(data.profiles || []))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load profiles.");
        setProfiles([]);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  function getHoursWaiting(submittedAt: string | null): string {
    if (!submittedAt) return "—";
    const hours = Math.floor((Date.now() - new Date(submittedAt).getTime()) / 3_600_000);
    if (hours < 1) return "< 1h";
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Profile Operations"
        description="Review moderation and profile-health queues without automatically publishing or approving providers."
      />

      <div className="flex gap-2 overflow-x-auto border-b border-border pb-4">
        {filters.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${filter === item.value ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{profiles.length}</strong> profiles in {filters.find((item) => item.value === filter)?.label || filter}. Verification queues only flag public profiles; no automatic approval or publishing occurs here.
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading profiles...</div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">{error}</div>
        ) : profiles.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No profiles found for this queue.</div>
        ) : profiles.map((profile) => (
          <Link key={profile.id} href={`/admin/approvals/${profile.id}`} className="block rounded-lg border border-border bg-white p-5 transition-all hover:border-primary/50 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{profile.display_name || profile.full_name || "Unnamed provider"}</h3>
                  <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">{prettyStatus(profile.status)}</span>
                  {profile.subscription_tier && profile.subscription_tier !== "free" ? (
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">{prettyStatus(profile.subscription_tier)}</span>
                  ) : null}
                  {profile.visibility_status === "hidden" ? <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">Hidden</span> : null}
                </div>
                <p className="text-sm text-muted-foreground">{profile.email} • {[profile.city, profile.state].filter(Boolean).join(", ") || "No location"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${profile.is_verified_identity ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {profile.is_verified_identity ? <CheckCircle2 className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                    {profile.is_verified_identity ? "ID Verified" : "ID Missing"}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${profile.is_verified_phone ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {profile.is_verified_phone ? <CheckCircle2 className="h-3 w-3" /> : <PhoneOff className="h-3 w-3" />}
                    {profile.is_verified_phone ? "Phone Verified" : "Phone Missing"}
                  </span>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">{profile.profile_completion ?? 0}% Complete</span>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">Profile: {prettyStatus(profile.profile_status)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 text-right">
                {profile.submitted_at ? (
                  <div className="text-xs text-muted-foreground"><div className="font-mono text-[10px] uppercase tracking-wider">Waiting</div><div className="font-semibold text-foreground">{getHoursWaiting(profile.submitted_at)}</div></div>
                ) : null}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
