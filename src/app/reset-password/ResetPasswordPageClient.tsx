"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/hooks/use-toast";

// Human-friendly copy for the Supabase error codes a recovery link can carry.
// `otp_expired` is overwhelmingly caused by email link scanners (Outlook Safe
// Links, antivirus, corporate proxies) pre-fetching the single-use verify URL
// and consuming the token before the person clicks — so the link looks
// "expired" on the very first real click.
function friendlyLinkError(code: string | null, description: string | null): string {
  if (code === "otp_expired") {
    return "This password reset link has expired or was already used. Request a new one below — it stays valid for 60 minutes.";
  }
  if (code === "access_denied") {
    return "This password reset link is no longer valid. Please request a new one below.";
  }
  return (
    description ||
    "We couldn't validate this reset link. Please request a new one below."
  );
}

export default function ResetPasswordPageClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Supabase can hand this page a recovery grant in several shapes depending on
  // the email-template and project flow settings. We handle all of them so the
  // link works regardless of device, browser, or scanner behaviour:
  //   1. ?token_hash=…&type=recovery  → verifyOtp (no PKCE verifier needed, so
  //      it works cross-device and is safe against link pre-fetch scanners).
  //   2. ?code=…                      → PKCE exchangeCodeForSession.
  //   3. #access_token=…              → implicit tokens (auto-detected by the client).
  //   4. ?error=…/#error=…            → a failed/expired grant; show clear copy.
  useEffect(() => {
    // Register the listener before any async work so PASSWORD_RECOVERY (fired by
    // implicit-flow hash detection) is never missed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });

    const init = async () => {
      const query = new URLSearchParams(window.location.search);
      // Supabase puts errors (and implicit tokens) in the hash fragment.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      // 0. Surface an explicit error carried by the link before anything else.
      const errorCode = query.get("error_code") || hash.get("error_code");
      const errorParam = query.get("error") || hash.get("error");
      const errorDesc = query.get("error_description") || hash.get("error_description");
      if (errorCode || errorParam) {
        setLinkError(friendlyLinkError(errorCode, errorDesc));
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }

      // 1. token_hash flow — verify client-side (scanner-safe, cross-device).
      const tokenHash = query.get("token_hash");
      const type = query.get("type") as EmailOtpType | null;
      if (tokenHash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        window.history.replaceState({}, "", window.location.pathname);
        if (verifyError) {
          setLinkError(friendlyLinkError("otp_expired", verifyError.message));
        } else {
          setSessionReady(true);
        }
        return;
      }

      // 2. PKCE flow: exchange the code from the URL for a recovery session.
      const code = query.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState({}, "", window.location.pathname);
        if (exchangeError) {
          setLinkError(friendlyLinkError("otp_expired", exchangeError.message));
        } else {
          setSessionReady(true);
        }
        return;
      }

      // 3. Implicit / already-exchanged flow: check for an active session.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setSessionReady(true);
    };

    void init();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Guard against a dropped recovery session: without one, updateUser() throws
    // the raw "Auth session missing!" error. Surface the actionable expired
    // screen instead so the person can request a fresh link.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      setLinkError(
        "Your reset session has expired. Request a new link below — it stays valid for 60 minutes.",
      );
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      if (/session|missing|jwt|token/i.test(updateError.message)) {
        setLinkError(
          "Your reset session has expired. Request a new link below — it stays valid for 60 minutes.",
        );
      } else {
        setError(updateError.message);
      }
      return;
    }

    toast({
      title: "Password updated",
      description: "Your password has been reset. You can now log in.",
    });

    // Sign out so they log in fresh with the new password
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (linkError) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-10">
        <div className="rounded-lg border border-border p-6">
          <h1 className="text-2xl font-bold">Reset link expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">{linkError}</p>
          <Button asChild className="mt-5 w-full">
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-10">
        <div className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
          Validating your reset link… If nothing happens, please{" "}
          <Link href="/forgot-password" className="underline">
            request a new link
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <div className="rounded-lg border border-border p-6">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter and confirm your new password below.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <PasswordInput
            placeholder="New password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <PasswordInput
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
