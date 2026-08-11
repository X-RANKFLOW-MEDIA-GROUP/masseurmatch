"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { LicenseUpload } from "@/components/pro/LicenseUpload";

type IdentityStatus =
  | "not_started"
  | "pending"
  | "processing"
  | "requires_input"
  | "failed"
  | "canceled"
  | "verified";

interface IdentityVerification {
  status: IdentityStatus;
  provider?: string | null;
  lastError?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  verifiedAt?: string | null;
}

interface VerificationData {
  identity: IdentityVerification;
  text: { status: string };
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function TrustAndVerificationPage() {
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [hasLicense, setHasLicense] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadVerification = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    setPageError(null);
    try {
      const [vRes, dRes] = await Promise.all([
        fetch("/api/provider/verification", { cache: "no-store" }),
        fetch("/api/provider/identity-documents", { cache: "no-store" }),
      ]);
      if (!vRes.ok) throw new Error("Unable to load your identity verification status.");
      const v = await vRes.json();
      setVerification({ identity: v.identity, text: v.text });
      if (dRes.ok) {
        const d = await dRes.json();
        const docs = (d.documents ?? []) as Array<{ type: string }>;
        setHasLicense(docs.some((doc) => doc.type === "professional_license"));
      }
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to load verification status.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadVerification();
  }, [loadVerification]);

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>;
  }

  const identity = verification?.identity ?? { status: "not_started" as IdentityStatus };
  const isVerified = identity.status === "verified";
  const isPending = identity.status === "pending" || identity.status === "processing";
  const needsAction = ["requires_input", "failed", "canceled"].includes(identity.status);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 pb-32 md:p-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-slate-900">Trust &amp; Verification</h1>
          <p className="mt-2 font-sans text-slate-500">Check your identity status and complete any action required to keep your trust badge current.</p>
        </div>
        <button type="button" onClick={() => void loadVerification(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh Status
        </button>
      </div>

      {pageError && <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{pageError}</span></div>}

      {isVerified ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100"><ShieldCheck className="h-6 w-6 text-emerald-600" /></div><div><h3 className="font-sans font-semibold text-emerald-900">Identity Verified</h3><p className="font-sans text-sm text-emerald-700">Your identity evidence was reviewed and your verified identity status is active.</p></div></div>
          <span className="hidden rounded-full bg-emerald-600 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-white sm:block">Verified</span>
        </div>
      ) : needsAction ? (
        <div className="flex items-start gap-4 rounded-xl border border-rose-200 bg-rose-50 p-6"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100"><AlertCircle className="h-6 w-6 text-rose-600" /></div><div><h3 className="font-sans font-semibold text-rose-900">Identity Verification Needs Attention</h3><p className="font-sans text-sm text-rose-700">Your previous identity check needs a new submission. Review the status below and retry when ready.</p></div></div>
      ) : (
        <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100"><ShieldCheck className="h-6 w-6 text-amber-600" /></div><div><h3 className="font-sans font-semibold text-amber-900">{isPending ? "Identity Verification in Review" : "Identity Verification Required"}</h3><p className="font-sans text-sm text-amber-700">{isPending ? "Your identity evidence is waiting for human review. We will email you after a decision." : "Complete identity verification to establish your verified identity status."}</p></div></div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <IdentityCard identity={identity} onRefresh={() => loadVerification(true)} />
        <LicenseCard hasLicense={hasLicense ?? false} onUploaded={() => setHasLicense(true)} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><strong className="text-slate-800">Privacy:</strong>{" "}government ID and challenge-selfie images are stored privately for review and deleted after the final decision. The Identity Verified badge confirms identity only and does not verify licensing, background, qualifications, or services.</div>
    </div>
  );
}

function IdentityCard({ identity, onRefresh }: { identity: IdentityVerification; onRefresh: () => Promise<void> }) {
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const status = identity.status;
  const verified = status === "verified";
  const pending = status === "pending" || status === "processing";
  const requiresInput = status === "requires_input";
  const failed = status === "failed";
  const canceled = status === "canceled";
  const canStart = !verified && !pending;

  const statusCopy: Record<IdentityStatus, { label: string; description: string }> = {
    verified: { label: "Verified", description: "MasseurMatch reviewed your government-issued ID and challenge selfie." },
    pending: { label: "Pending Review", description: "Your identity evidence is waiting for a human reviewer." },
    processing: { label: "Pending Review", description: "Your identity evidence is waiting for a human reviewer." },
    requires_input: { label: "Resubmission Required", description: "The reviewer could not approve the previous evidence. Submit a new attempt below." },
    failed: { label: "Verification Failed", description: "Your previous identity verification could not be completed. You can submit a new attempt below." },
    canceled: { label: "Verification Canceled", description: "The previous verification attempt was canceled. Start a new verification to continue." },
    not_started: { label: "Not Started", description: "Submit a government-issued ID and current challenge selfie for identity review." },
  };

  async function startVerification() {
    setStarting(true);
    setActionError(null);
    try {
      const res = await fetch("/api/provider/verification/identity/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Unable to start identity verification.");
      if (!data.url) throw new Error("Identity verification did not return a secure upload page. Please try again.");
      window.location.assign(data.url);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to start identity verification.");
      setStarting(false);
    }
  }

  const updatedAt = formatDate(identity.updatedAt);
  const verifiedAt = formatDate(identity.verifiedAt);
  const barColor = verified ? "bg-emerald-500" : pending ? "bg-amber-400" : requiresInput || failed || canceled ? "bg-rose-500" : "bg-slate-300";

  return (
    <div className="relative flex flex-col gap-5 overflow-hidden border border-slate-200/60 bg-white p-6 shadow-sm">
      <div className={`absolute left-0 top-0 h-1 w-full ${barColor}`} />
      <div className="flex items-start gap-3">
        {verified ? <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-emerald-500" /> : pending ? <Clock className="mt-0.5 h-8 w-8 shrink-0 text-amber-500" /> : canceled ? <XCircle className="mt-0.5 h-8 w-8 shrink-0 text-rose-500" /> : <AlertCircle className={`mt-0.5 h-8 w-8 shrink-0 ${requiresInput || failed ? "text-rose-500" : "text-slate-400"}`} />}
        <div><h4 className="font-display text-lg font-medium text-slate-900">Identity Verification</h4><div className="mt-1 font-mono text-xs font-semibold uppercase tracking-wider text-slate-700">{statusCopy[status].label}</div><p className="mt-2 font-sans text-sm leading-relaxed text-slate-500">{statusCopy[status].description}</p></div>
      </div>

      {identity.lastError && !verified && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-left"><div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-rose-700">Review note</div><p className="mt-1 break-words text-sm text-rose-800">{identity.lastError}</p></div>}
      {(updatedAt || verifiedAt) && <div className="border-t border-slate-100 pt-3 text-xs text-slate-400">{verifiedAt ? `Verified ${verifiedAt}` : updatedAt ? `Last updated ${updatedAt}` : null}</div>}
      {actionError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{actionError}</div>}

      <div className="flex flex-wrap gap-2">
        {canStart && <button type="button" onClick={startVerification} disabled={starting} className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-slate-700 disabled:opacity-60">{starting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}{status === "not_started" ? "Start Verification" : "Retry Verification"}</button>}
        {pending && <button type="button" onClick={() => void onRefresh()} className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"><RefreshCw className="h-3 w-3" /> Check Status</button>}
      </div>
      {!verified && <p className="text-xs leading-relaxed text-slate-400">A new attempt creates a fresh one-time challenge. Previously active attempt files are securely removed before the new challenge is created.</p>}
    </div>
  );
}

function LicenseCard({ hasLicense, onUploaded }: { hasLicense: boolean; onUploaded: () => void }) {
  const barColor = hasLicense ? "bg-amber-400" : "bg-slate-200";
  return (
    <div className="relative flex flex-col gap-4 overflow-hidden border border-slate-200/60 bg-white p-6 shadow-sm">
      <div className={`absolute left-0 top-0 h-1 w-full ${barColor}`} />
      <div className="flex items-center gap-3"><FileCheck className={`h-6 w-6 ${hasLicense ? "text-amber-500" : "text-slate-400"}`} /><h4 className="font-display text-lg font-medium text-slate-900">Professional Document</h4></div>
      <p className="font-sans text-sm text-slate-500">{hasLicense ? "Your optional professional document is under review." : "You may upload a professional license or certification document as optional profile information. MasseurMatch does not independently verify professional licensing."}</p>
      {hasLicense ? <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"><Clock className="h-4 w-4 shrink-0 text-amber-500" />Under review</div> : <LicenseUpload onSuccess={onUploaded} />}
    </div>
  );
}
