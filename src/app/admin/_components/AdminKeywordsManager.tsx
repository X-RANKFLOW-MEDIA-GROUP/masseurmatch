"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/app/_lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type AdminKeyword = {
  slug: string;
  term: string;
  city: string | null;
  intent: string | null;
  isActive: boolean;
  updatedAt: string;
};

type KeywordSuggestion = {
  term: string;
  count: number;
};

type KeywordFormState = {
  slug: string;
  term: string;
  city: string;
  intent: string;
  isActive: boolean;
};

const EMPTY_FORM: KeywordFormState = {
  slug: "",
  term: "",
  city: "",
  intent: "",
  isActive: true,
};

function toFormState(keyword: AdminKeyword): KeywordFormState {
  return {
    slug: keyword.slug,
    term: keyword.term,
    city: keyword.city || "",
    intent: keyword.intent || "",
    isActive: keyword.isActive,
  };
}

export default function AdminKeywordsManager({
  initialKeywords,
  suggestions,
}: {
  initialKeywords: AdminKeyword[];
  suggestions: KeywordSuggestion[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<KeywordFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      await postJson("/api/admin/keywords", {
        slug: form.slug || undefined,
        term: form.term,
        city: form.city || null,
        intent: form.intent || null,
        isActive: form.isActive,
      });

      toast({
        title: "Keyword saved",
        description: `${form.term} was stored for admin use.`,
      });
      setForm(EMPTY_FORM);
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not save keyword",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="rounded-lg border border-border p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            placeholder="Keyword term"
            value={form.term}
            onChange={(event) => setForm((current) => ({ ...current, term: event.target.value }))}
            required
          />
          <Input
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
          <Input
            placeholder="City (optional)"
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
          />
          <Input
            placeholder="Intent (optional)"
            value={form.intent}
            onChange={(event) => setForm((current) => ({ ...current, intent: event.target.value }))}
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          Active keyword
        </label>

        <div className="mt-4 flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : form.slug ? "Save changes" : "Create keyword"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setForm(EMPTY_FORM)} disabled={saving}>
            Reset
          </Button>
        </div>
      </form>

      <section className="rounded-lg border border-border p-4">
        <h2 className="font-semibold">Live Specialty Suggestions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Based on the current public therapist specialties snapshot.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((entry) => (
            <button
              key={entry.term}
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  term: entry.term,
                }))
              }
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {entry.term} ({entry.count})
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-3">
        {initialKeywords.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admin-managed keywords saved yet.</p>
        ) : null}

        {initialKeywords.map((keyword) => (
          <article key={keyword.slug} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {keyword.slug}
                  {keyword.city ? ` · ${keyword.city}` : ""}
                  {keyword.intent ? ` · ${keyword.intent}` : ""}
                </p>
                <h2 className="mt-1 font-semibold">{keyword.term}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Status: {keyword.isActive ? "active" : "inactive"}
                </p>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={() => setForm(toFormState(keyword))}>
                Edit
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
