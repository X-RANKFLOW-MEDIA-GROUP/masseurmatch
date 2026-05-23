"use client";

import { ShieldCheck, FileCheck, CheckCircle2 } from "lucide-react";

export default function TrustAndVerificationPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 pb-32 md:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium tracking-tight text-slate-900">
          Trust &amp; Verification
        </h1>
        <p className="mt-2 font-sans text-slate-500">
          Verified profiles receive up to 70% more bookings from premium clients.
        </p>
      </div>

      {/* Current status */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-emerald-900">
              Your identity is Verified
            </h3>
            <p className="font-sans text-sm text-emerald-700">
              Your blue badge is active on your public profile.
            </p>
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="rounded-full bg-emerald-600 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-white">
            Active
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Identity verification */}
        <div className="relative flex flex-col items-center gap-4 overflow-hidden border border-slate-200/60 bg-white p-6 text-center shadow-sm">
          <div className="absolute left-0 top-0 h-1 w-full bg-emerald-500" />
          <CheckCircle2 className="mt-2 h-8 w-8 text-emerald-500" />
          <div>
            <h4 className="font-display text-lg font-medium text-slate-900">
              Identity Verification (Stripe)
            </h4>
            <p className="mt-1 font-sans text-sm text-slate-500">
              Passport or Driver&apos;s License successfully validated by our security AI.
            </p>
          </div>
        </div>

        {/* Professional license (pending) */}
        <div className="group relative flex cursor-pointer flex-col items-center gap-4 overflow-hidden border border-slate-200/60 bg-white p-6 text-center shadow-sm transition-colors hover:border-slate-400">
          <div className="absolute left-0 top-0 h-1 w-full bg-amber-400" />
          <FileCheck className="mt-2 h-8 w-8 text-amber-500" />
          <div>
            <h4 className="font-display text-lg font-medium text-slate-900">
              Professional License
            </h4>
            <p className="mt-1 font-sans text-sm text-slate-500">
              File under review. Please allow 24-48 hours for manual validation.
            </p>
          </div>
          <button className="mt-2 bg-slate-100 px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-900 transition-colors hover:bg-slate-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
