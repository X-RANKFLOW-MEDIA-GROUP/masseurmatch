"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForms } from "@/app/_components/auth-forms";
import { useAuth } from "@/contexts/AuthContext";

function LoginPageContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString() ?? "");
  const redirectTo = params.get("redirect") || "/pro/profile";

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    router.replace(redirectTo);
  }, [loading, redirectTo, router, user]);

  return (
    <div className="container mx-auto px-4 py-10">
      <AuthForms mode="login" redirectTo={redirectTo} />
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
