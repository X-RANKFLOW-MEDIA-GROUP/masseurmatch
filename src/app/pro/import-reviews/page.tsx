"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSearch,
  Link2,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

import { ApiError, requestJson } from "@/app/_lib/request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type PlatformId = "rubmaps" | "4corners" | "nuru" | "custom";

type DraftLink = {
  id: string;
  platform: PlatformId;
  url: string;
};

type ImportRecord = {
  id: string;
  platform: PlatformId;
  source_url: string;
  status: string;
  imported_review_count: number | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
};

const platforms: Array<{ id: PlatformId; name: string; example: string }> = [
  { id: "rubmaps", name: "RubMaps", example: "rubmaps.com/provider/..." },
  { id: "4corners", name: "4Corners", example: "4corners profile link" },
  { id: "nuru", name: "NuruMap", example: "nurumap.com/provider/..." },
  { id: "custom", name: "Other Directory", example: "Any public directory profile" },
];

const statusMeta: Record<
  string,
  { label: string; description: string; className: string; icon: typeof Clock3 }
> = {
  pending: {
    label: "Submitted",
    description: "Your request is in the import queue.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock3,
  },
  in_progress: {
    label: "Processing",
    description: "We are checking the directory link for eligible reviews.",
    className: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Loader2,
  },
  manual_review: {
    label: "Manual review",
    description: "Automatic extraction was not available, so our team will review it manually.",
    className: "border-violet-200 bg-violet-50 text-violet-800",
    icon: FileSearch,
  },
  completed: {
    label: "Ready for review",
    description: "Eligible reviews were found and are waiting for final approval.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  failed: {
    label: "Could not import",
    description: "We could not process this link. Check it and submit again.",
    className: "border-red-200 bg-red-50 text-red-800",
    icon: AlertCircle,
  },
};

function getPlatformName(platform: string) {
  return platforms.find((item) => item.id === platform)?.name ?? "Directory";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ImportStatusBadge({ record }: { record: ImportRecord }) {
  const verified = record.is_verified === true;
  const meta = verified
    ? {
        label: "Published",
        description: "Approved imported reviews are now eligible to appear on your profile.",
        className: "border-emerald-200 bg-emerald-50 text-emerald-800",
        icon: ShieldCheck,
      }
    : statusMeta[record.status] ?? statusMeta.pending;
  const Icon = meta.icon;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${meta.className}`}>
      <Icon className={`h-3.5 w-3.5 ${record.status === "in_progress" ? "animate-spin" : ""}`} />
      {meta.label}
    </div>
  );
}

export default function ImportReviewsPage() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("custom");
  const [currentUrl, setCurrentUrl] = useState("");
  const [links, setLinks] = useState<DraftLink[]>([]);
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadImports = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await requestJson<{ ok: boolean; imports: ImportRecord[] }>(
        "/api/pro/profile-import",
      );
      setImports(data.imports ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load your imports.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadImports();
  }, [loadImports]);

  const selectedPlatformInfo = useMemo(
    () => platforms.find((platform) => platform.id === selectedPlatform) ?? platforms[3],
    [selectedPlatform],
  );

  function addLink() {
    const trimmed = currentUrl.trim();
    if (!trimmed) {
      toast({ title: "Add a profile link", description: "Paste the public link to your directory profile." });
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("Unsupported protocol");
      }
    } catch {
      toast({
        title: "Check the profile link",
        description: "Enter a complete URL beginning with https:// or http://.",
        variant: "destructive",
      });
      return;
    }

    if (links.some((link) => link.url.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Link already added", description: "Each directory profile only needs to be submitted once." });
      return;
    }

    setLinks((current) => [
      ...current,
      { id: crypto.randomUUID(), platform: selectedPlatform, url: trimmed },
    ]);
    setCurrentUrl("");
  }

  async function submitImports() {
    if (links.length === 0) {
      toast({ title: "Add at least one link", description: "Choose a directory and paste your profile URL first." });
      return;
    }

    setSubmitting(true);
    try {
      const data = await requestJson<{ ok: boolean; submitted: number; message: string }>(
        "/api/pro/profile-import",
        {
          method: "POST",
          body: JSON.stringify({
            profileUrls: links.map(({ platform, url }) => ({ platform, url })),
          }),
        },
      );

      toast({ title: "Import request received", description: data.message });
      setLinks([]);
      await loadImports();
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Could not submit the import request.";
      toast({ title: "Import request not submitted", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EAD8D9] bg-[#F9EDEE] px-3 py-1.5 text-xs font-semibold text-[#8B1E2D]">
          <Sparkles className="h-3.5 w-3.5" />
          Free provider tool
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Import Your Existing Reviews
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Submit links to profiles you own on other directories. MasseurMatch will check for eligible ratings and reviews, then route them through verification before anything is published.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F9EDEE] text-[#8B1E2D]">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-900">Add profile links</h2>
                <p className="mt-1 text-sm text-slate-500">You can submit up to five directory profiles at a time.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Directory
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {platforms.map((platform) => {
                  const selected = selectedPlatform === platform.id;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-[#8B1E2D] bg-[#F9EDEE] ring-1 ring-[#8B1E2D]/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${selected ? "text-[#8B1E2D]" : "text-slate-800"}`}>
                        {platform.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">{platform.example}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="profile-import-url" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {selectedPlatformInfo.name} profile URL
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="profile-import-url"
                  type="url"
                  value={currentUrl}
                  onChange={(event) => setCurrentUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addLink();
                    }
                  }}
                  placeholder="https://"
                  disabled={submitting}
                  className="h-11 flex-1"
                />
                <Button type="button" onClick={addLink} disabled={submitting} className="h-11 bg-[#8B1E2D] hover:bg-[#6E1521]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add link
                </Button>
              </div>
            </div>

            {links.length > 0 ? (
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Ready to submit ({links.length})
                </p>
                {links.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1E7A46]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{getPlatformName(link.platform)}</p>
                      <p className="truncate text-xs text-slate-500">{link.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLinks((current) => current.filter((item) => item.id !== link.id))}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-600"
                      aria-label={`Remove ${link.url}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <Button
              type="button"
              onClick={submitImports}
              disabled={submitting || links.length === 0}
              className="h-12 w-full bg-[#8B1E2D] text-white hover:bg-[#6E1521]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting request...
                </>
              ) : (
                <>
                  Start review import
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-[#EAD8D9] bg-[#FCF7F5] p-6">
            <div className="flex items-center gap-2 text-[#8B1E2D]">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="font-display text-lg font-semibold">How it works</h2>
            </div>
            <ol className="mt-5 space-y-4">
              {[
                ["Submit your link", "Choose the directory and provide the public profile URL."],
                ["We check eligibility", "The system looks for ratings and reviews that can be verified."],
                ["A human reviews it", "Imported content stays hidden until the MasseurMatch team approves it."],
                ["Approved reviews publish", "Eligible reviews may then appear with source attribution."],
              ].map(([title, description], index) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B1E2D] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-slate-900">Important</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>Only submit profiles and reviews that belong to you or that you are authorized to use.</li>
              <li>Submitting a link does not guarantee every review will be transferred.</li>
              <li>This tool currently imports eligible ratings and reviews, not photos, bio, pricing, or availability.</li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">Import history</h2>
            <p className="mt-1 text-sm text-slate-500">Track every profile link you have submitted.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void loadImports()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock3 className="mr-2 h-4 w-4" />}
            Refresh status
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-44 items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading import history...
          </div>
        ) : loadError ? (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Could not load import history</p>
                <p className="mt-1">{loadError}</p>
              </div>
            </div>
          </div>
        ) : imports.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileSearch className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-800">No import requests yet</p>
            <p className="mt-1 text-sm text-slate-500">Your submitted profile links will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {imports.map((record) => {
              const meta = record.is_verified ? null : statusMeta[record.status] ?? statusMeta.pending;
              return (
                <article key={record.id} className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{getPlatformName(record.platform)}</h3>
                      <span className="text-xs text-slate-400">Submitted {formatDate(record.created_at)}</span>
                    </div>
                    <a
                      href={record.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 text-xs text-[#8B1E2D] hover:underline"
                    >
                      <span className="truncate">{record.source_url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {record.is_verified
                        ? "This import was approved."
                        : meta?.description}
                      {record.imported_review_count && record.imported_review_count > 0
                        ? ` ${record.imported_review_count} review${record.imported_review_count === 1 ? "" : "s"} found.`
                        : ""}
                    </p>
                  </div>
                  <ImportStatusBadge record={record} />
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
