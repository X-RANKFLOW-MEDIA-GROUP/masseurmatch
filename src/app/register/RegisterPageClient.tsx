"use client";

import { AuthForms } from "@/app/_components/auth-forms";

export default function RegisterPageClient() {
  return (
    <div className="container mx-auto px-4 py-10">
      <AuthForms mode="register" />
    </div>
  );
}
