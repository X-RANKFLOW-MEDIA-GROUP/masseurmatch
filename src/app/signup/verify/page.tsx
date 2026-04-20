"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
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

export default function SignupVerifyPage() {
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

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneInputValue, setPhoneInputValue] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login?redirect=%2Fsignup%2Fverify");
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

    if (user.phone_confirmed_at) {
      markPhoneVerified();
    }
  }, [
    authLoading,
    markEmailVerified,
    markPhoneVerified,
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
      } else if (status === "requires_input") {
        setIdentityStatus("requires_input");
      } else if (status === "canceled") {
        setIdentityStatus("failed");
      } else {
        setIdentityStatus("processing");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check verification status.");
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
        type: "email",
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

  function handleSetPhone() {
    if (!phoneInputValue.trim()) return;
    
    // Format phone number - ensure it has a + prefix
    let formattedPhone = phoneInputValue.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+1" + formattedPhone.replace(/\D/g, "");
    }
    
    setAccountInfo({
      ...state,
      phone: formattedPhone,
    });
  }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send SMS verification code.");
    } finally {
      setPhoneLoading(false);
    }
  }

  async function verifyPhoneCode() {
    setPhoneLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: state.phone,
        token: phoneOtp,
        type: "sms",
      });

      if (verifyError) throw verifyError;

      await syncServerSession(data.session?.access_token);
      markPhoneVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid phone verification code.");
    } finally {
      setPhoneLoading(false);
    }
  }

  const startIdentityVerification = useCallback(async () => {
    setIdLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/identity/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create verification session.");
      }

      const { sessionId, url } = await response.json();
      setStripeIdentitySessionId(sessionId);
      setIdentityStatus("processing");

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identity verification failed to start.");
      setIdentityStatus("failed");
    } finally {
      setIdLoading(false);
    }
  }, [setIdentityStatus, setStripeIdentitySessionId]);

  const canContinue = state.emailVerified && state.phoneVerified && state.identityVerificationStatus === "verified";

  function handleContinue() {
    if (!canContinue) return;
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

  if (!authLoading && !user) {
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

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-display text-lg font-semibold">Phone Verification</h2>
            <Badge variant="secondary" className="ml-auto gap-1 border-amber-200 bg-amber-50 text-amber-700">
              Required
            </Badge>
            {state.phoneVerified && (
              <Badge
                variant="secondary"
                className="gap-1 border-green-200 bg-green-50 text-green-700"
              >
                <CheckCircle2 className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>

          {!state.phoneVerified && (
            <>
              {!state.phone ? (
                <div className="space-y-3">
                  <Label htmlFor="phoneInput">Enter your phone number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phoneInput"
                      type="tel"
                      value={phoneInputValue}
                      onChange={(event) => setPhoneInputValue(event.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                    <Button 
                      onClick={handleSetPhone} 
                      disabled={phoneLoading || !phoneInputValue.trim()}
                      variant="outline"
                    >
                      Set Phone
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
              ) : !phoneSent ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Phone: {state.phone}</p>
                  <Button onClick={sendPhoneCode} disabled={phoneLoading} variant="outline">
                    {phoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send SMS Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="phoneOtp">Enter the code sent to {state.phone}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phoneOtp"
                      value={phoneOtp}
                      onChange={(event) => setPhoneOtp(event.target.value)}
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

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-display text-lg font-semibold">Secure ID Check</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            You will complete a secure identity verification powered by Stripe. This helps
            confirm authenticity and supports a safer experience for clients and providers.
          </p>
          <p className="text-xs text-muted-foreground">
            A government-issued ID is required. Verification is handled securely by Stripe
            Identity. MasseurMatch does not store your ID documents.
          </p>
          {renderIdButton()}
        </CardContent>
      </Card>

      <Button size="lg" className="w-full" disabled={!canContinue} onClick={handleContinue}>
        Continue to Profile
      </Button>

      {!canContinue && (
        <p className="text-center text-xs text-muted-foreground">
          Complete email, phone, and identity verification above to continue.
        </p>
      )}
    </div>
  );
}
