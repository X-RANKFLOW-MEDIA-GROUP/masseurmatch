"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignup } from "../_lib/signup-context";
import { supabase } from "@/integrations/supabase/client";

export default function SignupVerifyPage() {
  const router = useRouter();
  const {
    state,
    markEmailVerified,
    markPhoneVerified,
    setIdentityStatus,
    setStripeIdentitySessionId,
  } = useSignup();

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Email verification                                                 */
  /* ------------------------------------------------------------------ */

  async function sendEmailCode() {
    setEmailLoading(true);
    setError(null);
    try {
      // In production, call an API route that sends an OTP email
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: state.email,
      });
      if (resendError) throw resendError;
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to send email verification code.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function verifyEmailCode() {
    setEmailLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: state.email,
        token: emailOtp,
        type: "email",
      });
      if (verifyError) throw verifyError;
      markEmailVerified();
    } catch (err: any) {
      setError(err.message ?? "Invalid email verification code.");
    } finally {
      setEmailLoading(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Phone verification                                                 */
  /* ------------------------------------------------------------------ */

  async function sendPhoneCode() {
    if (!state.phone) return;
    setPhoneLoading(true);
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: state.phone,
      });
      if (otpError) throw otpError;
      setPhoneSent(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to send SMS verification code.");
    } finally {
      setPhoneLoading(false);
    }
  }

  async function verifyPhoneCode() {
    setPhoneLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: state.phone,
        token: phoneOtp,
        type: "sms",
      });
      if (verifyError) throw verifyError;
      markPhoneVerified();
    } catch (err: any) {
      setError(err.message ?? "Invalid phone verification code.");
    } finally {
      setPhoneLoading(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Stripe Identity verification                                       */
  /* ------------------------------------------------------------------ */

  const startIdentityVerification = useCallback(async () => {
    setIdLoading(true);
    setError(null);
    try {
      // Call backend to create a Stripe Identity VerificationSession
      const res = await fetch("/api/stripe/identity/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create verification session.");
      }
      const { sessionId, clientSecret, url } = await res.json();
      setStripeIdentitySessionId(sessionId);
      setIdentityStatus("processing");

      // Redirect to Stripe-hosted verification page
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message ?? "Identity verification failed to start.");
      setIdentityStatus("failed");
    } finally {
      setIdLoading(false);
    }
  }, [state.email, setStripeIdentitySessionId, setIdentityStatus]);

  const checkIdentityStatus = useCallback(async () => {
    if (!state.stripeIdentitySessionId) return;
    setIdLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/stripe/identity/check-status?sessionId=${encodeURIComponent(state.stripeIdentitySessionId)}`,
      );
      if (!res.ok) throw new Error("Failed to check verification status.");
      const { status } = await res.json();
      // Map Stripe status to our status
      if (status === "verified") setIdentityStatus("verified");
      else if (status === "requires_input") setIdentityStatus("requires_input");
      else if (status === "canceled") setIdentityStatus("failed");
      else setIdentityStatus("processing");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIdLoading(false);
    }
  }, [state.stripeIdentitySessionId, setIdentityStatus]);

  /* ------------------------------------------------------------------ */
  /*  Navigation guard                                                   */
  /* ------------------------------------------------------------------ */

  const canContinue =
    state.emailVerified && state.identityVerificationStatus === "verified";

  function handleContinue() {
    if (!canContinue) return;
    router.push("/signup/profile");
  }

  /* ------------------------------------------------------------------ */
  /*  Identity button state                                              */
  /* ------------------------------------------------------------------ */

  function renderIdButton() {
    const s = state.identityVerificationStatus;
    if (s === "verified")
      return (
        <Badge variant="secondary" className="gap-1.5 py-1.5 text-green-700 border-green-200 bg-green-50">
          <CheckCircle2 className="h-3.5 w-3.5" /> Verification Complete
        </Badge>
      );
    if (s === "processing")
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
    if (s === "requires_input" || s === "failed")
      return (
        <div className="space-y-2">
          <Badge variant="destructive" className="gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {s === "failed" ? "Verification Failed" : "Additional Input Required"}
          </Badge>
          <Button onClick={startIdentityVerification} disabled={idLoading}>
            {idLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Retry Verification
          </Button>
        </div>
      );
    return (
      <Button onClick={startIdentityVerification} disabled={idLoading}>
        {idLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Start ID Verification
      </Button>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Verify Your Identity
        </h1>
        <p className="mt-3 text-muted-foreground">
          To help maintain trust and safety on MasseurMatch, identity
          verification is required before your profile can be reviewed.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* A — Email Verification */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-display text-lg font-semibold">Email Verification</h2>
            {state.emailVerified && (
              <Badge variant="secondary" className="ml-auto gap-1 text-green-700 border-green-200 bg-green-50">
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
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                    />
                    <Button onClick={verifyEmailCode} disabled={emailLoading || emailOtp.length < 4}>
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

      {/* B — Phone Verification (conditional) */}
      {state.phone && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-display text-lg font-semibold">Phone Verification</h2>
              {state.phoneVerified && (
                <Badge variant="secondary" className="ml-auto gap-1 text-green-700 border-green-200 bg-green-50">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>

            {!state.phoneVerified && (
              <>
                {!phoneSent ? (
                  <Button onClick={sendPhoneCode} disabled={phoneLoading} variant="outline">
                    {phoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send SMS Code
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="phoneOtp">Enter the code sent to {state.phone}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phoneOtp"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                      />
                      <Button onClick={verifyPhoneCode} disabled={phoneLoading || phoneOtp.length < 4}>
                        {phoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Verify
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={sendPhoneCode}
                      className="text-xs text-brand-secondary underline"
                      disabled={phoneLoading}
                    >
                      Resend code
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* C — Stripe Identity Verification */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-display text-lg font-semibold">Secure ID Check</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            You will complete a secure identity verification powered by Stripe.
            This helps confirm authenticity and supports a safer experience for
            clients and providers.
          </p>
          <p className="text-xs text-muted-foreground">
            A government-issued ID is required. Verification is handled securely
            by Stripe Identity. MasseurMatch does not store your ID documents.
          </p>
          {renderIdButton()}
        </CardContent>
      </Card>

      {/* Continue */}
      <Button
        size="lg"
        className="w-full"
        disabled={!canContinue}
        onClick={handleContinue}
      >
        Continue to Profile
      </Button>

      {!canContinue && (
        <p className="text-center text-xs text-muted-foreground">
          Complete email and identity verification above to continue.
        </p>
      )}
    </div>
  );
}
