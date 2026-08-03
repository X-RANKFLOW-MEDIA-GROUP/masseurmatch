"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Mail, Search, Send, Users } from "lucide-react";

type Recipient = {
  userId: string;
  profileId: string;
  name: string;
  email: string;
  city: string | null;
  status: string | null;
};

type SendResult = {
  success: boolean;
  sent: number;
  failed: number;
  results?: Array<{ email: string; success: boolean; error?: string }>;
  error?: string;
};

const defaultHtml = `<p>Hi {{name}},</p>
<p>We are reaching out from MasseurMatch with an important profile update.</p>
<p><a href="https://masseurmatch.com/pro/dashboard">Open your dashboard</a></p>
<p>Best,<br />MasseurMatch Support</p>`;

export default function AdminEmailComposer() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState(defaultHtml);
  const [from, setFrom] = useState("MasseurMatch Support <support@masseurmatch.com>");
  const [replyTo, setReplyTo] = useState("support@masseurmatch.com");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/emails/recipients", { credentials: "include" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load recipients");
        if (active) setRecipients(body.recipients || []);
      })
      .catch((error) => {
        if (active) setResult({ success: false, sent: 0, failed: 0, error: error.message });
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return recipients;
    return recipients.filter((recipient) =>
      [recipient.name, recipient.email, recipient.city || "", recipient.status || ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, recipients]);

  const toggleRecipient = (email: string) => {
    setSelected((current) =>
      current.includes(email) ? current.filter((item) => item !== email) : [...current, email],
    );
  };

  const selectVisible = () => {
    const visibleEmails = filtered.map((recipient) => recipient.email);
    setSelected((current) => Array.from(new Set([...current, ...visibleEmails])));
  };

  const sendEmails = async () => {
    setSending(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/emails/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: selected, subject, html, from, replyTo }),
      });
      const body = (await response.json()) as SendResult;
      if (!response.ok) throw new Error(body.error || "Email send failed");
      setResult(body);
    } catch (error) {
      setResult({
        success: false,
        sent: 0,
        failed: selected.length,
        error: error instanceof Error ? error.message : "Email send failed",
      });
    } finally {
      setSending(false);
    }
  };

  const canSend = selected.length > 0 && subject.trim().length > 0 && html.trim().length > 0 && !sending;

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Recipients</h2>
              <p className="text-sm text-muted-foreground">{selected.length} selected</p>
            </div>
            <button type="button" onClick={selectVisible} className="text-sm font-medium text-brand-secondary hover:underline">
              Select visible
            </button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, city..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-secondary"
            />
          </div>
        </div>
        <div className="max-h-[650px] overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading recipients
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No recipients found.</div>
          ) : (
            filtered.map((recipient) => (
              <label key={recipient.email} className="flex cursor-pointer gap-3 rounded-xl p-3 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selected.includes(recipient.email)}
                  onChange={() => toggleRecipient(recipient.email)}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-900">{recipient.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{recipient.email}</span>
                  <span className="block text-xs text-slate-400">{recipient.city || "No city"} · {recipient.status || "Unknown status"}</span>
                </span>
              </label>
            ))
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-brand-secondary/10 p-2.5 text-brand-secondary"><Mail className="h-5 w-5" /></div>
            <div>
              <h2 className="font-semibold text-slate-900">Compose email</h2>
              <p className="text-sm text-muted-foreground">Messages are sent individually through Resend.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium text-slate-700">
              From
              <input value={from} onChange={(event) => setFrom(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-brand-secondary" />
            </label>
            <label className="space-y-1.5 text-sm font-medium text-slate-700">
              Reply-to
              <input value={replyTo} onChange={(event) => setReplyTo(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-brand-secondary" />
            </label>
          </div>

          <label className="mt-4 block space-y-1.5 text-sm font-medium text-slate-700">
            Subject
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Email subject" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-brand-secondary" />
          </label>

          <label className="mt-4 block space-y-1.5 text-sm font-medium text-slate-700">
            HTML content
            <textarea value={html} onChange={(event) => setHtml(event.target.value)} rows={14} className="w-full rounded-xl border border-slate-200 px-3 py-3 font-mono text-sm font-normal outline-none focus:border-brand-secondary" />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">Available variable: <code>{"{{name}}"}</code></p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /> {selected.length} recipient(s)</div>
            <button
              type="button"
              disabled={!canSend}
              onClick={sendEmails}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send email{selected.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Preview</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="border-b border-slate-200 bg-white px-5 py-3 text-sm"><strong>Subject:</strong> {subject || "No subject"}</div>
            <div className="bg-white p-6 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: html.replaceAll("{{name}}", "Bruno") }} />
          </div>
        </div>

        {result ? (
          <div className={`rounded-2xl border p-5 ${result.success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`mt-0.5 h-5 w-5 ${result.success ? "text-emerald-600" : "text-red-600"}`} />
              <div>
                <p className="font-semibold text-slate-900">{result.success ? "Send completed" : "Send failed"}</p>
                <p className="text-sm text-slate-700">Sent: {result.sent} · Failed: {result.failed}</p>
                {result.error ? <p className="mt-1 text-sm text-red-700">{result.error}</p> : null}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
