"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Flag, Loader2, ShieldAlert } from "lucide-react";

import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { requestJson } from "@/app/_lib/request";

type ReportStatus = "open" | "reviewing" | "actioned" | "dismissed";

type ProfileReport = {
  id: string;
  profile_id: string;
  profile_slug: string | null;
  profile_name: string | null;
  category: string;
  reason: string;
  reporter_email: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
};

type Filter = ReportStatus | "all";

const CATEGORY_LABELS: Record<string, string> = {
  sexual_solicitation: "Sexual solicitation",
  trafficking: "Suspected trafficking",
  prohibited_content: "Prohibited content",
  csam: "CSAM (minor)",
  fake_or_stolen: "Fake / stolen photos",
  harassment_safety: "Harassment / safety",
  other: "Other",
};

const URGENT = new Set(["trafficking", "csam"]);

const FILTERS: { value: Filter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "actioned", label: "Actioned" },
  { value: "dismissed", label: "Dismissed" },
  { value: "all", label: "All" },
];

const NEXT_STATUS: { value: ReportStatus; label: string }[] = [
  { value: "reviewing", label: "Mark reviewing" },
  { value: "actioned", label: "Mark actioned" },
  { value: "dismissed", label: "Dismiss" },
];

export default function ProfileReportsPage() {
  const [reports, setReports] = useState<ProfileReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("open");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    requestJson<{ ok: boolean; reports: ProfileReport[] }>(`/api/admin/profile-reports?status=${filter}`)
      .then((data) => setReports(data.reports || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: ReportStatus) => {
    setUpdatingId(id);
    try {
      await requestJson(`/api/admin/profile-reports`, {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      load();
    } catch {
      /* keep the row; a retry is available */
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Profile Reports"
        description="Abuse reports submitted by visitors from therapist profiles. Trafficking and CSAM reports are flagged urgent — act on them first and escalate to the relevant authorities."
      />

      <div className="flex gap-2 overflow-x-auto border-b border-border pb-4">
        {FILTERS.map((f) => (
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

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No reports for this filter.</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const urgent = URGENT.has(report.category);
            return (
              <div
                key={report.id}
                className={`rounded-lg border bg-white p-5 ${urgent ? "border-red-300 ring-1 ring-red-200" : "border-border"}`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                      urgent ? "bg-red-50 text-red-700" : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {urgent ? <ShieldAlert className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
                    {CATEGORY_LABELS[report.category] ?? report.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                      report.status === "open"
                        ? "bg-amber-50 text-amber-700"
                        : report.status === "actioned"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {report.status === "open" && <AlertTriangle className="h-3 w-3" />}
                    {report.status === "actioned" && <CheckCircle2 className="h-3 w-3" />}
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground">
                  {report.profile_slug ? (
                    <Link
                      href={`/therapists/${report.profile_slug}`}
                      target="_blank"
                      className="hover:text-primary hover:underline"
                    >
                      {report.profile_name || report.profile_id}
                    </Link>
                  ) : (
                    report.profile_name || report.profile_id
                  )}
                </h3>

                <p className="mt-2 whitespace-pre-line text-sm text-foreground">{report.reason}</p>

                {report.reporter_email ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Reporter: <a href={`mailto:${report.reporter_email}`} className="underline">{report.reporter_email}</a>
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Reporter: anonymous</p>
                )}

                {report.admin_notes ? (
                  <p className="mt-2 text-xs text-muted-foreground">Notes: {report.admin_notes}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {NEXT_STATUS.filter((s) => s.value !== report.status).map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateStatus(report.id, s.value)}
                      disabled={updatingId === report.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
                    >
                      {updatingId === report.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
