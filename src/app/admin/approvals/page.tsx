"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { requestJson } from "@/app/_lib/request";

type TherapistProfile = {
  id: string;
  full_name: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "changes_requested";
  created_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  is_verified_identity: boolean;
  is_verified_phone: boolean;
  profile_completion: number;
};

type ApprovalFilter = "all" | "pending" | "approved" | "rejected" | "changes_requested";

const statusConfig: Record<TherapistProfile["status"], { label: string; icon: typeof AlertCircle; badgeClasses: string }> = {
  draft:             { label: "Draft",             icon: AlertCircle,  badgeClasses: "bg-slate-50 text-slate-700" },
  pending_approval:  { label: "Pending",           icon: Clock,        badgeClasses: "bg-amber-50 text-amber-700" },
  approved:          { label: "Approved",          icon: CheckCircle2, badgeClasses: "bg-emerald-50 text-emerald-700" },
  rejected:          { label: "Rejected",          icon: XCircle,      badgeClasses: "bg-rose-50 text-rose-700" },
  changes_requested: { label: "Changes Requested", icon: AlertCircle,  badgeClasses: "bg-red-50 text-red-700" },
};

export default function ApprovalsPage() {
  const [profiles, setProfiles] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApprovalFilter>("pending");

  useEffect(() => {
    setLoading(true);
    setError(null);
    requestJson<{ ok: boolean; profiles: TherapistProfile[] }>(`/api/admin/approvals?status=${filter}`)
      .then((data) => {
        setProfiles(data.profiles || []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load profiles.");
        setProfiles([]);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const filters: { value: ApprovalFilter; label: string; count?: number }[] = [
    { value: "pending", label: "Pending Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "changes_requested", label: "Changes Requested" },
    { value: "all", label: "All" },
  ];

  function getHoursWaiting(submittedAt: string | null): string {
    if (!submittedAt) return "—";
    const hours = Math.floor(
      (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60)
    );
    if (hours < 1) return "< 1h";
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Therapist Approvals"
        description="Review and approve pending therapist profile submissions. Check identity verification, photos, and profile completeness before approving."
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-border pb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`whitespace-nowrap px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === f.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Profile Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading profiles...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No profiles found for this filter.</p>
          </div>
        ) : (
          profiles.map((profile) => {
            // Fall back gracefully when a profile has a status not present in
            // statusConfig (e.g. legacy "pending" vs "pending_approval"), so an
            // unmapped value can never crash the whole approvals page.
            const config =
              statusConfig[profile.status] ?? {
                label:
                  typeof profile.status === "string" && profile.status.length > 0
                    ? profile.status.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())
                    : "Unknown",
                icon: AlertCircle,
                badgeClasses: "bg-slate-50 text-slate-700",
              };
            const StatusIcon = config.icon;

            return (
              <Link
                key={profile.id}
                href={`/admin/approvals/${profile.id}`}
                className="block border border-border bg-white p-5 rounded-lg transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {profile.display_name || profile.full_name}
                      </h3>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.badgeClasses}`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profile.email} • {profile.city || "No city"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.is_verified_identity && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          ID Verified
                        </span>
                      )}
                      {!profile.is_verified_identity && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700">
                          <AlertCircle className="h-3 w-3" />
                          ID Not Verified
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700">
                        {profile.profile_completion}% Complete
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 text-right">
                    {profile.submitted_at && (
                      <div className="text-xs text-muted-foreground">
                        <div className="font-mono text-[10px] uppercase tracking-wider">
                          Waiting
                        </div>
                        <div className="font-semibold text-foreground">
                          {getHoursWaiting(profile.submitted_at)}
                        </div>
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
