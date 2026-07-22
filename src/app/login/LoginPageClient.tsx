"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthForms } from "@/app/_components/auth-forms";
import { useAuth } from "@/contexts/AuthContext";

function sanitizeRedirectTo(value: string | null) {
  const fallback = "/pro/dashboard";
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("admin.masseurmatch.com")) {
    return fallback;
  }
  return value;
}

function LoginPageContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString() ?? "");
  const redirectTo = sanitizeRedirectTo(params.get("redirect"));
  const oauthError = params.get("error_description") ?? params.get("error");
  const accountExists = params.get("account_exists") === "1";
  const existingEmail = params.get("email")?.trim() || "";
  const resetHref = `/forgot-password${existingEmail ? `?email=${encodeURIComponent(existingEmail)}` : ""}`;

  useEffect(() => {
    if (loading || !user) return;
    router.replace(redirectTo);
  }, [loading, redirectTo, router, user]);

  useEffect(() => {
    if (!existingEmail) return;
    window.localStorage.setItem("mm_saved_email", existingEmail);
    window.localStorage.setItem("mm_remember_me", "true");
  }, [existingEmail]);

  return (
    <div className="relative isolate overflow-hidden px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(139,30,45,0.14),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(139,30,45,0.10),transparent_34%)]" />
      <div className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-red-300/20 blur-3xl" />

      <div className="mx-auto max-w-5xl rounded-[32px] border border-border-subtle bg-white/85 p-4 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Member access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">Welcome back to MasseurMatch</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary">Sign in to manage your profile, rates, photos, visibility, and provider tools.</p>
        </div>

        {accountExists && (
          <div className="mx-auto mb-5 max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950">
            <p className="font-bold">An account with this email already exists.</p>
            <p className="mt-1">Sign in below{existingEmail ? ` using ${existingEmail}` : ""}. If you do not remember the password, reset it instead of creating another account.</p>
            <Link href={resetHref} className="mt-2 inline-flex font-bold underline">Reset password</Link>
          </div>
        )}

        {oauthError && (
          <div className="mx-auto mb-4 max-w-lg rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {oauthError === "auth_callback_failed"
              ? "Sign-in failed — please try again. If the issue persists, clear your cookies and retry."
              : oauthError}
          </div>
        )}

        <AuthForms mode="login" redirectTo={redirectTo} />
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="relative isolate overflow-hidden px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-border-subtle bg-white/85 p-4 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Member access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">Welcome back to MasseurMatch</h1>
        </div>
        <div className="mx-auto max-w-lg space-y-4">
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPageClient() {
  return <Suspense fallback={<LoginFormSkeleton />}><LoginPageContent /></Suspense>;
}
