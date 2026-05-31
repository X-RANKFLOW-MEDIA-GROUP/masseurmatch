"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppButton, AppInput, Surface } from "@/app/_components/primitives";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/contexts/AuthContext";
import { resendConfirmationMutation } from "@/app/_lib/mutations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

function SocialButtons({ label, redirectTo = "/pro/dashboard" }: { label: string; redirectTo?: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) setLoading(null);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={!!loading}
        onClick={() => handleOAuth("google")}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-secondary/40 disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.42l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
        </svg>
        {loading === "google" ? "Connecting…" : `${label} with Google`}
      </button>
      <button
        type="button"
        disabled={!!loading}
        onClick={() => handleOAuth("apple")}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-black/80 disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="white">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
        </svg>
        {loading === "apple" ? "Connecting…" : `${label} with Apple`}
      </button>
    </div>
  );
}

function OrDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
      <div className="relative flex justify-center"><span className="bg-background px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">or</span></div>
    </div>
  );
}

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
  const [rememberMe, setRememberMe] = useState(true);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const sanitizedRedirectTo =
    typeof redirectTo === "string" && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/pro/dashboard";

  const loginHref = `/login?redirect=${encodeURIComponent(sanitizedRedirectTo)}`;
  const registerHref = `/register?redirect=${encodeURIComponent(sanitizedRedirectTo)}`;
  const forgotPasswordHref = `/forgot-password?redirect=${encodeURIComponent(sanitizedRedirectTo)}`;

  const isLogin = mode === "login";

  useEffect(() => {
    if (isLogin) {
      const saved = localStorage.getItem("mm_saved_email");
      if (saved) setEmail(saved);
      const savedRemember = localStorage.getItem("mm_remember_me");
      if (savedRemember !== null) setRememberMe(savedRemember === "true");
    }
  }, [isLogin]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (isLogin) {
      localStorage.setItem("mm_remember_me", String(rememberMe));
      if (rememberMe) {
        localStorage.setItem("mm_saved_email", email);
      } else {
        localStorage.removeItem("mm_saved_email");
        sessionStorage.setItem("mm_session_only", "true");
      }
    }

    const result = isLogin
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password, fullName.trim());

    setLoading(false);

    if (result.error) {
      const errorMsg = result.error.message || "";
      const isUserExists =
        errorMsg.includes("already exists") ||
        errorMsg.includes("USER_EXISTS") ||
        ((typeof (result.error as any)?.code === "string" && (result.error as any).code) === "USER_EXISTS");

      toast({
        title: isLogin ? "Login failed" : "Could not register",
        description: isUserExists
          ? "An account with this email already exists. Please sign in instead."
          : errorMsg,
        variant: "destructive",
      });

      if (isUserExists) {
        router.push("/login");
      }
      return;
    }

    if (!isLogin) {
      const signUpResult = result as Awaited<ReturnType<typeof signUp>>;
      if (signUpResult.requiresEmailConfirmation) {
        setNeedsEmailConfirmation(true);
        toast({
          title: "Confirm your email",
          description: signUpResult.message ?? "Check your email to confirm your account before continuing.",
        });
        return;
      }
    }

    toast({
      title: isLogin ? "Welcome back" : "Account created",
      description: isLogin ? undefined : "You can continue into onboarding now.",
    });

    // Use window.location for a full page navigation to ensure cookies are read properly
    const role = (result as { role?: string | null }).role;
    const destination = !isLogin
      ? "/pro/onboard"
      : role === "client"
        ? "/"
        : sanitizedRedirectTo;
    window.location.href = destination;
  };

  const resendConfirmation = async () => {
    try {
      await resendConfirmationMutation(email.trim());
      toast({ title: "Email sent", description: "We sent another confirmation email." });
    } catch {
      toast({ title: "Could not resend", description: "Please try again in a moment.", variant: "destructive" });
    }
  };

  if (!isLogin && needsEmailConfirmation) {
    return (
      <Surface className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Confirm your email</h1>
        <p className="text-base leading-6 text-muted-foreground">
          Check your email to confirm your account before continuing.
        </p>
        <p className="text-sm text-muted-foreground">We sent a confirmation link to <strong>{email}</strong>.</p>
        <AppButton className="w-full" onClick={resendConfirmation}>Resend confirmation email</AppButton>
      </Surface>
    );
  }

  return (
    <Surface className="mx-auto max-w-lg">
      <div className="inline-flex rounded-full border border-border bg-secondary/60 p-1 text-sm font-semibold">
        <Link
          href={loginHref}
          className={`rounded-full px-4 py-2 transition ${isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Sign in
        </Link>
        <Link
          href={registerHref}
          className={`rounded-full px-4 py-2 transition ${!isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Sign up
        </Link>
      </div>

      <h1 className="font-display text-3xl font-semibold tracking-tight mt-6">{isLogin ? "Sign in" : "Create account"}</h1>
      <p className="mt-3 text-base leading-6 text-muted-foreground">
        {isLogin
          ? "Welcome back. Sign in to your therapist account."
          : "Create your therapist account and get started with onboarding."}
      </p>

      <div className="mt-5">
        <SocialButtons label={isLogin ? "Sign in" : "Sign up"} redirectTo={isLogin ? sanitizedRedirectTo : "/pro/onboard"} />
      </div>

      <OrDivider />

      <div className="mt-4">
        <form onSubmit={onSubmit} className="space-y-3">
          {!isLogin ? (
            <AppInput
              aria-label="Full name"
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              minLength={2}
              maxLength={120}
              required
            />
          ) : null}
          <AppInput
            type="email"
            aria-label="Email address"
            placeholder="your@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <PasswordInput
            aria-label="Password"
            placeholder={isLogin ? "Password" : "At least 8 characters"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={8}
            showStrength={!isLogin}
            required
          />

          {isLogin ? (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Remember me
              </label>
              <Link href={forgotPasswordHref} className="text-sm font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          ) : null}

          <AppButton className="w-full" disabled={loading} type="submit">
            {loading
              ? (isLogin ? "Signing in..." : "Creating account...")
              : (isLogin ? "Sign in" : "Create account")}
          </AppButton>
        </form>
      </div>

      <div className="mt-5 text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href={registerHref} className="font-semibold text-primary hover:underline">Sign up</Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={loginHref} className="font-semibold text-primary hover:underline">Sign in</Link>
          </>
        )}
      </div>
    </Surface>
  );
}
