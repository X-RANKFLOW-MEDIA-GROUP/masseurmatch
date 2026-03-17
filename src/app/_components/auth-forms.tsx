"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppButton, AppInput, Surface } from "@/app/_components/primitives";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function AuthForms({
  mode,
  redirectTo = "/pro/dashboard",
}: {
  mode: "login" | "register";
  redirectTo?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, fullName);

    setLoading(false);

    if (result.error) {
      toast({
        title: isLogin ? "Login failed" : "Could not register",
        description: result.error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isLogin ? "Welcome back" : "Account created",
      description: isLogin ? undefined : "You can continue into onboarding now.",
    });

    router.push(isLogin ? redirectTo : "/pro/onboard");
    router.refresh();
  };

  return (
    <Surface className="mx-auto max-w-lg">
      <div className="inline-flex rounded-full border border-border bg-secondary/60 p-1 text-sm font-semibold">
        <Link
          href="/login"
          className={`rounded-full px-4 py-2 transition ${isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className={`rounded-full px-4 py-2 transition ${!isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Sign up
        </Link>
      </div>

      <h1 className="text-2xl font-bold">{isLogin ? "Login" : "Register"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isLogin
          ? `Continue to your therapist account. After login you will return to: ${redirectTo}`
          : "Create your therapist account and continue into onboarding."}
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        {!isLogin ? (
          <AppInput
            placeholder="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        ) : null}
        <AppInput
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <AppInput
          type="password"
          placeholder={isLogin ? "Password" : "At least 8 characters"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
        <AppButton className="w-full" disabled={loading} type="submit">
          {loading
            ? (isLogin ? "Signing in..." : "Creating account...")
            : (isLogin ? "Sign in" : "Create account")}
        </AppButton>
        {isLogin ? (
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        ) : null}
      </form>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {isLogin ? (
          <>
            <Link href={`/auth?mode=signin&redirect=${encodeURIComponent(redirectTo)}`} className="underline">
              Open combined auth screen
            </Link>
            <Link href={`/auth?mode=signup&redirect=${encodeURIComponent(redirectTo)}`} className="underline">
              Create account
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth?mode=signup&redirect=%2Fpro%2Fonboard" className="underline">
              Open registration
            </Link>
            <Link href="/login?redirect=%2Fpro%2Fdashboard" className="underline">
              Already have an account?
            </Link>
          </>
        )}
      </div>
    </Surface>
  );
}
