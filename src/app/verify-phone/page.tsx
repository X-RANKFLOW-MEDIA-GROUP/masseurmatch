"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Phone, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { supabase } from "@/integrations/supabase/client";

function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

function safeDestination(value: string | null) {
  if (!value || !value.startsWith("/pro")) return "/pro/dashboard";
  return value;
}

async function syncServerSession(accessToken: string) {
  const response = await fetch("/api/auth/sync-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
  });
  if (!response.ok) {
    throw new Error("Phone was confirmed, but your secure session could not be refreshed. Please try again.");
  }
}

async function fetchPhoneStatus() {
  const response = await fetch("/api/provider/verification/phone/sync", {
    method: "GET",
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || "Could not check phone verification status.");
  }
  return body as {
    ok: true;
    phone: string | null;
    verified: boolean;
    requiresVerification: boolean;
  };
}

async function persistVerifiedPhone() {
  const response = await fetch("/api/provider/verification/phone/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || "Phone was verified, but the profile could not be updated.");
  }
  return body as { ok: true; phone: string; verified: true; verifiedAt: string };
}

function VerifyPhonePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = useMemo(
    () => safeDestination(searchParams.get("redirect")),
    [searchParams],
  );

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const status = await fetchPhoneStatus();
        if (!active) return;
        if (status.verified) {
          router.replace(destination);
          return;
        }
        setPhone(status.phone || "");
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not check phone verification status.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [destination, router]);

  async function sendCode() {
    const normalized = normalizePhone(phone);
    if (normalized.replace(/\D/g, "").length < 10) {
      setError("Enter a valid phone number.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      // Updating the authenticated Supabase user with a phone number sends the
      // ownership OTP. The profile itself is not marked verified at this point.
      const { error: updateError } = await supabase.auth.updateUser({ phone: normalized });
      if (updateError) throw updateError;
      setPhone(normalized);
      setCode("");
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the SMS verification code.");
    } finally {
      setSending(false);
    }
  }

  async function verifyCode() {
    if (code.length !== 6) return;

    setVerifying(true);
    setError(null);
    try {
      const normalized = normalizePhone(phone);
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: normalized,
        token: code,
        type: "phone_change",
      });
      if (verifyError) throw verifyError;

      const accessToken =
        data.session?.access_token ||
        (await supabase.auth.getSession()).data.session?.access_token;
      if (!accessToken) {
        throw new Error("Phone was confirmed, but the authenticated session could not be refreshed.");
      }

      await syncServerSession(accessToken);
      await persistVerifiedPhone();
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired SMS code.");
    } finally {
      setVerifying(false);
    }
  }

  function changeNumber() {
    setCodeSent(false);
    setCode("");
    setError(null);
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-brand-secondary" aria-label="Loading" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">Account security</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">Confirm your phone number</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              MasseurMatch must confirm that you control the phone number attached to your provider profile before the profile can be approved or shown in public search.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            <strong>How it works:</strong> we send a 6-digit SMS code to your number. Your phone is marked verified only after you enter the correct code and Supabase Auth confirms ownership.
          </div>

          {error ? (
            <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <PhoneInput
              id="phone"
              value={phone}
              onChange={setPhone}
              placeholder="(555) 000-0000"
              disabled={sending || verifying || codeSent}
            />
            <p className="text-xs text-muted-foreground">
              Use the number clients should use to contact you. It is saved to your provider profile only after successful verification.
            </p>
          </div>

          {!codeSent ? (
            <Button className="w-full gap-2" size="lg" onClick={sendCode} disabled={sending || !phone.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
              Send verification code
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Verification code sent to <strong>{phone}</strong>.
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-code">6-digit SMS code</Label>
                <Input
                  id="phone-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  disabled={verifying}
                  autoFocus
                />
              </div>

              <Button className="w-full gap-2" size="lg" onClick={verifyCode} disabled={verifying || code.length !== 6}>
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Verify phone
              </Button>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={sendCode} disabled={sending || verifying}>
                  {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send new code
                </Button>
                <Button variant="ghost" onClick={changeNumber} disabled={sending || verifying}>
                  Use a different number
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense>
      <VerifyPhonePageContent />
    </Suspense>
  );
}
