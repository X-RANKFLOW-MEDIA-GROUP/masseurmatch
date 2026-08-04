"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type Recipient = {
  userId: string;
  profileId: string;
  name: string;
  email: string;
  city: string | null;
  state: string | null;
  profileStatus: string | null;
  plan: string | null;
  marketingOptIn: boolean;
  suppressed: boolean;
};

type Template = {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  sendCategory: "marketing" | "transactional";
  fromAddress: string | null;
  replyTo: string | null;
};

type Campaign = {
  id: string;
  name: string;
  subject: string;
  sendCategory: string;
  scheduledFor: string;
  status: string;
  createdAt: string;
  total: number;
  queued: number;
  processing: number;
  sent: number;
  suppressed: number;
  failed: number;
};

type Snapshot = {
  recipients: Recipient[];
  templates: Template[];
  campaigns: Campaign[];
  summary: { sent30d: number; failed30d: number; suppressed30d: number; complaints30d: number };
};

const DEFAULT_HTML = `<p>Hi {{name}},</p>
<p>We have an update for your MasseurMatch profile.</p>
<p><a href="https://www.masseurmatch.com/pro/dashboard">Open your dashboard</a></p>
<p>Best,<br />MasseurMatch</p>`;

const EMPTY_SNAPSHOT: Snapshot = {
  recipients: [],
  templates: [],
  campaigns: [],
  summary: { sent30d: 0, failed30d: 0, suppressed30d: 0, complaints30d: 0 },
};

async function api<T>(options: RequestInit = {}, query = ""): Promise<T> {
  const response = await fetch(`/api/admin/emails${query}`, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Email Center request failed.");
  return body as T;
}

function unique(values: Array<string | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort();
}

export default function AdminEmailCenter() {
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_HTML);
  const [bodyText, setBodyText] = useState("");
  const [sendCategory, setSendCategory] = useState<"marketing" | "transactional">("marketing");
  const [fromAddress, setFromAddress] = useState("MasseurMatch Updates <updates@updates.masseurmatch.com>");
  const [replyTo, setReplyTo] = useState("support@masseurmatch.com");
  const [scheduledFor, setScheduledFor] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const load = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const data = await api<{ ok: true } & Snapshot>({}, search ? `?q=${encodeURIComponent(search)}` : "");
      setSnapshot({
        recipients: data.recipients || [],
        templates: data.templates || [],
        campaigns: data.campaigns || [],
        summary: data.summary || EMPTY_SNAPSHOT.summary,
      });
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Unable to load Email Center." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const recipients = useMemo(() => {
    return snapshot.recipients.filter((recipient) => {
      if (profileStatus && recipient.profileStatus !== profileStatus) return false;
      if (plan && recipient.plan !== plan) return false;
      if (city && recipient.city !== city) return false;
      if (state && recipient.state !== state) return false;
      return true;
    });
  }, [snapshot.recipients, profileStatus, plan, city, state]);

  const selectedRecipients = useMemo(
    () => snapshot.recipients.filter((recipient) => selected.includes(recipient.userId)),
    [snapshot.recipients, selected],
  );
  const blockedSelected = selectedRecipients.filter((recipient) => recipient.suppressed || !recipient.marketingOptIn).length;
  const statuses = unique(snapshot.recipients.map((recipient) => recipient.profileStatus));
  const plans = unique(snapshot.recipients.map((recipient) => recipient.plan));
  const cities = unique(snapshot.recipients.map((recipient) => recipient.city));
  const states = unique(snapshot.recipients.map((recipient) => recipient.state));

  const toggle = (userId: string) => {
    setSelected((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const selectVisible = () => {
    setSelected((current) => Array.from(new Set([...current, ...recipients.map((recipient) => recipient.userId)])));
  };

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const template = snapshot.templates.find((item) => item.id === id);
    if (!template) return;
    setSubject(template.subject);
    setBodyHtml(template.bodyHtml);
    setBodyText(template.bodyText || "");
    setSendCategory(template.sendCategory);
    setFromAddress(template.fromAddress || fromAddress);
    setReplyTo(template.replyTo || replyTo);
  };

  const saveTemplate = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const data = await api<{ ok: true; templateId: string }>({
        method: "POST",
        body: JSON.stringify({
          action: "save_template",
          id: templateId || null,
          name: campaignName || subject || "Email template",
          description: "Saved from the Admin Email Center",
          subject,
          bodyHtml,
          bodyText: bodyText || null,
          sendCategory,
          fromAddress,
          replyTo,
        }),
      });
      setTemplateId(data.templateId);
      setNotice({ ok: true, text: "Template saved." });
      await load(query);
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Template save failed." });
    } finally {
      setSaving(false);
    }
  };

  const createCampaign = async () => {
    setSending(true);
    setNotice(null);
    try {
      const data = await api<{ campaign: { total: number; queued: number; suppressed: number } }>({
        method: "POST",
        body: JSON.stringify({
          action: "create_campaign",
          name: campaignName,
          subject,
          bodyHtml,
          bodyText: bodyText || null,
          sendCategory,
          fromAddress,
          replyTo,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
          templateId: templateId || null,
          userIds: selected,
          profileStatuses: profileStatus ? [profileStatus] : [],
          plans: plan ? [plan] : [],
          cities: city ? [city] : [],
          states: state ? [state] : [],
        }),
      });
      setNotice({
        ok: true,
        text: `Campaign created: ${data.campaign.queued} queued, ${data.campaign.suppressed} suppressed, ${data.campaign.total} matched.`,
      });
      setSelected([]);
      await load(query);
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Campaign creation failed." });
    } finally {
      setSending(false);
    }
  };

  const cancelCampaign = async (campaignId: string) => {
    try {
      const data = await api<{ cancelled: number }>({
        method: "POST",
        body: JSON.stringify({ action: "cancel_campaign", campaignId }),
      });
      setNotice({ ok: true, text: `Campaign cancelled. ${data.cancelled} queued messages were stopped.` });
      await load(query);
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Campaign cancellation failed." });
    }
  };

  const hasAudience = sendCategory === "transactional"
    ? selected.length > 0
    : selected.length > 0 || Boolean(profileStatus || plan || city || state);
  const canSend = Boolean(campaignName.trim() && subject.trim() && bodyHtml.trim() && hasAudience && !sending);
  const previewHtml = bodyHtml.replaceAll("{{name}}", "Bruno").replaceAll("{{city}}", "Dallas");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Sent · 30 days" value={snapshot.summary.sent30d} icon={CheckCircle2} />
        <Metric label="Failed · 30 days" value={snapshot.summary.failed30d} icon={XCircle} />
        <Metric label="Suppressed · 30 days" value={snapshot.summary.suppressed30d} icon={ShieldCheck} />
        <Metric label="Complaints · 30 days" value={snapshot.summary.complaints30d} icon={AlertTriangle} />
      </div>

      {notice ? (
        <div className={`rounded-2xl border p-4 text-sm ${notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {notice.text}
        </div>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[390px_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Audience</h2>
                <p className="text-sm text-muted-foreground">{selected.length} explicitly selected</p>
              </div>
              <button type="button" onClick={selectVisible} className="text-sm font-semibold text-brand-secondary hover:underline">
                Select visible
              </button>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && void load(query)}
                placeholder="Search people..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-12 text-sm outline-none focus:border-brand-secondary"
              />
              <button type="button" onClick={() => void load(query)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Filter value={profileStatus} onChange={setProfileStatus} label="All statuses" values={statuses} />
              <Filter value={plan} onChange={setPlan} label="All plans" values={plans} />
              <Filter value={city} onChange={setCity} label="All cities" values={cities} />
              <Filter value={state} onChange={setState} label="All states" values={states} />
            </div>
          </div>
          <div className="max-h-[720px] overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading audience</div>
            ) : recipients.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No recipients match these filters.</div>
            ) : recipients.map((recipient) => (
              <label key={recipient.userId} className="flex cursor-pointer gap-3 rounded-xl p-3 hover:bg-slate-50">
                <input type="checkbox" checked={selected.includes(recipient.userId)} onChange={() => toggle(recipient.userId)} className="mt-1 h-4 w-4 rounded border-slate-300" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">{recipient.name}</span>
                    {recipient.suppressed || !recipient.marketingOptIn ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" /> : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{recipient.email}</span>
                  <span className="block text-xs text-slate-400">{recipient.city || "No city"} · {recipient.profileStatus || "draft"} · {recipient.plan || "free"}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-secondary/10 p-2.5 text-brand-secondary"><Mail className="h-5 w-5" /></div>
                <div><h2 className="font-semibold text-slate-900">Campaign composer</h2><p className="text-sm text-muted-foreground">Queued through the compliant lifecycle delivery system.</p></div>
              </div>
              <select value={templateId} onChange={(event) => applyTemplate(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">Start without template</option>
                {snapshot.templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Campaign name"><input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="August profile update" className="input" /></Field>
              <Field label="Category"><select value={sendCategory} onChange={(e) => setSendCategory(e.target.value as "marketing" | "transactional")} className="input"><option value="marketing">Marketing</option><option value="transactional">Transactional</option></select></Field>
              <Field label="From"><input value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} className="input" /></Field>
              <Field label="Reply-to"><input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className="input" /></Field>
            </div>
            <Field label="Subject"><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A quick update for {{name}}" className="input" /></Field>
            <Field label="HTML content"><textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} rows={13} className="input font-mono text-sm" /></Field>
            <Field label="Plain-text fallback"><textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={4} className="input" placeholder="Optional. The worker can derive a fallback when omitted." /></Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Schedule"><input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="input" /></Field>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Audience summary</p>
                <p>{selected.length} selected · {recipients.length} visible by filters</p>
                {selected.length > 0 ? <p className="mt-1 text-slate-500">Explicit selections override audience filters when sent.</p> : null}
                {blockedSelected > 0 ? <p className="mt-1 text-amber-700">{blockedSelected} selected contacts may be suppressed automatically.</p> : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Variables: <code>{"{{name}}"}</code> and <code>{"{{city}}"}</code>. Marketing sends enforce opt-out, cooldown, suppression and unsubscribe rules.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => void saveTemplate()} disabled={saving || !subject || !bodyHtml} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save template
                </button>
                <button type="button" onClick={() => void createCampaign()} disabled={!canSend} className="inline-flex items-center gap-2 rounded-xl bg-brand-secondary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : scheduledFor ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {scheduledFor ? "Schedule campaign" : "Queue campaign"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900">Preview</h2>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm"><strong>Subject:</strong> {(subject || "No subject").replaceAll("{{name}}", "Bruno").replaceAll("{{city}}", "Dallas")}</div>
              <iframe
                title="Email HTML preview"
                sandbox=""
                srcDoc={previewHtml}
                className="min-h-[360px] w-full bg-white"
              />
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3"><FileText className="h-5 w-5 text-brand-secondary" /><div><h2 className="font-semibold text-slate-900">Campaign history</h2><p className="text-sm text-muted-foreground">Live queue totals from the lifecycle email system.</p></div></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Campaign</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Scheduled</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Queued</th><th className="px-3 py-3">Sent</th><th className="px-3 py-3">Suppressed</th><th className="px-3 py-3">Failed</th><th className="px-3 py-3">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {snapshot.campaigns.length === 0 ? <tr><td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">No campaigns yet.</td></tr> : snapshot.campaigns.map((campaign) => (
                <tr key={campaign.id}><td className="px-3 py-4"><p className="font-semibold text-slate-900">{campaign.name}</p><p className="max-w-xs truncate text-xs text-muted-foreground">{campaign.subject}</p></td><td className="px-3 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">{campaign.status}</span></td><td className="px-3 py-4 text-slate-600">{new Date(campaign.scheduledFor).toLocaleString()}</td><td className="px-3 py-4">{campaign.total}</td><td className="px-3 py-4">{campaign.queued + campaign.processing}</td><td className="px-3 py-4 text-emerald-700">{campaign.sent}</td><td className="px-3 py-4 text-amber-700">{campaign.suppressed}</td><td className="px-3 py-4 text-red-700">{campaign.failed}</td><td className="px-3 py-4">{["scheduled", "processing"].includes(campaign.status) && campaign.queued > 0 ? <button type="button" onClick={() => void cancelCampaign(campaign.id)} className="text-xs font-semibold text-red-700 hover:underline">Cancel queued</button> : <span className="text-xs text-slate-400">—</span>}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        :global(.input) { width: 100%; border-radius: 0.75rem; border: 1px solid rgb(226 232 240); padding: 0.625rem 0.75rem; font-weight: 400; outline: none; }
        :global(.input:focus) { border-color: var(--brand-secondary, #8b1e2d); }
      `}</style>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Mail }) {
  return <div className="rounded-2xl border border-border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></div><div className="rounded-xl bg-slate-100 p-2.5 text-slate-600"><Icon className="h-5 w-5" /></div></div></div>;
}

function Filter({ value, onChange, label, values }: { value: string; onChange: (value: string) => void; label: string; values: string[] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs"><option value="">{label}</option>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block space-y-1.5 text-sm font-medium text-slate-700"><span>{label}</span>{children}</label>;
}
