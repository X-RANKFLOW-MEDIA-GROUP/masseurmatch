"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  Eye,
  FileText,
  History,
  Loader2,
  Mail,
  PenLine,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
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

type AiDraft = {
  campaignName: string;
  subject: string;
  previewText: string;
  bodyHtml: string;
  bodyText: string;
  suggestedAudience: string;
  suggestedSchedule: string;
};

type WorkspaceTab = "compose" | "campaigns";
type ComposerTab = "edit" | "preview";

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
  const [generating, setGenerating] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("compose");
  const [composerTab, setComposerTab] = useState<ComposerTab>("edit");
  const [showAi, setShowAi] = useState(false);

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

  const [aiObjective, setAiObjective] = useState("");
  const [aiAudience, setAiAudience] = useState("MasseurMatch providers");
  const [aiTone, setAiTone] = useState<"professional" | "warm" | "concise" | "educational" | "promotional">("professional");
  const [aiCta, setAiCta] = useState("");
  const [aiOffer, setAiOffer] = useState("");
  const [aiMeta, setAiMeta] = useState<{ previewText: string; suggestedAudience: string; suggestedSchedule: string } | null>(null);

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
    setSelected((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]);
  };

  const selectVisible = () => {
    setSelected((current) => Array.from(new Set([...current, ...recipients.map((recipient) => recipient.userId)])));
  };

  const clearAudience = () => {
    setSelected([]);
    setProfileStatus("");
    setPlan("");
    setCity("");
    setState("");
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

  const generateWithAi = async () => {
    if (!aiObjective.trim()) return;
    setGenerating(true);
    setNotice(null);
    try {
      const data = await api<{ ok: true; draft: AiDraft }>({
        method: "POST",
        body: JSON.stringify({
          action: "ai_generate",
          objective: aiObjective,
          audience: aiAudience || "MasseurMatch providers",
          tone: aiTone,
          cta: aiCta || null,
          offer: aiOffer || null,
          category: sendCategory,
        }),
      });
      setCampaignName(data.draft.campaignName);
      setSubject(data.draft.subject);
      setBodyHtml(data.draft.bodyHtml);
      setBodyText(data.draft.bodyText);
      setAiMeta({
        previewText: data.draft.previewText,
        suggestedAudience: data.draft.suggestedAudience,
        suggestedSchedule: data.draft.suggestedSchedule,
      });
      setComposerTab("preview");
      setNotice({ ok: true, text: "AI draft generated. Review the content and audience before sending." });
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "AI generation failed." });
    } finally {
      setGenerating(false);
    }
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
      setWorkspaceTab("campaigns");
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
  const previewHtml = bodyHtml.replaceAll("{{name}}", "Provider").replaceAll("{{city}}", "your city");
  const activeFilters = [profileStatus, plan, city, state].filter(Boolean).length;

  return (
    <div className="space-y-5 pb-10">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Mail className="h-3.5 w-3.5" /> Communications
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Email Operations</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Create, target, schedule and monitor provider communications from one workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowAi((value) => !value)} className="enterprise-button enterprise-button-secondary">
            <Sparkles className="h-4 w-4" /> AI assist
          </button>
          <button type="button" onClick={() => { setWorkspaceTab("compose"); setComposerTab("edit"); }} className="enterprise-button enterprise-button-primary">
            <PenLine className="h-4 w-4" /> New campaign
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Sent" hint="Last 30 days" value={snapshot.summary.sent30d} icon={CheckCircle2} />
        <Metric label="Failed" hint="Last 30 days" value={snapshot.summary.failed30d} icon={XCircle} />
        <Metric label="Suppressed" hint="Protected contacts" value={snapshot.summary.suppressed30d} icon={ShieldCheck} />
        <Metric label="Complaints" hint="Last 30 days" value={snapshot.summary.complaints30d} icon={AlertTriangle} />
      </div>

      {notice ? (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {notice.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      ) : null}

      <nav className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <TabButton active={workspaceTab === "compose"} onClick={() => setWorkspaceTab("compose")} icon={PenLine} label="Compose" />
        <TabButton active={workspaceTab === "campaigns"} onClick={() => setWorkspaceTab("campaigns")} icon={History} label="Campaigns" badge={snapshot.campaigns.length} />
      </nav>

      {workspaceTab === "compose" ? (
        <>
          {showAi ? (
            <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700"><Bot className="h-5 w-5" /></div>
                  <div>
                    <h2 className="font-semibold text-slate-950">AI campaign assistant</h2>
                    <p className="mt-1 text-sm text-slate-600">Give the objective. AI prepares a draft only. Sending always remains manual.</p>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200"><ShieldCheck className="h-3.5 w-3.5" /> Human review required</span>
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
                <div>
                  <Field label="Objective"><textarea value={aiObjective} onChange={(e) => setAiObjective(e.target.value)} rows={3} className="input" placeholder="Encourage providers with incomplete profiles to finish their information." /></Field>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Audience"><input value={aiAudience} onChange={(e) => setAiAudience(e.target.value)} className="input" /></Field>
                    <Field label="Tone"><select value={aiTone} onChange={(e) => setAiTone(e.target.value as typeof aiTone)} className="input"><option value="professional">Professional</option><option value="warm">Warm</option><option value="concise">Concise</option><option value="educational">Educational</option><option value="promotional">Promotional</option></select></Field>
                    <Field label="CTA"><input value={aiCta} onChange={(e) => setAiCta(e.target.value)} className="input" placeholder="Complete profile" /></Field>
                    <Field label="Offer"><input value={aiOffer} onChange={(e) => setAiOffer(e.target.value)} className="input" placeholder="Optional" /></Field>
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <button type="button" onClick={() => void generateWithAi()} disabled={generating || aiObjective.trim().length < 3} className="enterprise-button enterprise-button-primary w-full justify-center py-3 disabled:opacity-50">
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {generating ? "Generating" : "Generate draft"}
                  </button>
                  <p className="mt-2 text-center text-xs text-slate-500">Uses the existing server side safety and delivery controls.</p>
                </div>
              </div>
              {aiMeta ? <div className="mt-4 grid gap-3 md:grid-cols-3"><AiNote label="Preview" value={aiMeta.previewText || "Not suggested"} /><AiNote label="Audience" value={aiMeta.suggestedAudience || aiAudience} /><AiNote label="Timing" value={aiMeta.suggestedSchedule || "Review and schedule manually"} /></div> : null}
            </section>
          ) : null}

          <div className="grid min-h-[760px] gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <div><h2 className="text-sm font-semibold text-slate-950">Recipients</h2><p className="text-xs text-slate-500">{selected.length} selected</p></div>
                  </div>
                  {(selected.length > 0 || activeFilters > 0) ? <button type="button" onClick={clearAudience} className="text-xs font-semibold text-slate-500 hover:text-slate-900">Clear</button> : null}
                </div>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void load(query)} placeholder="Search name or email" className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-10 text-sm outline-none focus:border-slate-400" />
                  <button type="button" onClick={() => void load(query)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><RefreshCw className="h-3.5 w-3.5" /></button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Filter value={profileStatus} onChange={setProfileStatus} label="Status" values={statuses} />
                  <Filter value={plan} onChange={setPlan} label="Plan" values={plans} />
                  <Filter value={city} onChange={setCity} label="City" values={cities} />
                  <Filter value={state} onChange={setState} label="State" values={states} />
                </div>
                <button type="button" onClick={selectVisible} disabled={recipients.length === 0} className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Select all visible ({recipients.length})</button>
              </div>
              <div className="max-h-[600px] overflow-y-auto p-2">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading</div>
                ) : recipients.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">No recipients match these filters.</div>
                ) : recipients.map((recipient) => {
                  const isBlocked = recipient.suppressed || !recipient.marketingOptIn;
                  return (
                    <label key={recipient.userId} className={`flex cursor-pointer gap-3 rounded-lg px-3 py-2.5 transition ${selected.includes(recipient.userId) ? "bg-slate-100" : "hover:bg-slate-50"}`}>
                      <input type="checkbox" checked={selected.includes(recipient.userId)} onChange={() => toggle(recipient.userId)} className="mt-1 h-4 w-4 rounded border-slate-300" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2"><span className="truncate text-sm font-medium text-slate-900">{recipient.name}</span>{isBlocked ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" /> : null}</span>
                        <span className="block truncate text-xs text-slate-500">{recipient.email}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-400">{recipient.city || "No city"} · {recipient.profileStatus || "draft"} · {recipient.plan || "free"}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </aside>

            <main className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-700"><Mail className="h-4 w-4" /></div>
                  <div><h2 className="font-semibold text-slate-950">Campaign composer</h2><p className="text-xs text-slate-500">Draft, review and send from one focused workspace.</p></div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={templateId} onChange={(event) => applyTemplate(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <option value="">Use template</option>
                    {snapshot.templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                  </select>
                  <div className="flex rounded-lg bg-slate-100 p-1">
                    <button type="button" onClick={() => setComposerTab("edit")} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${composerTab === "edit" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><PenLine className="h-3.5 w-3.5" /> Edit</button>
                    <button type="button" onClick={() => setComposerTab("preview")} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${composerTab === "preview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><Eye className="h-3.5 w-3.5" /> Preview</button>
                  </div>
                </div>
              </div>

              {composerTab === "edit" ? (
                <div className="p-5 lg:p-6">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Campaign name"><input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="August profile update" className="input" /></Field>
                    <Field label="Type"><select value={sendCategory} onChange={(e) => setSendCategory(e.target.value as "marketing" | "transactional")} className="input"><option value="marketing">Marketing</option><option value="transactional">Transactional</option></select></Field>
                  </div>
                  <Field label="Subject"><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A quick update for {{name}}" className="input text-base font-medium" /></Field>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="From"><input value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} className="input" /></Field>
                    <Field label="Reply to"><input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className="input" /></Field>
                  </div>
                  <Field label="Email HTML"><textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} rows={18} className="input font-mono text-sm leading-6" /></Field>
                  <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700">Advanced settings</summary>
                    <div className="border-t border-slate-200 p-4">
                      <Field label="Plain text fallback"><textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={4} className="input" placeholder="Optional" /></Field>
                      <Field label="Schedule"><input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="input max-w-md" /></Field>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="bg-slate-50 p-5 lg:p-6">
                  <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Subject</p>
                      <p className="mt-1 font-semibold text-slate-900">{(subject || "No subject").replaceAll("{{name}}", "Provider").replaceAll("{{city}}", "your city")}</p>
                      {aiMeta?.previewText ? <p className="mt-1 text-xs text-slate-500">{aiMeta.previewText}</p> : null}
                    </div>
                    <iframe title="Email HTML preview" sandbox="" srcDoc={previewHtml} className="min-h-[560px] w-full bg-white" />
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 bg-white px-5 py-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span><strong className="text-slate-800">{selected.length || recipients.length}</strong> audience</span>
                    {activeFilters > 0 ? <span><strong className="text-slate-800">{activeFilters}</strong> filters</span> : null}
                    {blockedSelected > 0 ? <span className="text-amber-700"><strong>{blockedSelected}</strong> may be suppressed</span> : null}
                    <span>Variables: <code>{"{{name}}"}</code>, <code>{"{{city}}"}</code></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void saveTemplate()} disabled={saving || !subject || !bodyHtml} className="enterprise-button enterprise-button-secondary disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save template</button>
                    <button type="button" onClick={() => void createCampaign()} disabled={!canSend} className="enterprise-button enterprise-button-primary disabled:opacity-50">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : scheduledFor ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}{scheduledFor ? "Schedule" : "Queue campaign"}</button>
                  </div>
                </div>
                {!hasAudience ? <p className="mt-2 text-xs text-amber-700">Select recipients or apply at least one audience filter before sending.</p> : null}
              </div>
            </main>
          </div>
        </>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-slate-500" /><div><h2 className="font-semibold text-slate-950">Campaign activity</h2><p className="text-sm text-slate-500">Delivery status and performance from the lifecycle queue.</p></div></div>
            <button type="button" onClick={() => void load(query)} className="enterprise-button enterprise-button-secondary"><RefreshCw className="h-4 w-4" /> Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Campaign</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Scheduled</th><th className="px-4 py-3">Audience</th><th className="px-4 py-3">Queued</th><th className="px-4 py-3">Sent</th><th className="px-4 py-3">Suppressed</th><th className="px-4 py-3">Failed</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {snapshot.campaigns.length === 0 ? <tr><td colSpan={9} className="px-5 py-16 text-center text-slate-500">No campaigns yet.</td></tr> : snapshot.campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4"><p className="font-semibold text-slate-900">{campaign.name}</p><p className="max-w-xs truncate text-xs text-slate-500">{campaign.subject}</p></td>
                    <td className="px-4 py-4"><StatusBadge status={campaign.status} /></td>
                    <td className="px-4 py-4 text-slate-600">{new Date(campaign.scheduledFor).toLocaleString()}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">{campaign.total}</td>
                    <td className="px-4 py-4 text-slate-600">{campaign.queued + campaign.processing}</td>
                    <td className="px-4 py-4 font-medium text-emerald-700">{campaign.sent}</td>
                    <td className="px-4 py-4 text-amber-700">{campaign.suppressed}</td>
                    <td className="px-4 py-4 text-red-700">{campaign.failed}</td>
                    <td className="px-5 py-4 text-right">{["scheduled", "processing"].includes(campaign.status) && campaign.queued > 0 ? <button type="button" onClick={() => void cancelCampaign(campaign.id)} className="text-xs font-semibold text-red-700 hover:underline">Cancel queued</button> : <span className="text-xs text-slate-400">No action</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-3">
        <Capability icon={Sparkles} title="AI assisted drafting" text="Generate drafts without bypassing human review." />
        <Capability icon={ShieldCheck} title="Compliance controls" text="Opt out, cooldown, suppression and unsubscribe remain enforced." />
        <Capability icon={CalendarClock} title="Lifecycle delivery" text="Existing workers continue handling scheduled communications." />
      </section>

      <style jsx>{`
        :global(.input) { width: 100%; border-radius: 0.625rem; border: 1px solid rgb(226 232 240); padding: 0.625rem 0.75rem; font-weight: 400; outline: none; background: white; transition: border-color .15s, box-shadow .15s; }
        :global(.input:focus) { border-color: rgb(148 163 184); box-shadow: 0 0 0 3px rgb(241 245 249); }
        :global(.enterprise-button) { display: inline-flex; align-items: center; gap: .5rem; border-radius: .625rem; padding: .625rem .875rem; font-size: .875rem; font-weight: 600; transition: background-color .15s, border-color .15s, opacity .15s; }
        :global(.enterprise-button-primary) { background: var(--brand-secondary, #8b1e2d); color: white; }
        :global(.enterprise-button-primary:hover) { filter: brightness(.95); }
        :global(.enterprise-button-secondary) { border: 1px solid rgb(226 232 240); background: white; color: rgb(51 65 85); }
        :global(.enterprise-button-secondary:hover) { background: rgb(248 250 252); }
      `}</style>
    </div>
  );
}

function Metric({ label, hint, value, icon: Icon }: { label: string; hint: string; value: number; icon: typeof Mail }) {
  return <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-medium text-slate-500">{label}</p><div className="mt-1 flex items-baseline gap-2"><p className="text-xl font-bold text-slate-950">{value}</p><span className="text-[11px] text-slate-400">{hint}</span></div></div><div className="rounded-lg bg-slate-100 p-2 text-slate-500"><Icon className="h-4 w-4" /></div></div></div>;
}

function AiNote({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-violet-100 bg-white p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">{label}</p><p className="mt-1 text-sm text-slate-700">{value}</p></div>;
}

function Capability({ icon: Icon, title, text }: { icon: typeof Mail; title: string; text: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start gap-3"><div className="rounded-lg bg-slate-100 p-2 text-slate-500"><Icon className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div></div>;
}

function Filter({ value, onChange, label, values }: { value: string; onChange: (value: string) => void; label: string; values: string[] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none focus:border-slate-400"><option value="">{label}</option>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block space-y-1.5 text-sm font-medium text-slate-700"><span>{label}</span>{children}</label>;
}

function TabButton({ active, onClick, icon: Icon, label, badge }: { active: boolean; onClick: () => void; icon: typeof Mail; label: string; badge?: number }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${active ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900"}`}><Icon className="h-4 w-4" />{label}{typeof badge === "number" ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{badge}</span> : null}</button>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const style = normalized === "sent" || normalized === "completed"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : normalized === "failed" || normalized === "cancelled"
      ? "bg-red-50 text-red-700 ring-red-200"
      : normalized === "scheduled" || normalized === "processing"
        ? "bg-blue-50 text-blue-700 ring-blue-200"
        : "bg-slate-100 text-slate-600 ring-slate-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ${style}`}>{status}</span>;
}
