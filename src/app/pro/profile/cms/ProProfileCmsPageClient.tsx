"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AppButton, AppInput, AppTextarea, PageSection, Surface } from "@/app/_components/primitives";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, AlertCircle, Eye, Save, X } from "lucide-react";
import { requestJson, postJson } from "@/app/_lib/request";

type ProfileResponse = {
  ok: boolean;
  profile: Record<string, any>;
};

type FormErrors = Record<string, string>;

interface ChipInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
}

function ChipInput({ label, value, onChange, placeholder = "Add item and press Enter", error }: ChipInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setInput("");
      }
    }
  };

  const removeChip = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="space-y-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((item, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-sm text-accent"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeChip(index)}
                  className="hover:text-accent-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface JsonEditorProps {
  label: string;
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  error?: string;
  description?: string;
}

function JsonEditor({ label, value, onChange, error, description }: JsonEditorProps) {
  const [jsonText, setJsonText] = useState(JSON.stringify(value, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <textarea
        value={jsonText}
        onChange={(e) => handleChange(e.target.value)}
        className="font-mono flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      {(error || jsonError) && (
        <p className="text-sm text-destructive">{error || jsonError}</p>
      )}
    </div>
  );
}

export default function ProProfileCmsPageClient() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [form, setForm] = useState({
    // Basic Info
    display_name: "",
    full_name: "",
    avatar_url: "",
    email_address: "",

    // Services & Specialties
    education: "",
    training: "",
    certifications: "",

    // Pricing & Availability
    pricing_sessions: {} as Record<string, number>,
    regular_discounts: {} as Record<string, any>,
    business_hours: {} as Record<string, any>,
    offers_incall: false,
    offers_outcall: false,
    starting_price: 0,
    outcall_radius_miles: 0,

    // Marketing & SEO
    seo_title: "",
    seo_description: "",
    seo_keywords: [] as string[],
    presentation_video_url: "",
    social_media: {} as Record<string, string>,

    // Advanced
    custom_faq: {} as Record<string, any>,
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    slowTimerRef.current = setTimeout(() => {}, 5000);

    try {
      const response = await requestJson<ProfileResponse>("/api/pro/profile");
      const profileData = response.profile;

      setProfile(profileData);
      setForm({
        display_name: profileData?.display_name || "",
        full_name: profileData?.full_name || "",
        avatar_url: profileData?.avatar_url || "",
        email_address: profileData?.email_address || profileData?.email || "",

        education: profileData?.education || "",
        training: profileData?.training || "",
        certifications: profileData?.certifications || "",

        pricing_sessions: profileData?.pricing_sessions || {},
        regular_discounts: profileData?.regular_discounts || {},
        business_hours: profileData?.business_hours || {},
        offers_incall: profileData?.offers_incall ?? false,
        offers_outcall: profileData?.offers_outcall ?? false,
        starting_price: profileData?.starting_price || 0,
        outcall_radius_miles: profileData?.outcall_radius_miles || 0,

        seo_title: profileData?.seo_title || "",
        seo_description: profileData?.seo_description || "",
        seo_keywords: profileData?.seo_keywords || [],
        presentation_video_url: profileData?.presentation_video_url || "",
        social_media: profileData?.social_media || {},

        custom_faq: profileData?.custom_faq || {},
      });
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

    const newErrors: FormErrors = {};

    if (!form.display_name?.trim()) {
      newErrors.display_name = "Display name is required.";
    }
    if (!form.full_name?.trim()) {
      newErrors.full_name = "Full name is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation failed",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const response = await postJson<ProfileResponse>("/api/pro/profile/cms-update", form);

      setProfile(response.profile);
      toast({
        title: "Profile saved",
        description: "Your CMS profile has been updated successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error.";
      toast({
        title: "Could not save profile",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (profile?.slug) {
      window.open(`/therapists/${profile.slug}`, "_blank");
    } else {
      toast({
        title: "Cannot preview",
        description: "Profile needs a slug to be previewed.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <PageSection
        title="Profile CMS"
        description="Advanced editor with full control over all profile sections. Changes are logged to your audit trail."
        actions={
          <div className="flex gap-3">
            <AppButton
              type="button"
              onClick={handlePreview}
              disabled={!profile?.slug}
              className="inline-flex items-center gap-2"
            >
              <Eye className="h-4 w-4" strokeWidth={2.25} />
              Preview
            </AppButton>
          </div>
        }
      />

      <Surface className="mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={2} />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
            <button
              type="button"
              onClick={loadProfile}
              className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={2.25} />
              Retry
            </button>
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
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <Accordion type="single" collapsible>
              <AccordionItem value="basic">
                <AccordionTrigger className="text-base font-semibold">Basic Information</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                      <input
                        type="text"
                        value={form.display_name}
                        onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      {errors.display_name && <p className="text-sm text-destructive mt-1">{errors.display_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name}</p>}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Avatar URL</label>
                      <input
                        type="url"
                        value={form.avatar_url}
                        onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                        placeholder="https://..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <input
                        type="email"
                        value={form.email_address}
                        onChange={(e) => setForm({ ...form, email_address: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Services & Specialties Section */}
            <Accordion type="single" collapsible>
              <AccordionItem value="services">
                <AccordionTrigger className="text-base font-semibold">Services & Specialties</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Education</label>
                      <AppTextarea
                        value={form.education}
                        onChange={(e) => setForm({ ...form, education: e.target.value })}
                        placeholder="Describe your education and qualifications..."
                        className="min-h-24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Training</label>
                      <AppTextarea
                        value={form.training}
                        onChange={(e) => setForm({ ...form, training: e.target.value })}
                        placeholder="Describe your training and certifications..."
                        className="min-h-24"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Certifications</label>
                    <AppTextarea
                      value={form.certifications}
                      onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                      placeholder="List any professional certifications..."
                      className="min-h-20"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Pricing & Availability Section */}
            <Accordion type="single" collapsible>
              <AccordionItem value="pricing">
                <AccordionTrigger className="text-base font-semibold">Pricing & Availability</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Starting Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.starting_price}
                        onChange={(e) => setForm({ ...form, starting_price: parseInt(e.target.value) || 0 })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Outcall Radius (miles)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.outcall_radius_miles}
                        onChange={(e) => setForm({ ...form, outcall_radius_miles: parseInt(e.target.value) || 0 })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.offers_incall}
                        onChange={(e) => setForm({ ...form, offers_incall: e.target.checked })}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm font-medium text-foreground">Offers Incall</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.offers_outcall}
                        onChange={(e) => setForm({ ...form, offers_outcall: e.target.checked })}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm font-medium text-foreground">Offers Outcall</span>
                    </label>
                  </div>

                  <JsonEditor
                    label="Pricing Sessions"
                    value={form.pricing_sessions}
                    onChange={(value) => setForm({ ...form, pricing_sessions: value })}
                    description='E.g., {"60min": 150, "90min": 200}'
                  />
                  <JsonEditor
                    label="Regular Discounts"
                    value={form.regular_discounts}
                    onChange={(value) => setForm({ ...form, regular_discounts: value })}
                  />
                  <JsonEditor
                    label="Business Hours"
                    value={form.business_hours}
                    onChange={(value) => setForm({ ...form, business_hours: value })}
                    description='E.g., {"Monday": "10:00-18:00", "Tuesday": "10:00-18:00"}'
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Marketing & SEO Section */}
            <Accordion type="single" collapsible>
              <AccordionItem value="marketing">
                <AccordionTrigger className="text-base font-semibold">Marketing & SEO</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">SEO Title</label>
                    <input
                      type="text"
                      maxLength={60}
                      value={form.seo_title}
                      onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                      placeholder="SEO page title (max 60 chars)..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{form.seo_title.length}/60</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">SEO Description</label>
                    <AppTextarea
                      value={form.seo_description}
                      onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                      placeholder="SEO meta description (max 160 chars)..."
                      maxLength={160}
                      className="min-h-20"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{form.seo_description.length}/160</p>
                  </div>

                  <ChipInput
                    label="SEO Keywords"
                    value={form.seo_keywords}
                    onChange={(value) => setForm({ ...form, seo_keywords: value })}
                    placeholder="e.g., massage therapist, deep tissue..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Presentation Video URL</label>
                    <input
                      type="url"
                      value={form.presentation_video_url}
                      onChange={(e) => setForm({ ...form, presentation_video_url: e.target.value })}
                      placeholder="https://youtube.com/... or https://vimeo.com/..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  <JsonEditor
                    label="Social Media"
                    value={form.social_media}
                    onChange={(value) => setForm({ ...form, social_media: value })}
                    description='E.g., {"instagram": "@username", "twitter": "@handle"}'
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Advanced Section */}
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-base font-semibold">Advanced Settings</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Profile Completeness</label>
                    <div className="text-2xl font-semibold text-accent">
                      {profile?.profile_completeness || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Read-only. Updated automatically based on filled fields.</p>
                  </div>

                  <JsonEditor
                    label="Custom FAQ"
                    value={form.custom_faq}
                    onChange={(value) => setForm({ ...form, custom_faq: value })}
                    description='E.g., {"question-1": "What is your cancellation policy?", "answer-1": "24 hours notice..."}'
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <AppButton type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" strokeWidth={2.25} />}
                {saving ? "Saving..." : "Save Profile"}
              </AppButton>
              <AppButton type="button" variant="outline" onClick={() => setForm({ ...form })} disabled={saving}>
                Cancel
              </AppButton>
            </div>
          </form>
        )}
      </Surface>
    </div>
  );
}
