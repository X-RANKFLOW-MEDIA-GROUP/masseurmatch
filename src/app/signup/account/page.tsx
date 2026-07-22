"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAuth } from "@/contexts/AuthContext";
import { useSignup } from "../_lib/signup-context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type FieldErrors = Record<string, string>;

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

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  const validateField = useCallback((field: string): string | null => {
    switch (field) {
      case "fullName":
        return form.fullName.trim() ? null : "Full name is required.";
      case "email":
        if (!form.email.trim()) return "Email is required.";
        return EMAIL_RE.test(form.email.trim()) ? null : "Enter a valid email address.";
      case "phone":
        return form.phone.replace(/\D/g, "").length >= 10
          ? null
          : "A valid phone number is required.";
      case "password":
        return form.password.length >= 8 ? null : "Password must be at least 8 characters.";
      case "confirmPassword":
        return form.password === form.confirmPassword ? null : "Passwords do not match.";
      case "terms":
        return termsChecked ? null : "You must accept the Terms of Service.";
      case "compliance":
        return complianceChecked ? null : "You must accept the Therapist Agreement and platform policies.";
      case "age":
        return ageChecked ? null : "You must confirm that you are at least 18 years old.";
      default:
        return null;
    }
  }, [ageChecked, complianceChecked, form, termsChecked]);

  function handleBlur(field: string) {
    const message = validateField(field);
    setFieldErrors((current) => {
      const next = { ...current };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  function validateAll() {
    const fields = ["fullName", "email", "phone", "password", "confirmPassword", "terms", "compliance", "age"];
    return fields.reduce<FieldErrors>((errors, field) => {
      const message = validateField(field);
      if (message) errors[field] = message;
      return errors;
    }, {});
  }

  function focusFirstInvalid(errors: FieldErrors) {
    const first = ["fullName", "email", "phone", "password", "confirmPassword", "terms", "compliance", "age"]
      .find((field) => Boolean(errors[field]));
    if (first) formRef.current?.querySelector<HTMLElement>(`#${first}`)?.focus();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const errors = validateAll();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstInvalid(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(form.email.trim(), form.password, form.fullName.trim());
      if (result.error) {
        const normalized = result.error.message.toLowerCase();
        if (normalized.includes("already exists") || normalized.includes("already registered") || normalized.includes("user_exists")) {
          router.replace(`/login?email=${encodeURIComponent(form.email.trim())}&account_exists=1`);
          return;
        }
        setError(result.error.message);
        return;
      }

      setAccountInfo({
        fullName: form.fullName.trim(),
        displayName: form.displayName.trim() || form.fullName.trim(),
        email: form.email.trim(),
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

  const checkboxError = (id: string) => fieldErrors[id] ? (
    <p id={`${id}-error`} role="alert" className="pl-7 text-xs text-destructive">{fieldErrors[id]}</p>
  ) : null;

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Create Your Account</h1>
        <p className="mt-3 text-muted-foreground">Set up your login details, then complete your profile at your own pace.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} onBlur={() => handleBlur("fullName")} placeholder="Your full legal name" aria-invalid={Boolean(fieldErrors.fullName)} />
              {fieldErrors.fullName && <p role="alert" className="text-xs text-destructive">{fieldErrors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={form.displayName} onChange={(event) => updateField("displayName", event.target.value)} placeholder="Public professional name" />
              <p className="text-xs text-muted-foreground">This is the name shown on your public profile.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} onBlur={() => handleBlur("email")} placeholder="you@example.com" aria-invalid={Boolean(fieldErrors.email)} />
              {fieldErrors.email && <p role="alert" className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <PhoneInput id="phone" value={form.phone} onChange={(value) => updateField("phone", value)} onBlur={() => handleBlur("phone")} placeholder="(555) 000-0000" aria-invalid={Boolean(fieldErrors.phone)} />
              {fieldErrors.phone ? <p role="alert" className="text-xs text-destructive">{fieldErrors.phone}</p> : <p className="text-xs text-muted-foreground">Used for account and verification notices.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordInput id="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} onBlur={() => handleBlur("password")} placeholder="At least 8 characters" minLength={8} showStrength aria-invalid={Boolean(fieldErrors.password)} />
              {fieldErrors.password && <p role="alert" className="text-xs text-destructive">{fieldErrors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <PasswordInput id="confirmPassword" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} onBlur={() => handleBlur("confirmPassword")} placeholder="Re-enter your password" minLength={8} aria-invalid={Boolean(fieldErrors.confirmPassword)} />
              {fieldErrors.confirmPassword && <p role="alert" className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
            </div>

            <div className="space-y-4 rounded-xl border border-border/60 bg-bg-subtle/30 p-4">
              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={termsChecked} onCheckedChange={(value) => setTermsChecked(value === true)} />
                  <Label htmlFor="terms" className="text-sm leading-snug">
                    I agree to the <Link href="/terms" target="_blank" className="text-brand-secondary underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="text-brand-secondary underline">Privacy Policy</Link>.
                  </Label>
                </div>
                {checkboxError("terms")}
              </div>

              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <Checkbox id="compliance" checked={complianceChecked} onCheckedChange={(value) => setComplianceChecked(value === true)} />
                  <Label htmlFor="compliance" className="text-sm leading-snug">
                    I accept the <Link href="/therapist-agreement" target="_blank" className="text-brand-secondary underline">Therapist Agreement</Link> and platform policies.
                  </Label>
                </div>
                {checkboxError("compliance")}
              </div>

              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <Checkbox id="age" checked={ageChecked} onCheckedChange={(value) => setAgeChecked(value === true)} />
                  <Label htmlFor="age" className="text-sm leading-snug">I confirm that I am at least 18 years old.</Label>
                </div>
                {checkboxError("age")}
              </div>
            </div>

            {error && <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating Account…" : "Continue"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-brand-secondary underline">Log in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
