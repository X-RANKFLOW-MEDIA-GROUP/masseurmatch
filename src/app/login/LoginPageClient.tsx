"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForms } from "@/app/_components/auth-forms";
import { useAuth } from "@/contexts/AuthContext";

function sanitizeRedirectTo(value: string | null) {
  const fallback = "/pro/dashboard";

  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (value.includes("admin.masseurmatch.com")) {
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

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    router.replace(redirectTo);
  }, [loading, redirectTo, router, user]);

  return (
    <div className="relative isolate overflow-hidden px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(30,64,175,0.18),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(249,115,22,0.16),transparent_34%)]" />
      <div className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-orange-300/20 blur-3xl" />

      <div className="mx-auto max-w-5xl rounded-[32px] border border-border-subtle bg-white/85 p-4 shadow-[0_24px_60px_rgb(var(--color-brand-primary-rgb)/0.08)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Member access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Welcome back to MasseurMatch
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary">
            Sign in to manage your profile, respond to leads faster, and keep your listing optimized for local discovery.
          </p>
        </div>
        <AuthForms mode="login" redirectTo={redirectTo} />
      </div>
    </div>
  );
}

export default function LoginPageClient() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-10" />}>
      <LoginPageContent />
    </Suspense>
  );
}
