"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";

function AuthConfirmInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token_hash = params.get("token_hash");
    const type = params.get("type") as
      | "recovery"
      | "signup"
      | "invite"
      | "email_change"
      | "magiclink"
      | null;

    if (!token_hash || !type) return;

    supabase.auth
      .verifyOtp({ token_hash, type })
      .then(({ error }) => {
        if (error) {
          router.replace(
            `/forgot-password?error=${encodeURIComponent(error.message)}`
          );
        } else if (type === "recovery") {
          router.replace("/reset-password");
        } else {
          router.replace("/dashboard");
        }
      });
  }, []);

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <div className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
        Validating your reset link… If nothing happens, please{" "}
        <Link href="/forgot-password" className="underline">
          request a new link
        </Link>
        .
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-lg px-4 py-10">
          <div className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
            Validating your reset link…
          </div>
        </div>
      }
    >
      <AuthConfirmInner />
    </Suspense>
  );
}
