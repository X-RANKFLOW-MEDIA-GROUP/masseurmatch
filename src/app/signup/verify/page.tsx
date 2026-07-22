"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignup } from "../_lib/signup-context";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const autoCheckedRef = useRef(false);
  const statusCheckAttemptsRef = useRef(0);
  const MAX_STATUS_CHECK_ATTEMPTS = 30; // Prevent infinite polling
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup: abort pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    // A just-signed-up user awaiting email confirmation has no session yet. Let
    // them stay on this step and confirm by email, as long as we know their
    // address from the signup context. Only bounce genuinely cold visits.
    if (!user) {
      if (!state.email) {
        router.replace("/login?redirect=%2Fsignup%2Fverify");
      }
      return;
    }

    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const derivedFullName =
      state.fullName ||
      (typeof metadata?.full_name === "string"
        ? metadata.full_name.trim()
        : typeof metadata?.name === "string"
          ? metadata.name.trim()
          : user.email?.split("@")[0] || "User");

    setAccountInfo({
      fullName: derivedFullName,
      displayName: state.displayName || derivedFullName,
      email: state.email || user.email?.trim() || "",
      phone: state.phone || user.phone?.trim() || "",
    });

    if (user.email_confirmed_at) {
      markEmailVerified();
    }
  }, [
    authLoading,
    markEmailVerified,
    router,
    setAccountInfo,
    state.displayName,
    state.email,
    state.fullName,
    state.phone,
    user,
  ]);

  const checkIdentityStatus = useCallback(async () => {
    if (!state.stripeIdentitySessionId) return;
    if (statusCheckAttemptsRef.current >= MAX_STATUS_CHECK_ATTEMPTS) {
      setError("Verification check timed out. Please click 'Resume Verification' to try again.");
      return;
    }

    statusCheckAttemptsRef.current += 1;
    setIdLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/stripe/identity/check-status?sessionId=${encodeURIComponent(state.stripeIdentitySessionId)}`,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to check verification status.");
      }

      const { status } = await response.json();

      if (status === "verified") {
        setIdentityStatus("verified");
        statusCheckAttemptsRef.current = 0; // Reset on success
      } else if (status === "requires_input") {
        setIdentityStatus("requires_input");
      } else if (status === "canceled") {
        setIdentityStatus("failed");
      } else {
        setIdentityStatus("processing");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check verification status. Please try again.");
    } finally {
      setIdLoading(false);
    }
  }, [setIdentityStatus, state.stripeIdentitySessionId]);

  useEffect(() => {
    if (state.identityVerificationStatus !== "processing" || !state.stripeIdentitySessionId) {
      return;
    }

    void checkIdentityStatus();
  }, [checkIdentityStatus, state.identityVerificationStatus, state.stripeIdentitySessionId]);

  // When Stripe redirects back with ?identity_return=1, auto-check status once
  useEffect(() => {
    if (autoCheckedRef.current) return;
    if (!searchParams?.get("identity_return")) return;
    if (!state.stripeIdentitySessionId) return;
    if (state.identityVerificationStatus === "verified") return;

    autoCheckedRef.current = true;
    void checkIdentityStatus();
  }, [checkIdentityStatus, searchParams, state.stripeIdentitySessionId, state.identityVerificationStatus]);

  async function sendEmailCode() {
    if (!state.email) {
      setError("An email address is required to verify your account.");
      return;
    }

    setEmailLoading(true);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: state.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/signup/profile`,
        },
      });

      if (resendError) throw resendError;
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email verification code.");
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
        type: "signup",
      });

      if (verifyError) throw verifyError;

      await syncServerSession(data.session?.access_token);
      markEmailVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email verification code.");
    } finally {
      setEmailLoading(false);
    }
  }

  const startIdentityVerification = useCallback(async () => {
    setIdLoading(true);
    setError(null);

    try {
      // Abort any previous requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/stripe/identity/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create verification session.");
      }

      const { sessionId, url } = await response.json();
      setStripeIdentitySessionId(sessionId);
      setIdentityStatus("processing");
      statusCheckAttemptsRef.current = 0; // Reset attempts counter

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Request was cancelled, don't show error
      }
      setError(err instanceof Error ? err.message : "Identity verification failed to start.");
      setIdentityStatus("failed");
    } finally {
      setIdLoading(false);
    }
  }, [setIdentityStatus, setStripeIdentitySessionId]);

  const idVerified = state.identityVerificationStatus === "verified";
  const canContinue = state.emailVerified;

  function handleContinue() {
    if (!canContinue) return;
    // Always continue through the wizard (profile → review → submit); jumping to
    // the listing editor here skipped submission entirely.
    router.push("/signup/profile");
  }

  function renderIdButton() {
    const status = state.identityVerificationStatus;

    if (status === "verified") {
      return (
        <Badge
          variant="secondary"
          className="gap-1.5 border-green-200 bg-green-50 py-1.5 text-green-700"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Verification Complete
        </Badge>
      );
    }

    if (status === "processing") {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={checkIdentityStatus} disabled={idLoading}>
            {idLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Check Status
          </Button>
          <Button variant="outline" onClick={startIdentityVerification} disabled={idLoading}>
            Resume Verification
          </Button>
        </div>
      );
    }

    if (status === "requires_input" || status === "failed") {
      return (
        <div className="space-y-2">
          <Badge variant="destructive" className="gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {status === "failed" ? "Verification Failed" : "Additional Input Required"}
          </Badge>
          <Button onClick={startIdentityVerification} disabled={idLoading}>
            {idLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Retry Verification
          </Button>
        </div>
      );
    }

    return (
      <Button onClick={startIdentityVerification} disabled={idLoading}>
        {idLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Start ID Verification
      </Button>
    );
  }

  if (!authLoading && !user && !state.email) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Verify Your Identity
        </h1>
        <p className="mt-3 text-muted-foreground">
          To help maintain trust and safety on MasseurMatch, identity verification is required
          before your profile can be reviewed.
        </p>
      </div>

      {!user && (
        <div className="rounded-lg border border-border bg-bg-subtle/40 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">Confirm your email to continue</p>
          <p className="mt-1 text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{state.email || "your email"}</span>. Click
            it to finish, or enter the 6-digit code from that email below.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-display text-lg font-semibold">Email Verification</h2>
            {state.emailVerified && (
              <Badge
                variant="secondary"
                className="ml-auto gap-1 border-green-200 bg-green-50 text-green-700"
              >
                <CheckCircle2 className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>

          {!state.emailVerified && (
            <>
              {!emailSent ? (
                <Button onClick={sendEmailCode} disabled={emailLoading} variant="outline">
                  {emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send Verification Code
                </Button>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="emailOtp">Enter the code sent to {state.email}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="emailOtp"
                      value={emailOtp}
                      onChange={(event) => setEmailOtp(event.target.value)}
                      placeholder="000000"
                      maxLength={6}
                    />
                    <Button onClick={verifyEmailCode} disabled={emailLoading || emailOtp.length !== 6}>
                      {emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Verify
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={sendEmailCode}
                    className="text-xs text-brand-secondary underline"
                    disabled={emailLoading}
                  >
                    Resend code
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-display text-lg font-semibold">Secure ID Check</h2>
            </div>
            <Badge variant="outline" className="text-xs text-muted-foreground">Required to publish</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Verify your identity with a government-issued ID via Stripe. This is required before your
            profile can be submitted for review — you can complete it now or at the review step.
            Verified profiles get a trust badge.
          </p>
          <p className="text-xs text-muted-foreground">
            Verification is handled securely by Stripe Identity. MasseurMatch does not store your ID documents.
          </p>
          {renderIdButton()}
        </CardContent>
      </Card>

      <Button size="lg" className="w-full gap-2" disabled={!canContinue} onClick={handleContinue}>
        Continue to Profile
        <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
      </Button>

      {!state.emailVerified && (
        <p className="text-center text-xs text-muted-foreground">
          Verify your email above to continue.
        </p>
      )}
      {state.emailVerified && !idVerified && (
        <p className="text-center text-xs text-muted-foreground">
          ID verification is required before your profile can be submitted — you can complete it now
          or at the review step.
        </p>
      )}
    </div>
  );
}

export default function SignupVerifyPage() {
  return (
    <Suspense>
      <SignupVerifyPageInner />
    </Suspense>
  );
}
