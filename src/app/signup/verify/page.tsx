"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSignup } from "../_lib/signup-context";

async function syncServerSession(accessToken?: string) {
  if (!accessToken) return;
  await fetch("/api/auth/sync-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
  });
}

function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

function VerificationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    state,
    setAccountInfo,
    markEmailVerified,
    markPhoneVerified,
    setIdentityStatus,
    setStripeIdentitySessionId,
  } = useSignup();

  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (!state.email) router.replace("/signup/account");
      return;
    }

    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const fullName = state.fullName || (typeof metadata?.full_name === "string" ? metadata.full_name : user.email?.split("@")[0] || "User");
    setAccountInfo({
      fullName,
      displayName: state.displayName || fullName,
      email: state.email || user.email || "",
      phone: state.phone || user.phone || "",
    });

    if (user.email_confirmed_at) markEmailVerified();
    if (user.phone_confirmed_at) markPhoneVerified();
  }, [authLoading, markEmailVerified, markPhoneVerified, router, setAccountInfo, state.displayName, state.email, state.fullName, state.phone, user]);

  async function sendEmailVerification() {
    if (!state.email) return setError("Email address is missing. Return to the account step.");
    setEmailLoading(true);
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: state.email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/signup/verify` },
      });
      if (resendError) throw resendError;
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email verification.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function verifyEmail() {
    if (emailCode.length !== 6) return;
    setEmailLoading(true);
    setError(null);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: state.email,
        token: emailCode,
        type: "signup",
      });
      if (verifyError) throw verifyError;
      await syncServerSession(data.session?.access_token);
      markEmailVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired email code.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function sendPhoneVerification() {
    if (!state.emailVerified) return setError("Verify your email first so we can secure the account session.");
    if (!state.phone) return setError("Phone number is missing. Return to the account step.");
    setPhoneLoading(true);
    setError(null);
    try {
      const phone = normalizePhone(state.phone);
      const { error: updateError } = await supabase.auth.updateUser({ phone });
      if (updateError) throw updateError;
      setPhoneSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the phone verification code.");
    } finally {
      setPhoneLoading(false);
    }
  }

  async function verifyPhone() {
    if (phoneCode.length !== 6) return;
    setPhoneLoading(true);
    setError(null);
    try {
      const phone = normalizePhone(state.phone);
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: phoneCode,
        type: "phone_change",
      });
      if (verifyError) throw verifyError;
      await syncServerSession(data.session?.access_token);
      markPhoneVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired phone code.");
    } finally {
      setPhoneLoading(false);
    }
  }

  const checkIdentity = useCallback(async () => {
    if (!state.stripeIdentitySessionId) return;
    setIdentityLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stripe/identity/check-status?sessionId=${encodeURIComponent(state.stripeIdentitySessionId)}`, { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not check identity status.");
      if (body.status === "verified") setIdentityStatus("verified");
      else if (body.status === "requires_input") setIdentityStatus("requires_input");
      else if (body.status === "canceled") setIdentityStatus("failed");
      else setIdentityStatus("processing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check identity status.");
    } finally {
      setIdentityLoading(false);
    }
  }, [setIdentityStatus, state.stripeIdentitySessionId]);

  async function startIdentity() {
    setIdentityLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/identity/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not start identity verification.");
      setStripeIdentitySessionId(body.sessionId);
      setIdentityStatus("processing");
      if (body.url) window.location.href = body.url;
    } catch (err) {
      setIdentityStatus("failed");
      setError(err instanceof Error ? err.message : "Could not start identity verification.");
    } finally {
      setIdentityLoading(false);
    }
  }

  if (!authLoading && !user && !state.email) return null;
  const identityVerified = state.identityVerificationStatus === "verified";
  const canContinue = state.emailVerified && state.phoneVerified;

  return (
    <main className="mx-auto max-w-2xl space-y-5 py-5 sm:py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">Verification</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">Confirm your contact details</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Email and phone verification must work before the profile wizard continues.</p>
      </header>

      {error ? <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-semibold">Email</h2>
            {state.emailVerified ? <Badge className="ml-auto bg-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">{state.email || "No email saved"}</p>
          {!state.emailVerified ? (
            emailSent ? (
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <div><Label htmlFor="emailCode">6-digit email code</Label><Input id="emailCode" inputMode="numeric" value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" /></div>
                <Button className="self-end" onClick={verifyEmail} disabled={emailLoading || emailCode.length !== 6}>{emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Verify</Button>
              </div>
            ) : <Button variant="outline" onClick={sendEmailVerification} disabled={emailLoading}>{emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Send email code</Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-semibold">Phone</h2>
            {state.phoneVerified ? <Badge className="ml-auto bg-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">{state.phone || "No phone saved"}</p>
          {!state.phoneVerified ? (
            phoneSent ? (
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <div><Label htmlFor="phoneCode">6-digit SMS code</Label><Input id="phoneCode" inputMode="numeric" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" /></div>
                <Button className="self-end" onClick={verifyPhone} disabled={phoneLoading || phoneCode.length !== 6}>{phoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Verify</Button>
              </div>
            ) : <Button variant="outline" onClick={sendPhoneVerification} disabled={phoneLoading || !state.emailVerified}>{phoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Send SMS code</Button>
          ) : null}
          {!state.emailVerified && !state.phoneVerified ? <p className="text-xs text-muted-foreground">Verify email first; then SMS verification becomes available.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-secondary" /><h2 className="font-semibold">Identity check</h2>{identityVerified ? <Badge className="ml-auto bg-emerald-600">Verified</Badge> : null}</div>
          <p className="text-sm text-muted-foreground">Stripe Identity handles the ID check. MasseurMatch does not store the ID document.</p>
          {!identityVerified ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={startIdentity} disabled={identityLoading}>{identityLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{state.stripeIdentitySessionId ? "Resume ID verification" : "Start ID verification"}</Button>
              {state.stripeIdentitySessionId ? <Button variant="ghost" onClick={checkIdentity} disabled={identityLoading}>Check status</Button> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Button size="lg" className="w-full gap-2" disabled={!canContinue} onClick={() => router.push("/signup/profile")}>
        Continue to profile <ArrowRight className="h-4 w-4" />
      </Button>
      {!canContinue ? <p className="text-center text-xs text-muted-foreground">Complete both email and phone verification to continue.</p> : null}
    </main>
  );
}

export default function SignupVerifyPage() {
  return <Suspense><VerificationPage /></Suspense>;
}
