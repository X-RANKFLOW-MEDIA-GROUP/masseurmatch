"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  therapistId: string;
  therapistName: string;
  compact?: boolean;
}

export function ReportTraffickingButton({ therapistId, therapistName, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    details: "",
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/safety/trafficking-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId,
          therapistName,
          reporterName: form.reporterName.trim(),
          reporterEmail: form.reporterEmail.trim(),
          reporterPhone: form.reporterPhone.trim() || null,
          details: form.details.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Could not submit report.");
      }

      setSuccess("Report sent to our internal safety inbox. If there is immediate danger, call 911 now.");
      setForm({
        reporterName: "",
        reporterEmail: "",
        reporterPhone: "",
        details: "",
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "w-full" : ""}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex w-full items-center justify-center rounded-full border border-red-300/50 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-500/20"
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Report Suspected Trafficking
      </button>

      {open ? (
        <div className="mt-3 rounded-2xl border border-red-200/40 bg-white/95 p-4 text-left shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">Safety escalation</p>
          <p className="mt-2 text-sm text-slate-700">
            This report goes to the internal safety inbox for immediate review. If someone is in immediate danger,
            call <strong>911</strong>.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            <li>National Human Trafficking Hotline: <strong>1-888-373-7888</strong></li>
            <li>ICE HSI Tip Line: <strong>1-866-347-2423</strong></li>
          </ul>

          <form onSubmit={submit} className="mt-4 space-y-3">
            <input
              required
              value={form.reporterName}
              onChange={(event) => setForm((prev) => ({ ...prev, reporterName: event.target.value }))}
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <input
              required
              type="email"
              value={form.reporterEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, reporterEmail: event.target.value }))}
              placeholder="Your email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <input
              value={form.reporterPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, reporterPhone: event.target.value }))}
              placeholder="Your phone (optional)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <textarea
              required
              minLength={20}
              rows={4}
              value={form.details}
              onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
              placeholder="Describe what you observed (messages, behavior, coercion indicators, dates, locations)."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit report
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
