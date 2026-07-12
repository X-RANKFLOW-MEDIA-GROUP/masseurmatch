"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AppButton, AppInput, AppTextarea, PageSection, Surface } from "@/app/_components/primitives";
import { updateProfileMutation, type ProProfileMutationResponse } from "@/app/_lib/mutations";
import { requestJson } from "@/app/_lib/request";
import { useToast } from "@/hooks/use-toast";
import { BODY_TYPE_OPTIONS, normalizeBodyTypeValue } from "@/lib/physical-profile";
import { US_CITIES } from "@/data/cities";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";

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
  heightInches: string;
  weightLb: string;
  bodyType: string;
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
  heightInches: "",
  weightLb: "",
  bodyType: "",
};

const STATE_OPTIONS = Array.from(new Set(US_CITIES.map((city) => city.stateCode))).sort();
const SPECIALTY_OPTIONS = [
  "Deep Tissue", "Swedish", "Sports Massage", "Hot Stone", "Thai Massage", "Trigger Point",
  "Myofascial Release", "Lymphatic Drainage", "Prenatal", "Reflexology", "Relaxation", "Stretch Therapy",
  "Incall", "Outcall", "Couples Massage", "Chair Massage",
];

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
    heightInches: typeof profile.height_inches === "number" ? String(profile.height_inches) : "",
    weightLb: typeof profile.weight_lb === "number" ? String(profile.weight_lb) : "",
    bodyType: normalizeBodyTypeValue(profile.body_type) || "",
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

function parseWholeNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export default function ProProfilePageClient() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadSlow, setLoadSlow] = useState(false);
  const [saving, setSaving] = useState(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setLoadSlow(false);

    slowTimerRef.current = setTimeout(() => setLoadSlow(true), 5000);

    try {
      const response = await requestJson<ProfileResponse>("/api/pro/profile");
      setForm(mapProfileToForm(response.profile));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error.";
      setLoadError(message);
      toast({
        title: "Could not load profile",
        description: message,
        variant: "destructive",
      });
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setLoading(false);
      setLoadSlow(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadProfile();
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, [loadProfile]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || loadError) return;
    if (!form.displayName.trim() || !form.city.trim()) {
      toast({
        title: "Missing required fields",
        description: "Display name and city are required before saving.",
        variant: "destructive",
      });
      return;
    }
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
        heightInches: parseWholeNumber(form.heightInches),
        weightLb: parseWholeNumber(form.weightLb),
        bodyType: normalizeBodyTypeValue(form.bodyType),
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
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={2} />
            <p className="text-sm text-muted-foreground">
              {loadSlow ? "Taking longer than expected..." : "Loading profile..."}
            </p>
            {loadSlow && (
              <button
                type="button"
                onClick={loadProfile}
                className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw className="h-3 w-3" strokeWidth={2.25} />
                Retry
              </button>
            )}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={2} />
            <p className="text-sm text-muted-foreground">Could not load profile: {loadError}</p>
            <button
              type="button"
              onClick={loadProfile}
              className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={2.25} />
              Retry
            </button>
          </div>
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
                onChange={(event) => {
                  const selected = US_CITIES.find((city) => `${city.name}, ${city.stateCode}` === event.target.value);
                  setForm((current) => ({
                    ...current,
                    city: selected?.name ?? event.target.value,
                    state: selected?.stateCode ?? current.state,
                  }));
                }}
                list="city-options"
                required
              />
              <datalist id="city-options">
                {US_CITIES.map((city) => (
                  <option key={`${city.slug}-${city.stateCode}`} value={`${city.name}, ${city.stateCode}`} />
                ))}
              </datalist>
              <select
                value={form.state}
                onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">State</option>
                {STATE_OPTIONS.map((stateCode) => (
                  <option key={stateCode} value={stateCode}>{stateCode}</option>
                ))}
              </select>
              <AppInput
                placeholder="Phone"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
              <select
                value=""
                onChange={(event) => {
                  const value = event.target.value;
                  if (!value) return;
                  const current = form.specialties.split(",").map((v) => v.trim()).filter(Boolean);
                  if (!current.includes(value)) {
                    setForm((prev) => ({ ...prev, specialties: [...current, value].join(", ") }));
                  }
                }}
                className="md:col-span-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Add specialty / service option</option>
                {SPECIALTY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <AppInput
                placeholder="Selected specialties (editable)"
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
              <AppInput
                type="number"
                min="48"
                max="96"
                placeholder={`Height (in) - 72 = 6'0"`}
                value={form.heightInches}
                onChange={(event) => setForm((current) => ({ ...current, heightInches: event.target.value }))}
              />
              <AppInput
                type="number"
                min="80"
                max="450"
                placeholder="Weight (lb)"
                value={form.weightLb}
                onChange={(event) => setForm((current) => ({ ...current, weightLb: event.target.value }))}
              />
              <select
                value={form.bodyType}
                onChange={(event) => setForm((current) => ({ ...current, bodyType: event.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Body type</option>
                {BODY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
