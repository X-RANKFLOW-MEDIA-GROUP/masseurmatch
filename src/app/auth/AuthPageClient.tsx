"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForms } from "@/app/_components/auth-forms";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode") === "signup" ? "register" : "login";
  const redirectTo = searchParams?.get("redirect") || "/pro/dashboard";

  return (
    <div className="container mx-auto px-4 py-10">
      <AuthForms mode={mode} redirectTo={redirectTo} />
    </div>
  );
}

export default function AuthPageClient() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-10" />}>
      <AuthPageContent />
    </Suspense>
  );
}