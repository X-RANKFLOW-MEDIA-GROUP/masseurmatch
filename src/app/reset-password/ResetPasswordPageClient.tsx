"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPageClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase sends the user to this page with either:
  // - A PKCE code in the query string (?code=…)   — must be exchanged explicitly
  // - A token_hash in the URL fragment (#…)        — handled by the Supabase client automatically
  //
  // We first register the auth-state listener (so we never miss the event),
  // then exchange the PKCE code when present, and finally fall back to checking
  // for an already-active recovery session (handles page reloads).
  useEffect(() => {
    // 1. Register listener before any async work so PASSWORD_RECOVERY is not missed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    const init = async () => {
      // 2. PKCE flow: exchange the code from the URL for a recovery session.
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
          // Remove the one-time code from the URL so a refresh doesn't fail.
          window.history.replaceState({}, "", window.location.pathname);
        }
      }

      // 3. Implicit / already-exchanged flow: check for an active session.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setSessionReady(true);
    };

    init();

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
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
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
          <Input
            type="password"
            placeholder="New password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
