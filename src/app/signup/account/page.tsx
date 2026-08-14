"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, UserRoundPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAuth } from "@/contexts/AuthContext";
import { useSignup } from "../_lib/signup-context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupAccountPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const {
    state,
    setAccountInfo,
    markAccountCreated,
    setTermsAccepted,
    setComplianceAcknowledged,
    setAgeAndConductAttested,
  } = useSignup();

  const [form, setForm] = useState({
    fullName: state.fullName || "",
    displayName: state.displayName || "",
    email: state.email || "",
    phone: state.phone || "",
    password: "",
    confirmPassword: "",
  });
  const [terms, setTerms] = useState(state.termsAccepted);
  const [policies, setPolicies] = useState(state.complianceAcknowledged);
  const [adult, setAdult] = useState(state.ageAndConductAttested);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!form.fullName.trim()) return setError("Enter your full name.");
    if (!EMAIL_RE.test(form.email.trim())) return setError("Enter a valid email address.");
    if (phoneDigits.length < 10) return setError("Enter a valid phone number.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!terms || !policies || !adult) return setError("Accept the required account terms to continue.");

    setLoading(true);
    try {
      const result = await signUp(
        form.email.trim(),
        form.password,
        form.fullName.trim(),
        form.phone.trim(),
      );
      if (result.error) {
        setError(result.error.message || "We could not create your account.");
        return;
      }

      setAccountInfo({
        fullName: form.fullName.trim(),
        displayName: form.displayName.trim() || form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone,
      });
      markAccountCreated();
      setTermsAccepted(terms);
      setComplianceAcknowledged(policies);
      setAgeAndConductAttested(adult);
      router.push("/signup/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl py-4 sm:py-8">
      <div className="grid overflow-hidden rounded-[28px] border border-border bg-background shadow-[var(--shadow-lg)] lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="bg-slate-950 p-7 text-white sm:p-9 lg:p-10">
          <div className="flex h-full flex-col justify-between gap-10">
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <UserRoundPlus className="h-5 w-5" />
              </div>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Create your account</p>
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
                Get listed without the signup maze.
              </h1>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Create your secure login, verify your contact details, then complete your public therapist profile.
              </p>
            </div>

            <div className="space-y-4 text-sm text-white/78">
              <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Direct client contact outside MasseurMatch.</div>
              <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Location, pricing, availability, and travel visibility.</div>
              <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Profile review before public listing.</div>
            </div>
          </div>
        </aside>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">Account</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">Your therapist login</h2>
            <p className="mt-2 text-sm text-muted-foreground">Only the essentials. You will build your listing after verification.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">Full name *</Label>
                  <Input id="fullName" autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input id="displayName" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="Name shown publicly (optional)" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <PhoneInput id="phone" value={form.phone} onChange={(value) => update("phone", value)} placeholder="(555) 000-0000" />
                  <p className="text-xs text-muted-foreground">Used for contact verification and account security.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="8+ characters" showStrength />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password *</Label>
                  <PasswordInput id="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat password" />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-bg-subtle/45 p-4 text-sm">
                <label className="flex items-start gap-3">
                  <Checkbox checked={terms} onCheckedChange={(value) => setTerms(value === true)} />
                  <span>I agree to the <Link href="/terms" target="_blank" className="font-medium text-brand-secondary underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="font-medium text-brand-secondary underline">Privacy Policy</Link>.</span>
                </label>
                <label className="flex items-start gap-3">
                  <Checkbox checked={policies} onCheckedChange={(value) => setPolicies(value === true)} />
                  <span>I acknowledge the <Link href="/therapist-agreement" target="_blank" className="font-medium text-brand-secondary underline">Therapist Agreement</Link> and platform policies.</span>
                </label>
                <label className="flex items-start gap-3">
                  <Checkbox checked={adult} onCheckedChange={(value) => setAdult(value === true)} />
                  <span>I confirm I am at least 18 years old.</span>
                </label>
              </div>

              {error ? <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

              <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create account
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already registered? <Link href="/login" className="font-medium text-brand-secondary underline">Log in</Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
