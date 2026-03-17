"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/app/_lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type AdminCity = {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  intro: string;
  updatedAt: string;
};

type CityFormState = {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  intro: string;
};

const EMPTY_FORM: CityFormState = {
  slug: "",
  name: "",
  state: "",
  stateCode: "",
  intro: "",
};

function toFormState(city: AdminCity): CityFormState {
  return {
    slug: city.slug,
    name: city.name,
    state: city.state,
    stateCode: city.stateCode,
    intro: city.intro,
  };
}

export default function AdminCitiesManager({
  initialCities,
  therapistCounts,
}: {
  initialCities: AdminCity[];
  therapistCounts: Record<string, number>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<CityFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      await postJson("/api/admin/cities", {
        slug: form.slug || undefined,
        name: form.name,
        state: form.state,
        stateCode: form.stateCode,
        intro: form.intro,
      });

      toast({
        title: "City saved",
        description: `${form.name} is now in the admin city store.`,
      });
      setForm(EMPTY_FORM);
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not save city",
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
            placeholder="City name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <Input
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
          <Input
            placeholder="State"
            value={form.state}
            onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
            required
          />
          <Input
            placeholder="State code"
            value={form.stateCode}
            maxLength={3}
            onChange={(event) => setForm((current) => ({ ...current, stateCode: event.target.value }))}
            required
          />
        </div>

        <Textarea
          className="mt-4 min-h-32"
          placeholder="Short intro copy for the city page"
          value={form.intro}
          onChange={(event) => setForm((current) => ({ ...current, intro: event.target.value }))}
          required
        />

        <div className="mt-4 flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : form.slug ? "Save changes" : "Create city"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setForm(EMPTY_FORM)} disabled={saving}>
            Reset
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {initialCities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admin-managed cities saved yet.</p>
        ) : null}

        {initialCities.map((city) => (
          <article key={city.slug} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {city.slug} · {city.stateCode}
                </p>
                <h2 className="mt-1 font-semibold">
                  {city.name}, {city.state}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{city.intro}</p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {therapistCounts[city.name.toLowerCase()] || 0} public therapists
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => setForm(toFormState(city))}>
                  Edit
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
