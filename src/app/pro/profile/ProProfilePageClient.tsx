"use client";

import { useEffect, useState } from "react";
import { AppButton, AppInput, AppTextarea, PageSection, Surface } from "@/app/_components/primitives";
import { updateProfileMutation, type ProProfileMutationResponse } from "@/app/_lib/mutations";
import { requestJson } from "@/app/_lib/request";
import { useToast } from "@/hooks/use-toast";

type ProfileResponse = {
  ok: boolean;
  profile: ProProfileMutationResponse["profile"];
};

type FormState = {
  displayName: string;
  bio: string;
  city: string;
  state: string;
  phone: string;
  specialties: string;
  incallPrice: string;
  outcallPrice: string;
};

const EMPTY_FORM: FormState = {
  displayName: "",
  bio: "",
  city: "",
  state: "",
  phone: "",
  specialties: "",
  incallPrice: "",
  outcallPrice: "",
};

function mapProfileToForm(profile: ProfileResponse["profile"]): FormState {
  if (!profile) {
    return EMPTY_FORM;
  }

  return {
    displayName: profile.display_name || profile.full_name || "",
    bio: profile.bio || "",
    city: profile.city || "",
    state: profile.state || "",
    phone: profile.phone || "",
    specialties: (profile.specialties || []).join(", "),
    incallPrice: profile.incall_price ? String(profile.incall_price) : "",
    outcallPrice: profile.outcall_price ? String(profile.outcall_price) : "",
  };
}

function parsePrice(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
}

export default function ProProfilePageClient() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await requestJson<ProfileResponse>("/api/pro/profile");

        if (!cancelled) {
          setForm(mapProfileToForm(response.profile));
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Could not load profile",
            description: error instanceof Error ? error.message : "Unknown error.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await updateProfileMutation({
        displayName: form.displayName,
        bio: form.bio,
        city: form.city,
        state: form.state || null,
        phone: form.phone || null,
        specialties: form.specialties
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        incallPrice: parsePrice(form.incallPrice),
        outcallPrice: parsePrice(form.outcallPrice),
      });

      setForm(mapProfileToForm(response.profile));
      toast({
        title: "Profile saved",
        description: "Your public profile details have been updated.",
      });
    } catch (error) {
      toast({
        title: "Could not save profile",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <PageSection
        title="Edit profile"
        description="Update the public details that power your therapist listing and city landing visibility."
      />

      <Surface className="mt-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AppInput
                placeholder="Display name"
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                required
              />
              <AppInput
                placeholder="City"
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                required
              />
              <AppInput
                placeholder="State"
                value={form.state}
                onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
              />
              <AppInput
                placeholder="Phone"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
              <AppInput
                placeholder="Specialties (comma separated)"
                value={form.specialties}
                onChange={(event) => setForm((current) => ({ ...current, specialties: event.target.value }))}
                className="md:col-span-2"
              />
              <AppInput
                type="number"
                min="0"
                placeholder="Incall price"
                value={form.incallPrice}
                onChange={(event) => setForm((current) => ({ ...current, incallPrice: event.target.value }))}
              />
              <AppInput
                type="number"
                min="0"
                placeholder="Outcall price"
                value={form.outcallPrice}
                onChange={(event) => setForm((current) => ({ ...current, outcallPrice: event.target.value }))}
              />
            </div>

            <AppTextarea
              placeholder="Bio"
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              className="min-h-48"
              required
            />

            <div className="flex flex-wrap gap-3">
              <AppButton type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </AppButton>
              <AppButton type="button" variant="outline" onClick={() => setForm(EMPTY_FORM)} disabled={saving}>
                Clear form
              </AppButton>
            </div>
          </form>
        )}
      </Surface>
    </div>
  );
}
