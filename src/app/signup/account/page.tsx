"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordInput } from "@/components/ui/password-input";
import { useSignup } from "../_lib/signup-context";
import { useAuth } from "@/contexts/AuthContext";

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
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on edit
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
        case "phone":
          return !form.phone.trim() || form.phone.length < 10
            ? "A valid phone number is required."
            : null;
        case "password":
          return form.password.length < 8
            ? "Password must be at least 8 characters."
            : null;
        case "confirmPassword":
          return form.password !== form.confirmPassword
            ? "Passwords do not match."
            : null;
        case "terms":
          return termsChecked ? null : "You must accept the Terms of Service.";
        case "compliance":
          return complianceChecked
            ? null
            : "You must acknowledge the Therapist Agreement and platform policies.";
        default:
          return null;
      }
    },
    [form, termsChecked, complianceChecked],
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
    const fields = ["fullName", "email", "phone", "password", "confirmPassword", "terms", "compliance"];
    const errors: FieldErrors = {};
    for (const f of fields) {
      const msg = validateField(f);
      if (msg) errors[f] = msg;
    }
    return errors;
  }

  function focusFirstInvalid(errors: FieldErrors) {
    const order = ["fullName", "email", "phone", "password", "confirmPassword", "terms", "compliance"];
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
        setError(result.error.message);
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

      router.push("/signup/verify");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Create Your Account
        </h1>
        <p className="mt-3 text-muted-foreground">
          Set up your login details to continue your profile registration.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                placeholder="Public alias (optional)"
              />
              <p className="text-xs text-muted-foreground">This is the name shown on your public profile.</p>
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <PhoneInput
                id="phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                onBlur={() => handleBlur("phone")}
                placeholder="(555) 000-0000"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              />
              {fieldErrors.phone ? (
                <p id="phone-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.phone}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Required for verification. Select your country to auto-fill the code.</p>
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

            <div className="space-y-3 rounded-xl border border-border/60 bg-bg-subtle/30 p-4">
              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsChecked}
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
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating Account…" : "Continue to Verification"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-secondary underline">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
