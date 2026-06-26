"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck, FileCheck, CheckCircle2, Clock, AlertCircle, Loader2, ExternalLink,
} from "lucide-react";
import { LicenseUpload } from "@/components/pro/LicenseUpload";

interface VerificationData {
  identity: { status: string };
  text: { status: string };
}

export default function TrustAndVerificationPage() {
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [hasLicense, setHasLicense] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [vRes, dRes] = await Promise.all([
          fetch("/api/provider/verification"),
          fetch("/api/provider/identity-documents"),
        ]);
        if (vRes.ok) {
          const v = await vRes.json();
          setVerification({ identity: v.identity, text: v.text });
        }
        if (dRes.ok) {
          const d = await dRes.json();
          const docs = (d.documents ?? []) as Array<{ type: string }>;
          setHasLicense(docs.some((doc) => doc.type === "professional_license"));
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  const identityStatus = verification?.identity.status ?? "not_started";
  const isVerified = identityStatus === "verified";
  const isPending = identityStatus === "pending" || identityStatus === "processing";

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 pb-32 md:p-10">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-slate-900">
          Trust &amp; Verification
        </h1>
        <p className="mt-2 font-sans text-slate-500">
          Verified profiles receive up to 70% more bookings from premium clients.
        </p>
      </div>

      {/* Overall status banner */}
      {isVerified ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-emerald-900">Identity Verified</h3>
              <p className="font-sans text-sm text-emerald-700">
                Your badge is active on your public profile.
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-emerald-600 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-white sm:block">
            Active
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-amber-900">Verification incomplete</h3>
            <p className="font-sans text-sm text-amber-700">
              {isPending
                ? "Your identity check is in progress — usually completes within minutes."
                : "Complete identity verification to unlock your verified badge."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <IdentityCard status={identityStatus} />
        <LicenseCard
          hasLicense={hasLicense ?? false}
          onUploaded={() => setHasLicense(true)}
        />
      </div>
    </div>
  );
}

function IdentityCard({ status }: { status: string }) {
  const [starting, setStarting] = useState(false);
  const verified = status === "verified";
  const pending = status === "pending" || status === "processing";
  const failed = status === "failed" || status === "requires_input";

  async function startVerification() {
    setStarting(true);
    try {
      const res = await fetch("/api/stripe/identity/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setStarting(false);
    }
  }

  const barColor = verified ? "bg-emerald-500" : pending ? "bg-amber-400" : "bg-slate-200";

  return (
    <div className="relative flex flex-col items-center gap-4 overflow-hidden border border-slate-200/60 bg-white p-6 text-center shadow-sm">
      <div className={`absolute left-0 top-0 h-1 w-full ${barColor}`} />
      {verified ? (
        <CheckCircle2 className="mt-2 h-8 w-8 text-emerald-500" />
      ) : pending ? (
        <Clock className="mt-2 h-8 w-8 text-amber-500" />
      ) : (
        <AlertCircle className={`mt-2 h-8 w-8 ${failed ? "text-rose-400" : "text-slate-400"}`} />
      )}
      <div>
        <h4 className="font-display text-lg font-medium text-slate-900">
          Identity Verification
        </h4>
        <p className="mt-1 font-sans text-sm text-slate-500">
          {verified
            ? "Passport or Driver's License successfully validated by Stripe."
            : pending
            ? "Verification in progress — usually completes within a few minutes."
            : failed
            ? "Verification could not be completed. Please try again."
            : "Verify your government-issued ID to earn your trusted badge."}
        </p>
      </div>
      {!verified && !pending && (
        <button
          onClick={startVerification}
          disabled={starting}
          className="mt-2 flex items-center gap-2 bg-slate-900 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {starting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ExternalLink className="h-3 w-3" />
          )}
          {failed ? "Retry Verification" : "Start Verification"}
        </button>
      )}
    </div>
  );
}

function LicenseCard({
  hasLicense,
  onUploaded,
}: {
  hasLicense: boolean;
  onUploaded: () => void;
}) {
  const barColor = hasLicense ? "bg-amber-400" : "bg-slate-200";

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden border border-slate-200/60 bg-white p-6 shadow-sm">
      <div className={`absolute left-0 top-0 h-1 w-full ${barColor}`} />
      <div className="flex items-center gap-3">
        <FileCheck className={`h-6 w-6 ${hasLicense ? "text-amber-500" : "text-slate-400"}`} />
        <h4 className="font-display text-lg font-medium text-slate-900">Professional License</h4>
      </div>
      <p className="font-sans text-sm text-slate-500">
        {hasLicense
          ? "Your document is under review. Manual validation takes 24-48 hours."
          : "Upload your massage therapy license or certification to build additional client trust."}
      </p>
      {hasLicense ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <Clock className="h-4 w-4 shrink-0 text-amber-500" />
          Under review · allow 24-48 hours
        </div>
      ) : (
        <LicenseUpload onSuccess={onUploaded} />
      )}
    </div>
  );
}
