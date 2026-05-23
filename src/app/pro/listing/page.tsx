"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import { updateProfileMutation, type ProProfileMutationResponse } from "@/app/_lib/mutations";
import { ApiError, postJson, requestJson } from "@/app/_lib/request";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BODY_TYPE_OPTIONS, normalizeBodyTypeValue } from "@/lib/physical-profile";

const SERVICE_OPTIONS = [
  "Deep Tissue",
  "Swedish",
  "Sports",
  "Trigger Point",
  "Prenatal",
  "Reflexology",
  "Hot Stone",
];

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
  specialties: string[];
  incallPrice: string;
  outcallPrice: string;
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
  city: "",
  state: "",
  phone: "",
  specialties: [],
  incallPrice: "",
  outcallPrice: "",
  heightInches: "",
  weightLb: "",
  bodyType: "",
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
    specialties: profile.specialties || [],
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

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const payload = error.payload;

    if (payload && typeof payload === "object") {
    const fieldErrors =
        "details" in payload && Array.isArray((payload as { details?: unknown }).details)
          ? ((payload as { details: Array<{ message?: string }> }).details ?? [])
          : [];

      if (fieldErrors.length > 0 && fieldErrors[0]?.message) {
        return fieldErrors[0].message;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function formatReason(reason?: string | null) {
  if (!reason) {
    return "AI flagged language outside profile quality guidelines.";
  }

  return reason.split("_").join(" ");
}

async function moderateTextField(profileId: string, fieldName: string, text: string): Promise<ModerationResult> {
  if (!text.trim()) {
    return { approved: true };
  }

  const { data, error } = await supabase.functions.invoke("moderate-text", {
    body: {
      profile_id: profileId,
      text,
      field_name: fieldName,
    },
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

  const toggleService = (service: string) => {
    setForm((current) => ({
      ...current,
      specialties: current.specialties.includes(service)
        ? current.specialties.filter((item) => item !== service)
        : [...current.specialties, service],
    }));
  };

  const handleKnottyAIMagic = async () => {
    if (form.bio.trim().length < 10) {
      return;
    }

    setIsAiLoading(true);
    await delay(1200);
    setForm((current) => ({
      ...current,
      bio: "Com foco em conforto, tecnica e discricao, ofereco sessoes personalizadas para relaxamento profundo e alivio de tensao muscular. Trabalho com atendimento profissional, ritmo acolhedor e comunicacao clara para que cada cliente se sinta seguro durante toda a experiencia.",
    }));
    setIsAiLoading(false);
  };

  const handleSaveAndScan = async () => {
    if (!profileId) {
      toast({
        title: "Profile unavailable",
        description: "Reload the page before saving changes.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Confirm profile rules",
        description: "Check the agreement box before submitting changes.",
        variant: "destructive",
      });
      return;
    }

    const startedAt = Date.now();
    setSaveState("scanning");
    setFlagReason("");

    try {
      let moderationUnavailable = false;
      const moderationChecks = [
        {
          fieldName: "display_name",
          label: "display name",
          text: form.displayName,
        },
        {
          fieldName: "bio",
          label: "bio",
          text: form.bio,
        },
        {
          fieldName: "specialties",
          label: "services",
          text: form.specialties.join(", "),
        },
      ];

      for (const check of moderationChecks) {
        setScanLabel(check.label);
        const moderation = await moderateTextField(profileId, check.fieldName, check.text);

        if (moderation.unavailable) {
          moderationUnavailable = true;
        }

        if (!moderation.approved) {
          const reason = formatReason(moderation.reason);
          try {
            await postJson("/api/pro/profile/flag", {
              displayName: form.displayName,
              bio: form.bio,
              city: form.city,
              state: form.state || null,
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
          if (remaining > 0) {
            await delay(remaining);
          }

          setFlagReason(reason);
          setSaveState("flagged");
          toast({
            title: "Content held for manual review",
            description: "Your current public version remains unchanged. The team may review flagged text.",
            variant: "destructive",
          });
          return;
        }
      }

      const remaining = Math.max(0, 1600 - (Date.now() - startedAt));
      if (remaining > 0) {
        await delay(remaining);
      }

      const response = await updateProfileMutation({
        displayName: form.displayName,
        bio: form.bio,
        city: form.city,
        state: form.state || null,
        phone: form.phone || null,
        specialties: form.specialties,
        incallPrice: parsePrice(form.incallPrice),
        outcallPrice: parsePrice(form.outcallPrice),
        heightInches: parseWholeNumber(form.heightInches),
        weightLb: parseWholeNumber(form.weightLb),
        bodyType: normalizeBodyTypeValue(form.bodyType),
      });

      setForm(mapProfileToForm(response.profile));
      setProfileId(response.profile?.id ?? profileId);
      setProfileStatus(response.profile?.status ?? profileStatus);
      setSaveState("success");
      toast({
        title: moderationUnavailable
          ? "Changes saved for review"
          : "Automated screening passed",
        description: moderationUnavailable
          ? "Automated screening was unavailable, so we sent everything for manual review."
          : "Your text passed automated screening and was sent to the review queue.",
      });

      window.setTimeout(() => {
        setSaveState("idle");
      }, 3200);
    } catch (error) {
      setSaveState("idle");
      toast({
        title: "Could not save right now",
        description: getApiErrorMessage(error, "Review the fields and try again."),
        variant: "destructive",
      });
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
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-32 md:p-10">
      <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <Bot className="h-5 w-5 text-slate-700" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-lg font-medium text-slate-900">
            AI quality guard is active
          </h2>
          <p className="font-sans text-sm leading-relaxed text-slate-600">
            All profile text is screened before review.
            A triagem bloqueia linguagem sexual explicita, promessas enganosas, contato direto e
            termos fora do padrao premium da plataforma.
          </p>
        </div>
      </div>

      {profileStatus === "pending_approval" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h3 className="font-sans text-sm font-semibold text-amber-900">Profile under review</h3>
            <p className="mt-1 font-sans text-sm leading-relaxed text-amber-800">
              Your listing is already in the human review queue. New updates follow the same process until final approval.
            </p>
          </div>
        </div>
      )}

      <div className="sticky top-4 z-30 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="font-display text-2xl font-medium text-slate-900">Edit my profile</h1>
            <p className="mt-1 font-sans text-sm text-slate-500">
              Refine your copy, confirm the rules, and let AI validate before submission.
            </p>
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(event) => setAgreedToTerms(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="leading-relaxed">
              I have read and agree to profile quality rules and automated screening. See the{" "}
              <Link href="/legal" className="font-semibold text-slate-900 underline underline-offset-4">
                Legal Center
              </Link>{" "}
              for full policies.
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleSaveAndScan}
          disabled={!agreedToTerms || saveState === "scanning"}
          className={`flex min-w-[230px] items-center justify-center gap-2 rounded-xl px-6 py-3 font-sans text-sm font-semibold transition-all ${
            saveState === "success"
              ? "bg-emerald-500 text-white"
              : saveState === "flagged"
                ? "bg-rose-500 text-white"
                : agreedToTerms
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          {saveState === "idle" && (
            <>
              <Save className="h-4 w-4" />
              Submit changes
            </>
          )}

          {saveState === "scanning" && (
            <>
              <motion.div
                animate={{ x: [-16, 16, -16] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="h-0.5 w-5 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.85)]"
              />
              Sightengine reviewing {scanLabel}
            </>
          )}

          {saveState === "success" && (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Passed and submitted
            </>
          )}

          {saveState === "flagged" && (
            <>
              <ShieldAlert className="h-4 w-4" />
              Held for review
            </>
          )}
        </button>
      </div>

      {saveState === "flagged" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <h3 className="font-sans text-sm font-semibold text-rose-900">
              Text held by safety filter
            </h3>
            <p className="mt-1 font-sans text-sm leading-relaxed text-rose-800">
              {flagReason} Your public profile was not changed. We recorded this attempt for manual team review.
            </p>
          </div>
        </motion.div>
      )}

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-medium text-slate-900">
              About me
              <FileText className="h-4 w-4 text-slate-400" />
            </h2>
            <p className="mt-1 font-sans text-sm text-slate-500">
              Write clearly with a professional tone and focus on real experience.
            </p>
          </div>

          <button
            type="button"
            onClick={handleKnottyAIMagic}
            disabled={isAiLoading || form.bio.trim().length < 10}
            className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 font-mono text-xs uppercase tracking-wider text-sky-700 transition-colors hover:bg-sky-100 disabled:opacity-50"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Improving copy
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Use AI polish
              </>
            )}
          </button>
        </div>

        <textarea
          value={form.bio}
          onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
          className="min-h-40 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-sans leading-relaxed text-slate-700 outline-none transition-colors focus:border-slate-400"
          placeholder="Share your experience, service style, and what clients can expect from a session."
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Display name
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayName: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-sans text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
              placeholder="Como voce quer aparecer no marketplace"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Telefone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-sans text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
              placeholder="+1 555 123 4567"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Cidade
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-10 font-sans text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
                placeholder="Dallas"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Estado
            </label>
            <input
              type="text"
              value={form.state}
              onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-sans text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
              placeholder="Texas"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Preco incall
            </label>
            <input
              type="number"
              min="0"
              value={form.incallPrice}
              onChange={(event) =>
                setForm((current) => ({ ...current, incallPrice: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
              placeholder="150"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Preco outcall
            </label>
            <input
              type="number"
              min="0"
              value={form.outcallPrice}
              onChange={(event) =>
                setForm((current) => ({ ...current, outcallPrice: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
              placeholder="220"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Altura (in)
            </label>
            <input
              type="number"
              min="48"
              max="96"
              value={form.heightInches}
              onChange={(event) =>
                setForm((current) => ({ ...current, heightInches: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
              placeholder={`72 = 6'0"`}
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Peso (lb)
            </label>
            <input
              type="number"
              min="80"
              max="450"
              value={form.weightLb}
              onChange={(event) =>
                setForm((current) => ({ ...current, weightLb: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
              placeholder="180"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Tipo de corpo
            </label>
            <select
              value={form.bodyType}
              onChange={(event) =>
                setForm((current) => ({ ...current, bodyType: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-sans text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
            >
              <option value="">Select</option>
              {BODY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="font-display text-xl font-medium text-slate-900">Especialidades</h2>
          <p className="mt-1 font-sans text-sm text-slate-500">
            Escolha os servicos que melhor representam seu atendimento.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {SERVICE_OPTIONS.map((service) => {
            const active = form.specialties.includes(service);

            return (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={`rounded-full border px-4 py-2.5 font-sans text-sm transition-all ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {active && <CheckCircle2 className="mb-0.5 mr-1.5 inline-block h-4 w-4" />}
                {service}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
