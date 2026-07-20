"use client";

import { useState } from "react";
import { forgotPasswordMutation } from "@/app/_lib/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPageClient() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await forgotPasswordMutation({
        email: email.trim(),
        redirectTo: `${window.location.origin}/reset-password`,
      });

      setSubmitted(true);
      setEmail("");
      toast({
        title: "Check your email",
        description: response.message || "If an account exists for that email, a password reset link will be sent.",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error. Please try again.";
      setError(errorMsg);
      toast({
        title: "Could not start reset",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-10">
        <div className="rounded-lg border border-border bg-green-50 p-6">
          <h1 className="text-2xl font-bold text-green-900">Check your email</h1>
          <p className="mt-2 text-sm text-green-800">
            If an account exists for that email, a password reset link will be sent shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <div className="rounded-lg border border-border p-6">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
