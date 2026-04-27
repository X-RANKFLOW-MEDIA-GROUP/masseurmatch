"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase puts the recovery token in the URL hash; onAuthStateChange picks it up
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Password updated", description: "You can now sign in with your new password." });
    router.push("/login");
  };

  if (!ready) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-10">
        <div className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
          Verifying your reset link… if nothing happens, the link may have expired.{" "}
          <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
            Request a new one
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <div className="rounded-lg border border-border p-6">
        <h1 className="text-2xl font-bold">Set new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <Input
            type="password"
            placeholder="New password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Set new password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
