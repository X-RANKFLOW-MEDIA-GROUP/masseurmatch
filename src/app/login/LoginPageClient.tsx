"use client";

import { Suspense } from "react";
import { AuthForms } from "@/app/_components/auth-forms";
import { useAuth } from "@/contexts/AuthContext";

function LoginPageContent() {
  const { loading } = useAuth();

  return (
    <div className="container mx-auto px-4 py-10">
      <AuthForms mode="login" />
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
