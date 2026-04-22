"use client";

import { useState } from "react";
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
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!form.phone.trim() || form.phone.length < 10) {
      setError("A valid phone number is required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!termsChecked) {
      setError("You must accept the Terms of Service.");
      return;
    }
    if (!complianceChecked) {
      setError("You must acknowledge the Therapist Agreement and platform policies.");
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Your full legal name"
                required
              />
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
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <PhoneInput
                id="phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="(555) 000-0000"
              />
              <p className="text-xs text-muted-foreground">Required for verification. Select your country to auto-fill the code.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordInput
                id="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                showStrength
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <PasswordInput
                id="confirmPassword"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 bg-bg-subtle/30 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={termsChecked}
                  onCheckedChange={(v) => setTermsChecked(v === true)}
                />
                <Label htmlFor="terms" className="text-sm leading-snug">
                  I agree to the{" "}
                  <Link href="/terms" className="text-brand-secondary underline" target="_blank">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-brand-secondary underline" target="_blank">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="compliance"
                  checked={complianceChecked}
                  onCheckedChange={(v) => setComplianceChecked(v === true)}
                />
                <Label htmlFor="compliance" className="text-sm leading-snug">
                  I acknowledge the{" "}
                  <Link href="/therapist-agreement" className="text-brand-secondary underline" target="_blank">
                    Therapist Agreement
                  </Link>{" "}
                  and platform policies
                </Label>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
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
