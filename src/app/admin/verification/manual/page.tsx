"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, RefreshCw, ShieldCheck, XCircle } from "lucide-react";

import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const APPROVAL_CRITERIA = [
  ["document_valid", "Government ID appears authentic and readable"],
  ["document_unexpired", "Government ID appears unexpired"],
  ["selfie_matches", "Selfie appears to match the ID photo"],
  ["challenge_visible", "Current selfie clearly shows the challenge code"],
] as const;

const REJECTION_OPTIONS = [
  ["document_unreadable", "Document unreadable"],
  ["document_expired", "Document expired"],
  ["document_invalid", "Document appears invalid"],
  ["selfie_mismatch", "Selfie does not match ID"],
  ["challenge_missing", "Challenge code missing"],
  ["challenge_unreadable", "Challenge code unreadable"],
  ["suspected_tampering", "Suspected tampering"],
  ["missing_document_side", "Required document side missing"],
  ["other", "Other"],
] as const;

type ManualMetadata = {
  manual?: {
    challengeCode?: string;
    documentType?: string;
    documentCountry?: string;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    decision?: string | null;
    rejectionCode?: string | null;
    rejectionReason?: string | null;
    approvalCriteria?: string[];
    files?: Record<string, { path?: string; mimeType?: string; uploadedAt?: string }>;
  };
};

type Verification = {
  id: string;
  user_id: string;
  status: string;
  last_error: string | null;
  metadata: ManualMetadata | null;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  user_email: string | null;
};

type ReviewPayload = {
  decision: "approve" | "reject";
  criteria?: string[];
  rejectionCode?: string;
  reason?: string;
};

export default function ManualVerificationAdminPage() {
  const [rows, setRows] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/verification/manual", { credentials: "include", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not load manual identity reviews.");
      setRows(data.verifications ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load manual identity reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function review(id: string, payload: ReviewPayload) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verification/${id}/manual-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Review action failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review action failed.");
    } finally {
      setBusyId(null);
    }
  }

  const pending = rows.filter((row) => row.status === "pending");
  const history = rows.filter((row) => row.status !== "pending");

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Identity Review" description="Review identity evidence using required, auditable criteria before approving or requesting resubmission." />

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-base">Pending review ({pending.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div> : pending.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No identity verifications are waiting.</div> : pending.map((row) => <ReviewCard key={row.id} row={row} busy={busyId === row.id} onReview={review} />)}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="font-display text-base">Recent decisions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {history.slice(0, 20).map((row) => {
              const manual = row.metadata?.manual;
              return (
                <div key={row.id} className="flex flex-col justify-between gap-2 rounded-lg border p-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="font-medium">{row.user_name || "Provider"}</div>
                    <div className="text-xs text-muted-foreground">{row.user_email || row.user_id}</div>
                    {manual?.rejectionCode && <div className="mt-1 text-xs text-rose-700">Reason: {manual.rejectionCode.replaceAll("_", " ")}</div>}
                  </div>
                  <div className="text-right">
                    <Badge variant={row.status === "verified" ? "default" : "destructive"}>{row.status === "verified" ? "Verified" : "Needs resubmission"}</Badge>
                    <div className="mt-1 text-xs text-muted-foreground">{manual?.reviewedAt ? new Date(manual.reviewedAt).toLocaleString() : new Date(row.updated_at).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReviewCard({ row, busy, onReview }: { row: Verification; busy: boolean; onReview: (id: string, payload: ReviewPayload) => Promise<void> }) {
  const manual = row.metadata?.manual;
  const hasBack = Boolean(manual?.files?.id_back?.path);
  const [criteria, setCriteria] = useState<Record<string, boolean>>({});
  const [rejectionCode, setRejectionCode] = useState("");
  const [reason, setReason] = useState("");

  const allApproved = useMemo(() => APPROVAL_CRITERIA.every(([value]) => criteria[value]), [criteria]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-slate-700" /><h2 className="font-semibold text-slate-900">{row.user_name || "Unnamed provider"}</h2></div>
          <div className="mt-1 text-sm text-slate-500">{row.user_email || row.user_id}</div>
          <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3"><div><strong>Document:</strong> {manual?.documentType?.replaceAll("_", " ") || "Unknown"}</div><div><strong>Country:</strong> {manual?.documentCountry || "US"}</div><div><strong>Challenge:</strong> <span className="font-mono font-bold">{manual?.challengeCode || "—"}</span></div></div>
        </div>
        <Badge variant="secondary">Pending review</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DocumentLink id={row.id} kind="id_front" label="Open ID front" />
        {hasBack ? <DocumentLink id={row.id} kind="id_back" label="Open ID back" /> : <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">No ID back required</div>}
        <DocumentLink id={row.id} kind="selfie" label="Open challenge selfie" />
      </div>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" />Identity approval confirms only identity evidence reviewed by MasseurMatch. It does not verify professional licensing, background history, qualifications, or services.</div>

      <div className="mt-5 rounded-xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900">Required approval checklist</div>
        <div className="mt-3 space-y-2">
          {APPROVAL_CRITERIA.map(([value, label]) => (
            <label key={value} className="flex items-start gap-3 text-sm text-slate-700">
              <input type="checkbox" className="mt-1" checked={Boolean(criteria[value])} onChange={(e) => setCriteria((prev) => ({ ...prev, [value]: e.target.checked }))} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={() => void onReview(row.id, { decision: "approve", criteria: APPROVAL_CRITERIA.map(([value]) => value) })} disabled={busy || !allApproved}><CheckCircle2 className="mr-2 h-4 w-4" />Approve identity</Button>
      </div>

      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/40 p-4">
        <div className="text-sm font-semibold text-rose-900">Request resubmission</div>
        <select value={rejectionCode} onChange={(e) => setRejectionCode(e.target.value)} className="mt-3 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm">
          <option value="">Select reason</option>
          {REJECTION_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <textarea value={reason} onChange={(e) => setReason(e.target.value.slice(0, 500))} placeholder="Optional note to provider. Required only for Other." className="mt-3 min-h-20 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm" />
        <Button variant="destructive" className="mt-3" onClick={() => void onReview(row.id, { decision: "reject", rejectionCode, reason })} disabled={busy || !rejectionCode || (rejectionCode === "other" && !reason.trim())}><XCircle className="mr-2 h-4 w-4" />Reject / resubmit</Button>
      </div>

      {busy && <div className="mt-4 flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving decision...</div>}
    </div>
  );
}

function DocumentLink({ id, kind, label }: { id: string; kind: "id_front" | "id_back" | "selfie"; label: string }) {
  return <a href={`/api/admin/verification/${id}/manual-document?kind=${kind}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"><ExternalLink className="h-4 w-4" />{label}</a>;
}
