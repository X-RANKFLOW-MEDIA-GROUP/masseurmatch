"use client";

import { useEffect, useState } from "react";
import { AppButton, AppInput, AppTextarea, PageSection, Surface } from "@/app/_components/primitives";
import { updateProfileMutation, type ProProfileMutationResponse } from "@/app/_lib/mutations";
import { requestJson } from "@/app/_lib/request";
import { useToast } from "@/hooks/use-toast";
import { BODY_TYPE_OPTIONS, normalizeBodyTypeValue } from "@/lib/physical-profile";

type ProfileResponse = {
  ok: boolean;
  profile: ProProfileMutationResponse["profile"];
};

type FormState = {
  displayName: string;
  headline: string;
  bio: string;
  city: string;
  state: string;
  neighborhood: string;
  locationDescription: string;
  phone: string;
  bookingLink: string;
  whatsappNumber: string;
  telegramHandle: string;
  specialties: string;
  languages: string;
  massageTechniques: string;
  incallPrice: string;
  outcallPrice: string;
  outcallRadius: string;
  heightInches: string;
  weightLb: string;
  bodyType: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

const EMPTY_FORM: FormState = {
  displayName: "",
  headline: "",
  bio: "",
  city: "",
  state: "",
  neighborhood: "",
  locationDescription: "",
  phone: "",
  bookingLink: "",
  whatsappNumber: "",
  telegramHandle: "",
  specialties: "",
  languages: "",
  massageTechniques: "",
  incallPrice: "",
  outcallPrice: "",
  outcallRadius: "",
  heightInches: "",
  weightLb: "",
  bodyType: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

function mapProfileToForm(profile: ProfileResponse["profile"]): FormState {
  if (!profile) {
    return EMPTY_FORM;
  }

  return {
    displayName: profile.display_name || profile.full_name || "",
    headline: profile.headline || "",
    bio: profile.bio || "",
    city: profile.city || "",
    state: profile.state || "",
    neighborhood: profile.neighborhood || "",
    locationDescription: profile.location_description || "",
    phone: profile.phone || "",
    bookingLink: profile.booking_link || "",
    whatsappNumber: profile.whatsapp_number || "",
    telegramHandle: profile.telegram_handle || "",
    specialties: (profile.specialties || []).join(", "),
    languages: (profile.languages || []).join(", "),
    massageTechniques: (profile.massage_techniques || []).join(", "),
    incallPrice: profile.incall_price ? String(profile.incall_price) : "",
    outcallPrice: profile.outcall_price ? String(profile.outcall_price) : "",
    outcallRadius: typeof profile.outcall_radius === "number" ? String(profile.outcall_radius) : "",
    heightInches: typeof profile.height_inches === "number" ? String(profile.height_inches) : "",
    weightLb: typeof profile.weight_lb === "number" ? String(profile.weight_lb) : "",
    bodyType: normalizeBodyTypeValue(profile.body_type) || "",
    seoTitle: profile.seo_title || "",
    seoDescription: profile.seo_description || "",
    seoKeywords: (profile.seo_keywords || []).join(", "),
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
        headline: form.headline || null,
        bio: form.bio,
        city: form.city,
        state: form.state || null,
        neighborhood: form.neighborhood || null,
        location_description: form.locationDescription || null,
        phone: form.phone || null,
        booking_link: form.bookingLink || null,
        whatsapp_number: form.whatsappNumber || null,
        telegram_handle: form.telegramHandle || null,
        specialties: form.specialties
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        languages: form.languages.split(",").map((value) => value.trim()).filter(Boolean),
        massage_techniques: form.massageTechniques.split(",").map((value) => value.trim()).filter(Boolean),
        incallPrice: parsePrice(form.incallPrice),
        outcallPrice: parsePrice(form.outcallPrice),
        outcall_radius: parseWholeNumber(form.outcallRadius),
        heightInches: parseWholeNumber(form.heightInches),
        weightLb: parseWholeNumber(form.weightLb),
        bodyType: normalizeBodyTypeValue(form.bodyType),
        seo_title: form.seoTitle || null,
        seo_description: form.seoDescription || null,
        seo_keywords: form.seoKeywords.split(",").map((value) => value.trim()).filter(Boolean),
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
                placeholder="Headline"
                value={form.headline}
                onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))}
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
                placeholder="Neighborhood"
                value={form.neighborhood}
                onChange={(event) => setForm((current) => ({ ...current, neighborhood: event.target.value }))}
              />
              <AppInput
                placeholder="Booking link"
                value={form.bookingLink}
                onChange={(event) => setForm((current) => ({ ...current, bookingLink: event.target.value }))}
              />
              <AppInput
                placeholder="WhatsApp number"
                value={form.whatsappNumber}
                onChange={(event) => setForm((current) => ({ ...current, whatsappNumber: event.target.value }))}
              />
              <AppInput
                placeholder="Telegram handle"
                value={form.telegramHandle}
                onChange={(event) => setForm((current) => ({ ...current, telegramHandle: event.target.value }))}
              />
              <AppInput
                placeholder="Specialties (comma separated)"
                value={form.specialties}
                onChange={(event) => setForm((current) => ({ ...current, specialties: event.target.value }))}
                className="md:col-span-2"
              />
              <AppInput
                placeholder="Languages (comma separated)"
                value={form.languages}
                onChange={(event) => setForm((current) => ({ ...current, languages: event.target.value }))}
                className="md:col-span-2"
              />
              <AppInput
                placeholder="Massage techniques (comma separated)"
                value={form.massageTechniques}
                onChange={(event) => setForm((current) => ({ ...current, massageTechniques: event.target.value }))}
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
              <AppInput
                type="number"
                min="0"
                placeholder="Outcall radius (miles)"
                value={form.outcallRadius}
                onChange={(event) => setForm((current) => ({ ...current, outcallRadius: event.target.value }))}
              />
              <AppInput
                placeholder="SEO title"
                value={form.seoTitle}
                onChange={(event) => setForm((current) => ({ ...current, seoTitle: event.target.value }))}
                className="md:col-span-2"
              />
              <AppInput
                placeholder="SEO keywords (comma separated)"
                value={form.seoKeywords}
                onChange={(event) => setForm((current) => ({ ...current, seoKeywords: event.target.value }))}
                className="md:col-span-2"
              />
            </div>

            <AppTextarea
              placeholder="Location description"
              value={form.locationDescription}
              onChange={(event) => setForm((current) => ({ ...current, locationDescription: event.target.value }))}
            />

            <AppTextarea
              placeholder="Bio"
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              className="min-h-48"
              required
            />
            <AppTextarea
              placeholder="SEO description"
              value={form.seoDescription}
              onChange={(event) => setForm((current) => ({ ...current, seoDescription: event.target.value }))}
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
