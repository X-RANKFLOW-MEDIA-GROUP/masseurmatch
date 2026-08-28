"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, Loader2, RefreshCw, Sparkles } from "lucide-react";

type SystemTemplate = {
  key: string;
  name: string;
  description: string;
  subject: string;
  category: "marketing" | "transactional";
  previewUrl: string;
};

type SystemSnapshot = {
  templates: SystemTemplate[];
  ai: {
    configured: boolean;
    providers: {
      deepseek: boolean;
      openai: boolean;
      gemini: boolean;
    };
  };
};

type AiTestResult = {
  working: boolean;
  reason?: string;
  provider?: string;
  model?: string;
};

export default function SystemEmailTools() {
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SystemTemplate | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<AiTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/emails/system", { credentials: "include", cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load system email tools.");
      setSnapshot({ templates: body.templates || [], ai: body.ai });
      setSelected((current) => current || body.templates?.[0] || null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load system email tools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const testAi = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/emails/system", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ai_test" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "AI connection test failed.");
      setTestResult({
        working: Boolean(body.working),
        reason: body.reason,
        provider: body.provider,
        model: body.model,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "AI connection test failed.");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading system templates and AI status</div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">System templates</p>
              <h2 className="mt-1 font-semibold text-slate-950">Website and transactional email templates</h2>
              <p className="mt-1 text-xs text-slate-500">These are versioned in Git and are separate from manually saved campaign templates.</p>
            </div>
            <button type="button" onClick={() => void load()} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Refresh system templates">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-2">
            {(snapshot?.templates || []).map((template) => (
              <button
                key={template.key}
                type="button"
                onClick={() => setSelected(template)}
                className={`rounded-xl border p-4 text-left transition ${selected?.key === template.key ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{template.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{template.description}</p>
                  </div>
                  <Eye className="h-4 w-4 shrink-0 text-slate-400" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <span>{template.category}</span><span>•</span><span>Preview</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><Sparkles className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">AI setup</p>
              <h2 className="mt-1 font-semibold text-slate-950">Provider connection status</h2>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Provider label="DeepSeek" active={Boolean(snapshot?.ai.providers.deepseek)} />
            <Provider label="OpenAI" active={Boolean(snapshot?.ai.providers.openai)} />
            <Provider label="Gemini" active={Boolean(snapshot?.ai.providers.gemini)} />
          </div>

          {!snapshot?.ai.configured ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              No supported AI provider key is visible to this deployment. Configure OPENAI_API_KEY, DEEPSEEK_API_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY server side.
            </div>
          ) : null}

          <button type="button" onClick={() => void testAi()} disabled={testing} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {testing ? "Testing AI" : "Test AI connection"}
          </button>

          {testResult ? (
            <div className={`mt-3 rounded-xl border p-3 text-xs leading-relaxed ${testResult.working ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              {testResult.working ? `Connected through ${testResult.provider} (${testResult.model}).` : testResult.reason || "AI connection failed."}
            </div>
          ) : null}
        </div>
      </div>

      {selected ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">{selected.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">Subject: {selected.subject}</p>
            </div>
            <a href={selected.previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950">
              <Eye className="h-3.5 w-3.5" /> Open full preview
            </a>
          </div>
          <div className="bg-slate-100 p-3 sm:p-5">
            <iframe title={`${selected.name} preview`} src={selected.previewUrl} className="h-[760px] w-full rounded-xl border border-slate-200 bg-white" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Provider({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${active ? "text-emerald-700" : "text-slate-400"}`}>
        {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
        {active ? "Configured" : "Not configured"}
      </span>
    </div>
  );
}
