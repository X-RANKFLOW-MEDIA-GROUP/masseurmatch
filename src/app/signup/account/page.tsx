"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordInput } from "@/components/ui/password-input";
import { useSignup } from "../_lib/signup-context";
import { useAuth } from "@/contexts/AuthContext";
import { BRAND_ASSETS } from "@/lib/brand";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10,}$/;

type FieldErrors = Record<string, string>;

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Reviewed profiles",
    copy: "Every profile is reviewed before it appears publicly.",
  },
  {
    icon: MessageCircle,
    title: "Direct client contact",
    copy: "Clients contact you directly. No booking middleman.",
  },
  {
    icon: Sparkles,
    title: "LGBTQ+ affirming",
    copy: "A directory designed for inclusive, professional discovery.",
  },
  {
    icon: UserRoundCheck,
    title: "Built for your practice",
    copy: "Show your expertise, rates, service area, and availability.",
  },
] as const;

export default function SignupAccountPage() {
  const router = useRouter();
  const {
    state,
    setAccountInfo,
    markAccountCreated,
    setTermsAccepted,
    setComplianceAcknowledged,
    setAgeAndConductAttested,
  } = useSignup();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    fullName: state.fullName || "",
    displayName: state.displayName || "",
    email: state.email || "",
    phone: state.phone || "",
    password: "",
    confirmPassword: "",
  });
  const [termsChecked, setTermsChecked] = useState(state.termsAccepted);
  const [complianceChecked, setComplianceChecked] = useState(state.complianceAcknowledged);
  const [ageChecked, setAgeChecked] = useState(state.ageAndConductAttested);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  const validateField = useCallback(
    (field: string): string | null => {
      switch (field) {
        case "fullName":
          return form.fullName.trim() ? null : "Full name is required.";
        case "email":
          if (!form.email.trim()) return "Email is required.";
          if (!EMAIL_RE.test(form.email.trim())) return "Enter a valid email address.";
          return null;
        case "phone": {
          const cleaned = form.phone.replace(/\D/g, "");
          return !cleaned || cleaned.length < 10
            ? "A valid phone number is required (at least 10 digits)."
            : null;
        }
        case "password":
          return form.password.length < 8 ? "Password must be at least 8 characters." : null;
        case "confirmPassword":
          return form.password !== form.confirmPassword ? "Passwords do not match." : null;
        case "terms":
          return termsChecked ? null : "You must accept the Terms of Service.";
        case "compliance":
          return complianceChecked
            ? null
            : "You must acknowledge the Therapist Agreement and platform policies.";
        case "age":
          return ageChecked
            ? null
            : "You must confirm you are 18+ and will not offer sexual services.";
        default:
          return null;
      }
    },
    [form, termsChecked, complianceChecked, ageChecked],
  );

  function handleBlur(field: string) {
    const msg = validateField(field);
    setFieldErrors((prev) => {
      if (msg) return { ...prev, [field]: msg };
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateAll(): FieldErrors {
    const fields = [
      "fullName",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "terms",
      "compliance",
      "age",
    ];
    const errors: FieldErrors = {};
    for (const f of fields) {
      const msg = validateField(f);
      if (msg) errors[f] = msg;
    }
    return errors;
  }

  function focusFirstInvalid(errors: FieldErrors) {
    const order = [
      "fullName",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "terms",
      "compliance",
      "age",
    ];
    for (const f of order) {
      if (errors[f]) {
        const el = formRef.current?.querySelector<HTMLElement>(`#${f}`);
        el?.focus();
        return;
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errors = validateAll();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstInvalid(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(form.email, form.password, form.fullName);
      if (result.error) {
        setError(result.error.message?.trim() || "We couldn't create your account. Please try again.");
        setLoading(false);
        return;
      }

      setAccountInfo({
        fullName: form.fullName,
        displayName: form.displayName || form.fullName,
        email: form.email,
        phone: form.phone,
      });
      markAccountCreated();
      setTermsAccepted(termsChecked);
      setComplianceAcknowledged(complianceChecked);
      setAgeAndConductAttested(ageChecked);

      router.push("/signup/verify");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-8 pt-2">
      <div className="grid overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[var(--shadow-lg)] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative order-2 min-h-[420px] overflow-hidden bg-brand-primary text-white lg:order-1 lg:min-h-[860px]">
          <Image
            src={BRAND_ASSETS.heroPoster}
            alt="Professional massage therapy room"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/62 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/15" />

          <div className="relative flex h-full min-h-[420px] flex-col justify-between p-7 sm:p-10 lg:min-h-[860px] lg:p-12">
            <div className="max-w-xl pt-3 lg:pt-12">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/75">
                Grow your practice
              </p>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
                Build a profile that helps the right clients find you.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/82 sm:text-lg">
                Join MasseurMatch, present your practice professionally, and connect directly with
                clients searching by location, specialty, availability, and pricing.
              </p>
            </div>

            <div className="mt-8 space-y-7 lg:mt-0">
              <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid">
                {BENEFITS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/12 bg-black/30 p-4 backdrop-blur-sm"
                  >
                    <item.icon className="h-5 w-5 text-white" aria-hidden="true" />
                    <h2 className="mt-3 text-sm font-semibold text-white">{item.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-white/68">{item.copy}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/12 bg-black/35 p-5 backdrop-blur-sm">
                <p className="text-sm leading-relaxed text-white/80">
                  “MasseurMatch gives independent therapists a professional place to be discovered
                  without putting a booking platform between the provider and the client.”
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                  Direct provider discovery
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 bg-card px-5 py-7 sm:px-8 sm:py-10 lg:order-2 lg:px-10 lg:py-12">
          <div className="mx-auto max-w-xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary">
                Therapist signup
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Create your therapist account
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Set up your secure login first. You will verify your identity and complete your
                public profile in the next steps.
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    placeholder="Your full legal name"
                    required
                    aria-invalid={!!fieldErrors.fullName}
                    aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
                  />
                  {fieldErrors.fullName && (
                    <p id="fullName-error" role="alert" className="text-xs text-destructive">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="displayName">Professional / Display Name</Label>
                  <Input
                    id="displayName"
                    value={form.displayName}
                    onChange={(e) => updateField("displayName", e.target.value)}
                    placeholder="Public name shown on your profile"
                  />
                  <p className="text-xs text-muted-foreground">Optional. Defaults to your full name.</p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@example.com"
                    required
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  />
                  {fieldErrors.email && (
                    <p id="email-error" role="alert" className="text-xs text-destructive">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <PhoneInput
                    id="phone"
                    value={form.phone}
                    onChange={(value) => updateField("phone", value)}
                    onBlur={() => handleBlur("phone")}
                    placeholder="(555) 000-0000"
                    required
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                  />
                  {fieldErrors.phone ? (
                    <p id="phone-error" role="alert" className="text-xs text-destructive">
                      {fieldErrors.phone}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Required for verification. Select your country to auto-fill the code.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <PasswordInput
                    id="password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    showStrength
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  />
                  {fieldErrors.password && (
                    <p id="password-error" role="alert" className="text-xs text-destructive">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Re-enter your password"
                    required
                    minLength={8}
                    aria-invalid={!!fieldErrors.confirmPassword}
                    aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                  />
                  {fieldErrors.confirmPassword && (
                    <p id="confirmPassword-error" role="alert" className="text-xs text-destructive">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <Card className="border-border/70 bg-bg-subtle/45 shadow-none">
                <CardContent className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Before you continue</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        MasseurMatch is a directory. Providers remain independent and clients contact
                        providers directly outside the platform.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={termsChecked}
                        required
                        aria-required="true"
                        aria-invalid={!!fieldErrors.terms}
                        aria-describedby={fieldErrors.terms ? "terms-error" : undefined}
                        onCheckedChange={(v) => {
                          setTermsChecked(v === true);
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.terms;
                            return next;
                          });
                        }}
                      />
                      <Label htmlFor="terms" className="text-sm leading-snug">
                        I agree to the{" "}
                        <Link href="/terms" className="text-brand-secondary underline" target="_blank" rel="noopener noreferrer">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-brand-secondary underline" target="_blank" rel="noopener noreferrer">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {fieldErrors.terms && (
                      <p id="terms-error" role="alert" className="pl-7 text-xs text-destructive">
                        {fieldErrors.terms}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="compliance"
                        checked={complianceChecked}
                        required
                        aria-required="true"
                        aria-invalid={!!fieldErrors.compliance}
                        aria-describedby={fieldErrors.compliance ? "compliance-error" : undefined}
                        onCheckedChange={(v) => {
                          setComplianceChecked(v === true);
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.compliance;
                            return next;
                          });
                        }}
                      />
                      <Label htmlFor="compliance" className="text-sm leading-snug">
                        I acknowledge the{" "}
                        <Link href="/therapist-agreement" className="text-brand-secondary underline" target="_blank" rel="noopener noreferrer">
                          Therapist Agreement
                        </Link>{" "}
                        and platform policies
                      </Label>
                    </div>
                    {fieldErrors.compliance && (
                      <p id="compliance-error" role="alert" className="pl-7 text-xs text-destructive">
                        {fieldErrors.compliance}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="age"
                        checked={ageChecked}
                        required
                        aria-required="true"
                        aria-invalid={!!fieldErrors.age}
                        aria-describedby={fieldErrors.age ? "age-error" : undefined}
                        onCheckedChange={(v) => {
                          setAgeChecked(v === true);
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.age;
                            return next;
                          });
                        }}
                      />
                      <Label htmlFor="age" className="text-sm leading-snug">
                        I confirm I am at least 18 years old and that I provide professional,
                        non-sexual massage therapy only. I will not use MasseurMatch to offer,
                        solicit, or arrange sexual services.
                      </Label>
                    </div>
                    {fieldErrors.age && (
                      <p id="age-error" role="alert" className="pl-7 text-xs text-destructive">
                        {fieldErrors.age}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {error && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating Account…" : "Create Account & Continue"}
              </Button>

              <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  After account creation, you will verify your email and identity, build your
                  profile, and submit it for review before it can go live.
                </p>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-brand-secondary underline">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
