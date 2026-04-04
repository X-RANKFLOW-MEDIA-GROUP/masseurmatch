"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppButton, AppInput, Surface } from "@/app/_components/primitives";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SIGNUP_BOOTSTRAP_STORAGE_KEY } from "@/app/signup/_lib/signup-context";

type AuthMethod = "email" | "phone" | "email-otp";

const SIGNUP_DESTINATION = "/signup/plan";

function primeSignupBootstrap(payload: {
  fullName?: string;
  email?: string;
  phone?: string;
  termsAccepted?: boolean;
  complianceAcknowledged?: boolean;
}) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    SIGNUP_BOOTSTRAP_STORAGE_KEY,
    JSON.stringify({
      accountCreated: true,
      fullName: payload.fullName?.trim() ?? "",
      displayName: payload.fullName?.trim() ?? "",
      email: payload.email?.trim() ?? "",
      phone: payload.phone?.trim() ?? "",
      termsAccepted: Boolean(payload.termsAccepted),
      complianceAcknowledged: Boolean(payload.complianceAcknowledged),
    }),
  );
}

function SocialButtons({ label, nextPath }: { label: string; nextPath: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(provider);

    const redirectUrl = new URL("/api/auth/callback", window.location.origin);
    redirectUrl.searchParams.set("next", nextPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl.toString(),
      },
    });

    if (error) {
      setLoading(null);
    }
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
          <path fill="#FBBC05" d="M5.84 14.09A6.98 6.98 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.42l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
        </svg>
        {loading === "google" ? "Connecting..." : `${label} with Google`}
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
        {loading === "apple" ? "Connecting..." : `${label} with Apple`}
      </button>
    </div>
  );
}

function OrDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          or
        </span>
      </div>
    </div>
  );
}

function MethodTabs({
  method,
  onChange,
  tabs,
}: {
  method: AuthMethod;
  onChange: (method: AuthMethod) => void;
  tabs: Array<{ key: AuthMethod; label: string }>;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-secondary/40 p-1 text-xs font-medium">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex-1 rounded-md px-2 py-1.5 transition ${method === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function PhoneOtpForm({ isLogin, redirectTo }: { isLogin: boolean; redirectTo: string }) {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone.trim()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    setLoading(false);

    if (error) {
      toast({ title: "Could not send OTP", description: error.message, variant: "destructive" });
      return;
    }

    setOtpSent(true);
    toast({ title: "OTP sent", description: "Check your phone for a text message." });
  };

  const verifyOtp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp,
      type: "sms",
    });

    if (error) {
      setLoading(false);
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      return;
    }

    if (data.session?.access_token) {
      await fetch("/api/auth/sync-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: data.session.access_token }),
      });
    }

    setLoading(false);
    if (!isLogin) {
      primeSignupBootstrap({ phone });
    }
    toast({ title: isLogin ? "Welcome back" : "Account created" });
    window.location.href = isLogin ? redirectTo : SIGNUP_DESTINATION;
  };

  return (
    <div className="space-y-3">
      <AppInput
        type="tel"
        aria-label="Phone number"
        placeholder="+1 (555) 123-4567"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        disabled={otpSent}
        required
      />
      {otpSent ? (
        <>
          <AppInput
            type="text"
            aria-label="One-time password code"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
          <AppButton className="w-full" disabled={loading || otp.length < 6} onClick={verifyOtp}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </AppButton>
          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
            }}
            className="text-xs text-muted-foreground hover:underline"
          >
            Change phone number
          </button>
        </>
      ) : (
        <AppButton className="w-full" disabled={loading || !phone.trim()} onClick={sendOtp}>
          {loading ? "Sending..." : "Send OTP via SMS"}
        </AppButton>
      )}
    </div>
  );
}

function EmailOtpForm({ isLogin, redirectTo }: { isLogin: boolean; redirectTo: string }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setLoading(false);

    if (error) {
      toast({ title: "Could not send OTP", description: error.message, variant: "destructive" });
      return;
    }

    setOtpSent(true);
    toast({ title: "OTP sent", description: "Check your email inbox." });
  };

  const verifyOtp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "email",
    });

    if (error) {
      setLoading(false);
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      return;
    }

    if (data.session?.access_token) {
      await fetch("/api/auth/sync-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: data.session.access_token }),
      });
    }

    setLoading(false);
    if (!isLogin) {
      primeSignupBootstrap({ email });
    }
    toast({ title: isLogin ? "Welcome back" : "Account created" });
    window.location.href = isLogin ? redirectTo : SIGNUP_DESTINATION;
  };

  return (
    <div className="space-y-3">
      <AppInput
        type="email"
        aria-label="Email address"
        placeholder="your@email.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={otpSent}
        required
      />
      {otpSent ? (
        <>
          <AppInput
            type="text"
            aria-label="One-time password code"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
          <AppButton className="w-full" disabled={loading || otp.length < 6} onClick={verifyOtp}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </AppButton>
          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
            }}
            className="text-xs text-muted-foreground hover:underline"
          >
            Change email
          </button>
        </>
      ) : (
        <AppButton className="w-full" disabled={loading || !email.trim()} onClick={sendOtp}>
          {loading ? "Sending..." : "Send OTP via Email"}
        </AppButton>
      )}
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [method, setMethod] = useState<AuthMethod>("email");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [complianceAcknowledged, setComplianceAcknowledged] = useState(false);

  const isLogin = mode === "login";
  const availableMethods = useMemo<Array<{ key: AuthMethod; label: string }>>(
    () =>
      isLogin
        ? [
            { key: "email", label: "Email & Password" },
            { key: "phone", label: "Phone OTP" },
            { key: "email-otp", label: "Email OTP" },
          ]
        : [{ key: "email", label: "Email & Password" }],
    [isLogin],
  );
  const postAuthDestination = isLogin ? redirectTo : SIGNUP_DESTINATION;
  const isFormInteractive = isHydrated && !loading;
  const canSubmit = useMemo(() => {
    if (!isHydrated || method !== "email") {
      return false;
    }

    if (isLogin) {
      return email.trim().length > 0 && password.length > 0;
    }

    return (
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      termsAccepted &&
      complianceAcknowledged
    );
  }, [
    complianceAcknowledged,
    email,
    fullName,
    isHydrated,
    isLogin,
    method,
    password,
    termsAccepted,
  ]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isLogin) return;

    const saved = localStorage.getItem("mm_saved_email");
    if (saved) {
      setEmail(saved);
    }

    const savedRemember = localStorage.getItem("mm_remember_me");
    if (savedRemember !== null) {
      setRememberMe(savedRemember === "true");
    }
  }, [isLogin]);

  useEffect(() => {
    if (availableMethods.some((entry) => entry.key === method)) {
      return;
    }

    setMethod(availableMethods[0]?.key ?? "email");
  }, [availableMethods, method]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isLogin && !termsAccepted) {
      toast({
        title: "Terms required",
        description: "Please accept the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !complianceAcknowledged) {
      toast({
        title: "Compliance required",
        description: "Please acknowledge the Therapist Agreement and platform policies.",
        variant: "destructive",
      });
      return;
    }

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
      ? await signIn(email, password)
      : await signUp(email, password, fullName);

    setLoading(false);

    if (result.error) {
      const errorMessage = result.error.message || "";
      const isUserExists =
        errorMessage.includes("already exists") ||
        errorMessage.includes("USER_EXISTS") ||
        ((typeof (result.error as { code?: unknown })?.code === "string" &&
          (result.error as { code?: string }).code) === "USER_EXISTS");

      toast({
        title: isLogin ? "Login failed" : "Could not register",
        description: isUserExists
          ? "An account with this email already exists. Please sign in instead."
          : errorMessage,
        variant: "destructive",
      });

      if (isUserExists) {
        router.push("/login");
      }
      return;
    }

    if (!isLogin) {
      primeSignupBootstrap({
        fullName,
        email,
        termsAccepted,
        complianceAcknowledged,
      });
    }

    toast({
      title: isLogin ? "Welcome back" : "Account created",
      description: isLogin ? undefined : "You can continue into onboarding now.",
    });

    window.location.href = postAuthDestination;
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
          ? "Sign in to your therapist account."
          : "Create your therapist account and continue into onboarding."}
      </p>

      {isLogin ? (
        <>
          <div className="mt-5">
            <SocialButtons label="Sign in" nextPath={postAuthDestination} />
          </div>
          <OrDivider />
        </>
      ) : null}

      {availableMethods.length > 1 ? (
        <MethodTabs method={method} onChange={setMethod} tabs={availableMethods} />
      ) : null}

      <div className="mt-4">
        {method === "phone" ? (
          <PhoneOtpForm isLogin={isLogin} redirectTo={redirectTo} />
        ) : method === "email-otp" ? (
          <EmailOtpForm isLogin={isLogin} redirectTo={redirectTo} />
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            {!isLogin ? (
              <AppInput
                aria-label="Full name"
                placeholder="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={!isFormInteractive}
                required
              />
            ) : null}
            <AppInput
              type="email"
              aria-label="Email address"
              placeholder="your@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!isFormInteractive}
              required
            />
            <AppInput
              type="password"
              aria-label="Password"
              placeholder={isLogin ? "Password" : "At least 8 characters"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!isFormInteractive}
              minLength={8}
              required
            />

            {isLogin ? (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    disabled={!isFormInteractive}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-border/70 bg-secondary/25 p-4">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    disabled={!isFormInteractive}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" className="font-semibold text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-semibold text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={complianceAcknowledged}
                    onChange={(event) => setComplianceAcknowledged(event.target.checked)}
                    disabled={!isFormInteractive}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    I acknowledge the{" "}
                    <Link
                      href="/therapist-agreement"
                      className="font-semibold text-primary hover:underline"
                    >
                      Therapist Agreement
                    </Link>{" "}
                    and platform policies.
                  </span>
                </label>
              </div>
            )}

            <AppButton className="w-full" disabled={loading || !canSubmit} type="submit">
              {loading
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </AppButton>
          </form>
        )}
      </div>

      <div className="mt-5 text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </div>
    </Surface>
  );
}
