"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, Upload } from "lucide-react";

const DOCUMENT_TYPES = [
  ["drivers_license", "Driver's license"],
  ["passport", "Passport"],
  ["state_id", "State ID"],
  ["military_id", "Military ID"],
] as const;

type UploadKind = "id_front" | "id_back" | "selfie";

export default function ManualIdentityVerificationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div>}>
      <ManualIdentityVerificationContent />
    </Suspense>
  );
}

function ManualIdentityVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("verificationId") ?? "";
  const [challengeCode, setChallengeCode] = useState("");
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [documentType, setDocumentType] = useState("drivers_license");
  const [documentCountry, setDocumentCountry] = useState("US");
  const [files, setFiles] = useState<Partial<Record<UploadKind, File>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!verificationId) {
      setChallengeLoading(false);
      return;
    }

    let active = true;
    void (async () => {
      try {
        const res = await fetch(`/api/provider/verification/identity/manual/start?verificationId=${encodeURIComponent(verificationId)}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Verification challenge unavailable.");
        if (active) setChallengeCode(data.challengeCode ?? "");
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Verification challenge unavailable.");
      } finally {
        if (active) setChallengeLoading(false);
      }
    })();

    return () => { active = false; };
  }, [verificationId]);

  const needsBack = documentType !== "passport";
  const ready = useMemo(
    () => Boolean(verificationId && challengeCode && files.id_front && files.selfie && (!needsBack || files.id_back)),
    [challengeCode, files, needsBack, verificationId],
  );

  async function upload(kind: UploadKind, file: File) {
    const form = new FormData();
    form.set("verificationId", verificationId);
    form.set("kind", kind);
    form.set("file", file);
    const res = await fetch("/api/provider/verification/identity/manual/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Could not upload ${kind}.`);
  }

  async function submit() {
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      await upload("id_front", files.id_front!);
      if (needsBack && files.id_back) await upload("id_back", files.id_back);
      await upload("selfie", files.selfie!);

      const res = await fetch("/api/provider/verification/identity/manual/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId, documentType, documentCountry }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not submit identity verification.");
      setComplete(true);
      window.setTimeout(() => router.replace("/pro/trust"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit identity verification.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!verificationId || (!challengeLoading && !challengeCode)) {
    return (
      <div className="mx-auto max-w-2xl p-6 md:p-10">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <div className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5" /><div><h1 className="font-semibold">Verification session unavailable</h1><p className="mt-1 text-sm">{error || "Return to Trust & Verification and start identity verification again."}</p></div></div>
        </div>
      </div>
    );
  }

  if (challengeLoading) {
    return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 pb-24 md:p-10">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600"><ShieldCheck className="h-3.5 w-3.5" /> Secure identity review</div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-slate-900">Verify your identity</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">Submit a government-issued ID and a current selfie with the one-time challenge code below. Documents are stored privately and removed after the review decision.</p>
      </div>

      {complete ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <div className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6" /><div><h2 className="font-semibold">Submitted for review</h2><p className="mt-1 text-sm text-emerald-700">Your identity verification is now pending admin review.</p></div></div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">One-time selfie challenge</div>
            <div className="mt-2 font-mono text-4xl font-bold tracking-[0.18em] text-amber-950">{challengeCode}</div>
            <p className="mt-3 text-sm leading-relaxed text-amber-800">Write this six-digit code on paper and hold it next to your face in the selfie. Your face and the full code must be clearly visible. The challenge expires after 30 minutes.</p>
          </div>

          <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">Document type
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                {DOCUMENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Issuing country
              <input value={documentCountry} onChange={(e) => setDocumentCountry(e.target.value.toUpperCase().slice(0, 2))} placeholder="US" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-slate-400" />
            </label>
          </div>

          <div className="space-y-4">
            <FilePicker label="Government ID — front" required file={files.id_front} onChange={(file) => setFiles((prev) => ({ ...prev, id_front: file }))} />
            {needsBack && <FilePicker label="Government ID — back" required file={files.id_back} onChange={(file) => setFiles((prev) => ({ ...prev, id_back: file }))} />}
            <FilePicker label="Current selfie with challenge code" required accept="image/jpeg,image/png,image/webp" file={files.selfie} onChange={(file) => setFiles((prev) => ({ ...prev, selfie: file }))} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">Identity verification confirms only that MasseurMatch reviewed a government-issued identity document and a current selfie. It does not verify professional licensing, background history, qualifications, or services.</div>

          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}

          <button type="button" onClick={() => void submit()} disabled={!ready || submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {submitting ? "Uploading securely..." : "Submit for identity review"}
          </button>
        </>
      )}
    </div>
  );
}

function FilePicker({ label, required, accept = "image/jpeg,image/png,image/webp,application/pdf", file, onChange }: { label: string; required?: boolean; accept?: string; file?: File; onChange: (file: File) => void }) {
  return (
    <label className="block cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white p-5 transition hover:border-slate-400 hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"><Upload className="h-5 w-5 text-slate-600" /></div>
        <div className="min-w-0"><div className="text-sm font-semibold text-slate-800">{label}{required ? " *" : ""}</div><div className="mt-0.5 truncate text-xs text-slate-500">{file ? file.name : "JPEG, PNG, WebP or PDF · max 10 MB"}</div></div>
      </div>
      <input type="file" accept={accept} className="sr-only" onChange={(e) => { const next = e.target.files?.[0]; if (next) onChange(next); }} />
    </label>
  );
}
