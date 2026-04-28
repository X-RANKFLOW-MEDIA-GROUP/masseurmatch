"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForms } from "@/app/_components/auth-forms";
import { useAuth } from "@/contexts/AuthContext";

function RegisterPageContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString() ?? "");
  const redirectTo = params.get("redirect") || "/pro/onboard";

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    router.replace(redirectTo);
  }, [loading, redirectTo, router, user]);

  return (
    <div className="container mx-auto px-4 py-10">
      <AuthForms mode="register" redirectTo={redirectTo} />
    </div>
  );
}

export default function RegisterPageClient() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-10" />}>
      <RegisterPageContent />
    </Suspense>
  );
}
