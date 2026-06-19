"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  DollarSign,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Save,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import { updateProfileMutation, type ProProfileMutationResponse } from "@/app/_lib/mutations";
import { ApiError, postJson, requestJson } from "@/app/_lib/request";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BODY_TYPE_OPTIONS, normalizeBodyTypeValue } from "@/lib/physical-profile";
import { lookupZipArea } from "@/lib/profile-autofill";

const SERVICE_OPTIONS = [
  "Deep Tissue",
  "Swedish",
  "Sports",
  "Trigger Point",
  "Prenatal",
  "Reflexology",
  "Hot Stone",
  "Thai Massage",
  "Myofascial Release",
  "Lymphatic Drainage",
  "Aromatherapy",
  "Shiatsu",
];

const SESSION_LENGTHS = ["30 min", "60 min", "75 min", "90 min", "120 min"];

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

type ExtendedProfile = NonNullable<ProProfileMutationResponse["profile"]> & {
  neighborhood?: string | null;
  whatsapp_number?: string | null;
  email_address?: string | null;
  website?: string | null;
  offers_incall?: boolean | null;
  offers_outcall?: boolean | null;
};

type ProfileResponse = {
  ok: boolean;
  profile: ExtendedProfile | null;
};

type FormState = {
  displayName: string;
  bio: string;
  zipCode: string;
  city: string;
  state: string;
  neighborhood: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  specialties: string[];
  incallPrice: string;
  outcallPrice: string;
  locationType: "incall" | "outcall" | "both" | "";
  heightInches: string;
  weightLb: string;
  bodyType: string;
};

type SaveState = "idle" | "scanning" | "success" | "flagged";

type ModerationResult = {
  approved: boolean;
  reason?: string | null;
  unavailable?: boolean;
  provider?: string | null;
  categories?: string[];
  matches?: unknown[];
};

const EMPTY_FORM: FormState = {
  displayName: "",
  bio: "",
  zipCode: "",
  city: "",
  state: "",
  neighborhood: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  specialties: [],
  incallPrice: "",
  outcallPrice: "",
  locationType: "",
  heightInches: "",
  weightLb: "",
  bodyType: "",
};

function mapProfileToForm(profile: ExtendedProfile | null | undefined): FormState {
  if (!profile) return EMPTY_FORM;

  let locationType: FormState["locationType"] = "";
  if (profile.offers_incall && profile.offers_outcall) locationType = "both";
  else if (profile.offers_incall) locationType = "incall";
  else if (profile.offers_outcall) locationType = "outcall";

  return {
    displayName: profile.display_name || profile.full_name || "",
    bio: profile.bio || "",
    zipCode: "",
    city: profile.city || "",
    state: profile.state || "",
    neighborhood: profile.neighborhood || "",
    phone: profile.phone || "",
    whatsapp: profile.whatsapp_number || "",
    email: profile.email_address || "",
    website: profile.website || "",
    specialties: profile.specialties || [],
    incallPrice: profile.incall_price ? String(profile.incall_price) : "",
    outcallPrice: profile.outcall_price ? String(profile.outcall_price) : "",
    locationType,
    heightInches: typeof profile.height_inches === "number" ? String(profile.height_inches) : "",
    weightLb: typeof profile.weight_lb === "number" ? String(profile.weight_lb) : "",
    bodyType: normalizeBodyTypeValue(profile.body_type) || "",
  };
}

function parsePrice(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
}

function parseWholeNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function delay(ms: number) {
  return new Promise((resolve) => { window.setTimeout(resolve, ms); });
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const payload = error.payload;
    if (payload && typeof payload === "object") {
      const fieldErrors =
        "details" in payload && Array.isArray((payload as { details?: unknown }).details)
          ? ((payload as { details: Array<{ message?: string }> }).details ?? [])
          : [];
      if (fieldErrors.length > 0 && fieldErrors[0]?.message) return fieldErrors[0].message;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function formatReason(reason?: string | null) {
  if (!reason) return "AI flagged language outside profile quality guidelines.";
  return reason.split("_").join(" ");
}

async function moderateTextField(profileId: string, fieldName: string, text: string): Promise<ModerationResult> {
  if (!text.trim()) return { approved: true };

  const { data, error } = await supabase.functions.invoke("moderate-text", {
    body: { profile_id: profileId, text, field_name: fieldName },
  });

  if (error) {
    console.error("[pro/listing] moderate-text failed:", error.message);
    return { approved: true, unavailable: true };
  }

  if (data && data.approved === false) {
    return {
      approved: false,
      reason: typeof data.reason === "string" ? data.reason : null,
      provider: typeof data.provider === "string" ? data.provider : "sightengine",
      categories: Array.isArray(data.categories) ? data.categories : [],
      matches: Array.isArray(data.matches) ? data.matches : [],
    };
  }

  return {
    approved: true,
    provider: typeof data?.provider === "string" ? data.provider : "sightengine",
    categories: Array.isArray(data?.categories) ? data.categories : [],
    matches: Array.isArray(data?.matches) ? data.matches : [],
  };
}

function SectionCard({ id, icon: Icon, title, subtitle, children }: {
  id: string;
  icon: typeof User;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}{required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function inputCls(extra = "") {
  return `w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${extra}`;
}

export default function MyListingPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [scanLabel, setScanLabel] = useState("listing");
  const [flagReason, setFlagReason] = useState("");
  const [zipStatus, setZipStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await requestJson<ProfileResponse>("/api/pro/profile");
        if (!cancelled) {
          setForm(mapProfileToForm(response.profile));
          setProfileId(response.profile?.id ?? null);
          setProfileStatus(response.profile?.status ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Could not load your profile",
            description: getApiErrorMessage(error, "Try again in a moment."),
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProfile();
    return () => { cancelled = true; };
  }, [toast]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleService(service: string) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(service)
        ? f.specialties.filter((s) => s !== service)
        : [...f.specialties, service],
    }));
  }

  function handleZipChange(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 5);
    set("zipCode", cleaned);

    if (cleaned.length < 5) {
      setZipStatus(null);
      return;
    }

    const cached = lookupZipArea(cleaned);
    if (cached) {
      setForm((f) => ({ ...f, city: cached.city, state: cached.state, neighborhood: f.neighborhood || cached.primaryNeighborhood }));
      setZipStatus(`✓ ${cached.city}, ${cached.state}`);
      return;
    }

    setZipStatus("Looking up…");
    fetch(`/api/zip-lookup?zip=${cleaned}`)
      .then((r) => r.json())
      .then((res: { city: string; state: string; stateAbbr: string } | null) => {
        if (res?.city) {
          setForm((f) => ({ ...f, city: res.city, state: res.stateAbbr }));
          setZipStatus(`✓ ${res.city}, ${res.stateAbbr}`);
        } else {
          setZipStatus("Not found — enter manually");
        }
      })
      .catch(() => setZipStatus("Not found — enter manually"));
  }

  const handleKnottyAIMagic = async () => {
    if (form.bio.trim().length < 10) return;
    setIsAiLoading(true);
    await delay(1200);
    const city = form.city || "my area";
    const services = form.specialties.length ? form.specialties.slice(0, 3).join(", ") : "professional massage";
    set("bio", `I offer ${services} in ${city} with a client-focused approach — clear communication, professional boundaries, and attentive technique. Sessions are designed for genuine relaxation, recovery, and comfort in a clean, respectful environment.`);
    setIsAiLoading(false);
  };

  const handleSaveAndScan = async () => {
    if (!profileId) {
      toast({ title: "Profile unavailable", description: "Reload the page before saving.", variant: "destructive" });
      return;
    }
    if (!agreedToTerms) {
      toast({ title: "Confirm profile rules", description: "Check the agreement box before submitting.", variant: "destructive" });
      return;
    }

    const startedAt = Date.now();
    setSaveState("scanning");
    setFlagReason("");

    try {
      let moderationUnavailable = false;
      const moderationChecks = [
        { fieldName: "display_name", label: "display name", text: form.displayName },
        { fieldName: "bio", label: "bio", text: form.bio },
        { fieldName: "specialties", label: "services", text: form.specialties.join(", ") },
      ];

      for (const check of moderationChecks) {
        setScanLabel(check.label);
        const moderation = await moderateTextField(profileId, check.fieldName, check.text);

        if (moderation.unavailable) moderationUnavailable = true;

        if (!moderation.approved) {
          const reason = formatReason(moderation.reason);
          try {
            await postJson("/api/pro/profile/flag", {
              displayName: form.displayName,
              bio: form.bio,
              city: form.city,
              state: form.state || null,
              neighborhood: form.neighborhood || null,
              phone: form.phone || null,
              specialties: form.specialties,
              incallPrice: parsePrice(form.incallPrice),
              outcallPrice: parsePrice(form.outcallPrice),
              heightInches: parseWholeNumber(form.heightInches),
              weightLb: parseWholeNumber(form.weightLb),
              bodyType: normalizeBodyTypeValue(form.bodyType),
              moderationReason: reason,
              flaggedField: check.fieldName,
              moderationProvider: moderation.provider || "sightengine",
              aiResponse: {
                provider: moderation.provider || "sightengine",
                categories: moderation.categories || [],
                matches: moderation.matches || [],
                reason,
              },
            });
          } catch (flagError) {
            console.error("[pro/listing] could not record flagged draft:", flagError);
          }

          const remaining = Math.max(0, 1600 - (Date.now() - startedAt));
          if (remaining > 0) await delay(remaining);

          setFlagReason(reason);
          setSaveState("flagged");
          toast({ title: "Content held for manual review", description: "Your public profile was not changed.", variant: "destructive" });
          return;
        }
      }

      const remaining = Math.max(0, 1600 - (Date.now() - startedAt));
      if (remaining > 0) await delay(remaining);

      const response = await updateProfileMutation({
        displayName: form.displayName,
        bio: form.bio,
        city: form.city,
        state: form.state || null,
        neighborhood: form.neighborhood || null,
        zipCode: form.zipCode || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        website: form.website || null,
        specialties: form.specialties,
        incallPrice: parsePrice(form.incallPrice),
        outcallPrice: parsePrice(form.outcallPrice),
        locationType: form.locationType || null,
        heightInches: parseWholeNumber(form.heightInches),
        weightLb: parseWholeNumber(form.weightLb),
        bodyType: normalizeBodyTypeValue(form.bodyType),
        rulesAccepted: agreedToTerms,
        moderationPassed: !moderationUnavailable,
      });

      const wasAutoApproved = (response as Record<string, unknown>).autoApproved === true;

      setForm(mapProfileToForm(response.profile));
      setProfileId(response.profile?.id ?? profileId);
      setProfileStatus(response.profile?.status ?? profileStatus);
      setSaveState("success");

      toast({
        title: moderationUnavailable
          ? "Changes saved for review"
          : wasAutoApproved
            ? "Profile approved"
            : "Changes saved",
        description: moderationUnavailable
          ? "Screening was unavailable — sent for manual review."
          : wasAutoApproved
            ? "Your changes passed review and your profile is live."
            : "Your profile has been updated.",
      });

      window.setTimeout(() => setSaveState("idle"), 3200);
    } catch (error) {
      setSaveState("idle");
      toast({ title: "Could not save right now", description: getApiErrorMessage(error, "Review the fields and try again."), variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-32 md:p-8">

      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Fill in each section — your profile goes live after admin approval.</p>
      </div>

      {/* Status banner */}
      {profileStatus === "pending_approval" && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
          Your profile is in the review queue. New edits follow the same process.
        </div>
      )}

      {/* Flagged banner */}
      {saveState === "flagged" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold text-rose-900">Text held by safety filter</p>
            <p className="mt-1 text-rose-800">{flagReason} Your public profile was not changed.</p>
          </div>
        </motion.div>
      )}

      {/* ── Section 1: Identity ─────────────────────────────── */}
      <SectionCard id="identity" icon={User} title="Identity & Display" subtitle="Your public name and how you present yourself">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel required>Display Name</FieldLabel>
            <input
              className={inputCls()}
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="Professional alias shown on your listing"
            />
          </Field>
          <Field>
            <FieldLabel>Phone</FieldLabel>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input className={inputCls("pl-10")} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 2: Bio ──────────────────────────────────── */}
      <SectionCard id="bio" icon={Bot} title="About Me" subtitle="Your experience, style, and what clients can expect">
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel required>Profile Description</FieldLabel>
            <button
              type="button"
              onClick={handleKnottyAIMagic}
              disabled={isAiLoading || form.bio.trim().length < 10}
              className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100 disabled:opacity-40"
            >
              {isAiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              AI Polish
            </button>
          </div>
          <textarea
            className={`${inputCls()} min-h-[160px] resize-none leading-relaxed`}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Share your experience, massage style, pressure preference, specialties, and what clients can expect…"
            maxLength={2000}
          />
          <p className="text-xs text-slate-400 text-right">{form.bio.length}/2000</p>
        </Field>
      </SectionCard>

      {/* ── Section 3: Location ─────────────────────────────── */}
      <SectionCard id="location" icon={MapPin} title="Location" subtitle="Where you offer services — auto-fills from ZIP code">
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <Field>
            <FieldLabel>ZIP Code</FieldLabel>
            <div className="relative">
              <input
                className={inputCls("pr-10")}
                inputMode="numeric"
                maxLength={5}
                value={form.zipCode}
                onChange={(e) => handleZipChange(e.target.value)}
                placeholder="10001"
              />
              {zipStatus && (
                <span className={`absolute right-3 top-3 text-xs font-medium ${zipStatus.startsWith("✓") ? "text-emerald-600" : "text-slate-400"}`}>
                  {zipStatus.startsWith("✓") ? <CheckCircle2 className="h-4 w-4" /> : null}
                </span>
              )}
            </div>
            {zipStatus && <p className={`text-xs ${zipStatus.startsWith("✓") ? "text-emerald-600" : "text-slate-400"}`}>{zipStatus.replace(/^✓\s*/, "")}</p>}
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel required>City</FieldLabel>
              <input className={inputCls()} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="New York" />
            </Field>
            <Field>
              <FieldLabel>State</FieldLabel>
              <select className={inputCls()} value={form.state} onChange={(e) => set("state", e.target.value)}>
                <option value="">State</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field>
              <FieldLabel>Neighborhood</FieldLabel>
              <input className={inputCls()} value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="Chelsea (optional)" />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* ── Section 4: Services & Pricing ───────────────────── */}
      <SectionCard id="services" icon={DollarSign} title="Services & Pricing" subtitle="Select your massage types and set your rates">
        <Field>
          <FieldLabel>Massage Services</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((service) => {
              const active = form.specialties.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {active && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {service}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field>
            <FieldLabel>Location Type</FieldLabel>
            <div className="flex flex-col gap-2">
              {(["incall", "outcall", "both"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("locationType", type)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    form.locationType === type
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {type === "incall" ? "Incall only" : type === "outcall" ? "Outcall only" : "Both incall & outcall"}
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel>Incall Price ($/hr)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-3 text-sm text-slate-400">$</span>
              <input type="number" min="0" className={inputCls("pl-7")} value={form.incallPrice} onChange={(e) => set("incallPrice", e.target.value)} placeholder="150" />
            </div>
          </Field>
          <Field>
            <FieldLabel>Outcall Price ($/hr)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-3 text-sm text-slate-400">$</span>
              <input type="number" min="0" className={inputCls("pl-7")} value={form.outcallPrice} onChange={(e) => set("outcallPrice", e.target.value)} placeholder="220" />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 5: Contact ──────────────────────────────── */}
      <SectionCard id="contact" icon={MessageCircle} title="Contact Details" subtitle="How clients can reach you — these appear on your public profile">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel>WhatsApp</FieldLabel>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input className={inputCls("pl-10")} type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+1 555 000 0000" />
            </div>
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input className={inputCls("pl-10")} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </div>
          </Field>
          <Field>
            <FieldLabel>Website or Booking Link</FieldLabel>
            <div className="relative">
              <Globe className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input className={inputCls("pl-10")} type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yoursite.com" />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 6: Body Details ─────────────────────────── */}
      <SectionCard id="body" icon={Ruler} title="Body Details" subtitle="Optional — helps clients find the right match">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field>
            <FieldLabel>Height</FieldLabel>
            <input
              type="number"
              min="54"
              max="90"
              className={inputCls()}
              value={form.heightInches}
              onChange={(e) => set("heightInches", e.target.value)}
              placeholder={`e.g. 72 = 6'0"`}
            />
            {form.heightInches && (
              <p className="text-xs text-slate-400">
                {(() => {
                  const n = Number(form.heightInches);
                  if (!n) return "";
                  return `${Math.floor(n / 12)}'${n % 12}" / ${Math.round(n * 2.54)} cm`;
                })()}
              </p>
            )}
          </Field>
          <Field>
            <FieldLabel>Weight (lb)</FieldLabel>
            <div className="relative">
              <Scale className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input type="number" min="80" max="450" className={inputCls("pl-10")} value={form.weightLb} onChange={(e) => set("weightLb", e.target.value)} placeholder="180" />
            </div>
            {form.weightLb && <p className="text-xs text-slate-400">{Math.round(Number(form.weightLb) * 0.453592)} kg</p>}
          </Field>
          <Field>
            <FieldLabel>Body Type</FieldLabel>
            <select className={inputCls()} value={form.bodyType} onChange={(e) => set("bodyType", e.target.value)}>
              <option value="">Select</option>
              {BODY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </SectionCard>

      {/* ── Submit bar ──────────────────────────────────────── */}
      <div className="sticky bottom-6 z-30 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:flex sm:items-center sm:justify-between sm:gap-4">
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span>
            I confirm my profile follows the{" "}
            <Link href="/legal" className="font-semibold text-slate-900 underline underline-offset-2">platform rules</Link>{" "}
            and content guidelines.
          </span>
        </label>

        <button
          type="button"
          onClick={handleSaveAndScan}
          disabled={!agreedToTerms || saveState === "scanning"}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all sm:mt-0 sm:min-w-[180px] sm:w-auto ${
            saveState === "success"
              ? "bg-emerald-500 text-white"
              : saveState === "flagged"
                ? "bg-rose-500 text-white"
                : agreedToTerms
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          {saveState === "idle" && <><Save className="h-4 w-4" /> Save & Submit</>}
          {saveState === "scanning" && (
            <>
              <motion.div
                animate={{ x: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-0.5 w-4 rounded-full bg-sky-300"
              />
              Scanning {scanLabel}…
            </>
          )}
          {saveState === "success" && <><CheckCircle2 className="h-4 w-4" /> Saved!</>}
          {saveState === "flagged" && <><ShieldAlert className="h-4 w-4" /> Flagged</>}
        </button>
      </div>
    </div>
  );
}
