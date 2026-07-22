"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, ShieldCheck, SlidersHorizontal, Images, Mail, Loader2 } from "lucide-react";
import { requestJson } from "@/app/_lib/request";
import { useToast } from "@/hooks/use-toast";

type SettingsRow = {
  require_identity_verification: boolean | null;
  require_text_verification: boolean | null;
  require_photo_review: boolean | null;
  require_manual_profile_review: boolean | null;
  allow_public_profiles: boolean | null;
  maintenance_mode: boolean | null;
  signup_enabled: boolean | null;
  max_free_photos: number | null;
  max_standard_photos: number | null;
  max_pro_photos: number | null;
  max_elite_photos: number | null;
  support_email: string | null;
  billing_email: string | null;
  legal_email: string | null;
};

type SavePayload = {
  requireIdentityVerification: boolean;
  requireTextVerification: boolean;
  requirePhotoReview: boolean;
  requireManualProfileReview: boolean;
  allowPublicProfiles: boolean;
  maintenanceMode: boolean;
  signupEnabled: boolean;
  maxFreePhotos: number;
  maxStandardPhotos: number;
  maxProPhotos: number;
  maxElitePhotos: number;
  supportEmail: string;
  billingEmail: string;
  legalEmail: string;
};

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-border p-4 cursor-pointer transition-colors hover:bg-secondary/20">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </label>
  );
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<SavePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    requestJson<{ ok: boolean; settings: SettingsRow | null }>("/api/admin/settings")
      .then(({ settings: s }) => {
        setForm({
          requireIdentityVerification: s?.require_identity_verification ?? true,
          requireTextVerification: s?.require_text_verification ?? false,
          requirePhotoReview: s?.require_photo_review ?? true,
          requireManualProfileReview: s?.require_manual_profile_review ?? true,
          allowPublicProfiles: s?.allow_public_profiles ?? true,
          maintenanceMode: s?.maintenance_mode ?? false,
          signupEnabled: s?.signup_enabled ?? true,
          maxFreePhotos: s?.max_free_photos ?? 3,
          maxStandardPhotos: s?.max_standard_photos ?? 8,
          maxProPhotos: s?.max_pro_photos ?? 15,
          maxElitePhotos: s?.max_elite_photos ?? 30,
          supportEmail: s?.support_email ?? "",
          billingEmail: s?.billing_email ?? "",
          legalEmail: s?.legal_email ?? "",
        });
      })
      .catch(() => {
        toast({ title: "Could not load settings", description: "Please try again.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const patch = <K extends keyof SavePayload>(key: K, value: SavePayload[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      // The API validates email fields with .email(), so omit empty strings
      // rather than sending "" (which would 400).
      const payload: Record<string, unknown> = { ...form };
      for (const key of ["supportEmail", "billingEmail", "legalEmail"] as const) {
        if (!form[key]?.trim()) delete payload[key];
      }
      await requestJson("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast({ title: "Settings saved", description: "Your changes are live." });
    } catch (error) {
      toast({
        title: "Could not save settings",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" description="Platform configuration and moderation controls." />

      {loading || !form ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2.25} />
                <CardTitle className="font-display text-base">Moderation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Toggle
                  label="Require identity verification"
                  description="Providers must complete Stripe Identity before submitting."
                  checked={form.requireIdentityVerification}
                  onChange={(v) => patch("requireIdentityVerification", v)}
                />
                <Toggle
                  label="Require phone verification"
                  description="Providers must verify a phone number by SMS."
                  checked={form.requireTextVerification}
                  onChange={(v) => patch("requireTextVerification", v)}
                />
                <Toggle
                  label="Review photos before publishing"
                  description="New photos wait for admin approval."
                  checked={form.requirePhotoReview}
                  onChange={(v) => patch("requirePhotoReview", v)}
                />
                <Toggle
                  label="Manual profile review"
                  description="Every submitted profile goes through the approval queue."
                  checked={form.requireManualProfileReview}
                  onChange={(v) => patch("requireManualProfileReview", v)}
                />
                <Toggle
                  label="Allow public profiles"
                  description="Approved profiles are visible in the public directory."
                  checked={form.allowPublicProfiles}
                  onChange={(v) => patch("allowPublicProfiles", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" strokeWidth={2.25} />
                <CardTitle className="font-display text-base">Platform</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Toggle
                  label="Signups enabled"
                  description="Allow new providers to create accounts."
                  checked={form.signupEnabled}
                  onChange={(v) => patch("signupEnabled", v)}
                />
                <Toggle
                  label="Maintenance mode"
                  description="Temporarily take the public site offline."
                  checked={form.maintenanceMode}
                  onChange={(v) => patch("maintenanceMode", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Images className="h-5 w-5 text-primary" strokeWidth={2.25} />
                <CardTitle className="font-display text-base">Photo limits per plan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {([
                  ["Free", "maxFreePhotos"],
                  ["Standard", "maxStandardPhotos"],
                  ["Pro", "maxProPhotos"],
                  ["Elite", "maxElitePhotos"],
                ] as const).map(([label, key]) => (
                  <div key={key} className="grid gap-2">
                    <label htmlFor={key} className="text-sm font-medium text-foreground">{label}</label>
                    <Input
                      id={key}
                      type="number"
                      min={0}
                      max={50}
                      value={form[key]}
                      onChange={(e) => patch(key, Number(e.target.value))}
                      className="bg-secondary/30 border-border"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" strokeWidth={2.25} />
                <CardTitle className="font-display text-base">Contact emails</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-xl">
                {([
                  ["Support email", "supportEmail"],
                  ["Billing email", "billingEmail"],
                  ["Legal email", "legalEmail"],
                ] as const).map(([label, key]) => (
                  <div key={key} className="grid gap-2">
                    <label htmlFor={key} className="text-sm font-medium text-foreground">{label}</label>
                    <Input
                      id={key}
                      type="email"
                      value={form[key]}
                      onChange={(e) => patch(key, e.target.value)}
                      placeholder="name@masseurmatch.com"
                      className="bg-secondary/30 border-border"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 flex justify-end border-t border-border bg-white/80 py-4 backdrop-blur">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
