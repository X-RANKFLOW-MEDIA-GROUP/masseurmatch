"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSignup } from "../_lib/signup-context";

type IdentityStatusResponse = {
  status: "verified" | "processing" | "requires_input" | "canceled" | string;
  publicationStatus?: "not_ready" | "published" | "pending";
  next?: string | null;
  error?: string;
};

async function syncServerSession(accessToken: string | undefined) {
  if (!accessToken) return;
  await fetch("/api/auth/sync-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
  });
}

function SignupVerifyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const {
    state,
    setAccountInfo,
    markEmailVerified,
    setIdentityStatus,
    setStripeIdentitySessionId,
  } = useSignup();

  const [emailOtp, setEmailOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifiedNext, setVerifiedNext] = useState<string | null>(null);
  const autoCheckedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=%2Fsignup%2Fverify");
      return;
    }

    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const fullName = state.fullName ||
      (typeof metadata?.full_name === "string" ? metadata.full_name.trim() : "") ||
      (typeof metadata?.name === "string" ? metadata.name.trim() : "") ||
      user.email?.split("@")[0] || "User";

    setAccountInfo({
      fullName,
      displayName: state.displayName || fullName,
      email: state.email || user.email?.trim() || "",
      phone: state.phone || user.phone?.trim() || "",
    });

    if (user.email_confirmed_at) markEmailVerified();
  }, [authLoading, markEmailVerified, router, setAccountInfo, state.displayName, state.email, state.fullName, state.phone, user]);

  const checkIdentityStatus = useCallback(async () => {
    if (!state.stripeIdentitySessionId) return;
    setIdLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/stripe/identity/check-status?sessionId=${encodeURIComponent(state.stripeIdentitySessionId)}`, {
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({})) as IdentityStatusResponse;
      if (!response.ok) throw new Error(body.error || "Verification status could not be checked.");

      if (body.status === "verified") {
        setIdentityStatus("verified");
        setVerifiedNext(body.next || "/pro/subscription?identity=verified");
        setNotice(body.publicationStatus === "published"
          ? "Identity approved. Your profile publication status was updated successfully."
          : "Identity approved. Your dashboard is available while publication finishes syncing.");
      } else if (body.status === "requires_input") {
        setIdentityStatus("requires_input");
        setNotice("Stripe needs additional information. Resume verification to continue.");
      } else if (body.status === "canceled") {
        setIdentityStatus("failed");
      } else {
        setIdentityStatus("processing");
        setNotice("Stripe is still processing your verification. You may continue building your profile now.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Verification status could not be checked.");
    } finally {
      setIdLoading(false);
    }
  }, [setIdentityStatus, state.stripeIdentitySessionId]);

  useEffect(() => {
    if (autoCheckedRef.current || !searchParams?.get("identity_return") || !state.stripeIdentitySessionId) return;
    autoCheckedRef.current = true;
    void checkIdentityStatus();
  }, [checkIdentityStatus, searchParams, state.stripeIdentitySessionId]);

  async function sendEmailCode() {
    if (!state.email) {
      setError("An email address is required.");
      return;
    }
    setEmailLoading(true);
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({ type: "signup", email: state.email });
      if (resendError) throw resendError;
      setEmailSent(true);
      setNotice(`A verification code was sent to ${state.email}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to send email verification.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function verifyEmailCode() {
    setEmailLoading(true);
    setError(null);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: state.email,
        token: emailOtp,
        type: "email",
      });
      if (verifyError) throw verifyError;
      await syncServerSession(data.session?.access_token);
      markEmailVerified();
      setNotice("Email verified successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invalid email verification code.");
    } finally {
      setEmailLoading(false);
    }
  }

  const startIdentityVerification = useCallback(async () => {
    setIdLoading(true);
    setError(null);
    setNotice(null);

    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const response = await fetch("/api/stripe/identity/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: abortControllerRef.current.signal,
      });
      const body = await response.json().catch(() => ({})) as { sessionId?: string; url?: string; error?: string };
      if (!response.ok || !body.sessionId) throw new Error(body.error || "Could not start ID verification.");

      setStripeIdentitySessionId(body.sessionId);
      setIdentityStatus("processing");
      if (body.url) window.location.href = body.url;
    } catch (caught) {
      if (caught instanceof Error && caught.name === "AbortError") return;
      setIdentityStatus("failed");
      setError(caught instanceof Error ? caught.message : "Identity verification could not start.");
    } finally {
      setIdLoading(false);
    }
  }, [setIdentityStatus, setStripeIdentitySessionId]);

  if (!authLoading && !user) return null;

  const idStatus = state.identityVerificationStatus;
  const idVerified = idStatus === "verified";
  const canContinue = state.emailVerified;
  const continueDestination = idVerified && state.profileCompleted
    ? verifiedNext || "/pro/subscription?identity=verified"
    : state.profileCompleted
      ? "/pro/dashboard?identity=pending"
      : "/signup/profile";

  return (
    <div className="mx-auto max-w-2xl space-y-7 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Verification</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Verify your email to continue. Stripe Identity can be completed now or later; you can still access the dashboard and finish your profile while it is pending.
        </p>
      </div>

      {error && <p className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      {notice && <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">{notice}</p>}

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-display text-lg font-semibold">Email Verification</h2>
            {state.emailVerified && <Badge className="ml-auto gap-1 border-green-200 bg-green-50 text-green-700" variant="outline"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>}
          </div>

          {!state.emailVerified && !emailSent && (
            <Button type="button" variant="outline" onClick={sendEmailCode} disabled={emailLoading}>
              {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Verification Code
            </Button>
          )}

          {!state.emailVerified && emailSent && (
            <div className="space-y-3">
              <Label htmlFor="emailOtp">Enter the 6-digit code sent to {state.email}</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input id="emailOtp" inputMode="numeric" value={emailOtp} onChange={(event) => setEmailOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} />
                <Button type="button" onClick={verifyEmailCode} disabled={emailLoading || emailOtp.length !== 6}>
                  {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Verify Email
                </Button>
              </div>
              <button type="button" onClick={sendEmailCode} disabled={emailLoading} className="text-sm font-semibold text-brand-secondary underline">Resend code</button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-brand-secondary" />
              <div><h2 className="font-display text-lg font-semibold">Secure ID Check</h2><p className="text-xs text-muted-foreground">Handled by Stripe Identity</p></div>
            </div>
            <Badge variant="outline" className={idVerified ? "border-green-200 bg-green-50 text-green-700" : "text-muted-foreground"}>
              {idVerified ? "Verified" : idStatus === "processing" ? "Processing" : idStatus === "requires_input" ? "Input Required" : "Required for Public Profile"}
            </Badge>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            <p>MasseurMatch does not store your ID documents. Stripe confirms the verification result.</p>
            <p className="mt-2"><strong className="text-foreground">While pending:</strong> you can use the dashboard, edit rates, upload photos, add travel dates, and finish your profile.</p>
            <p className="mt-2"><strong className="text-foreground">When approved:</strong> the profile becomes eligible for public visibility and you continue to plan/payment setup.</p>
          </div>

          {idVerified ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800"><CheckCircle2 className="h-5 w-5" /> Identity verification complete</div>
          ) : idStatus === "processing" ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={checkIdentityStatus} disabled={idLoading}>{idLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Check Status</Button>
              <Button type="button" variant="outline" onClick={startIdentityVerification} disabled={idLoading}>Resume Verification</Button>
            </div>
          ) : (
            <Button type="button" onClick={startIdentityVerification} disabled={idLoading}>
              {idLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {idStatus === "requires_input" || idStatus === "failed" ? "Retry ID Verification" : "Start ID Verification"}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button type="button" size="lg" className="w-full gap-2" disabled={!canContinue} onClick={() => router.push(continueDestination)}>
          {idVerified && state.profileCompleted ? "Continue to Plan & Payment" : state.profileCompleted ? "Open Dashboard" : "Continue to Profile"}
          <ArrowRight className="h-4 w-4" />
        </Button>
        {!state.emailVerified && <p className="text-center text-xs text-muted-foreground">Verify your email above to continue.</p>}
        {state.emailVerified && !idVerified && <p className="text-center text-xs text-muted-foreground">You may continue now and return to ID verification from the dashboard.</p>}
        {state.emailVerified && <div className="text-center"><Link href="/pro/dashboard" className="text-sm font-semibold text-brand-secondary underline">Go directly to dashboard</Link></div>}
      </div>
    </div>
  );
}

export default function SignupVerifyPage() {
  return <Suspense><SignupVerifyPageInner /></Suspense>;
}
