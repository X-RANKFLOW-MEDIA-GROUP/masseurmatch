"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      await signOut().catch(() => null);
      if (mounted) {
        router.replace("/");
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [router, signOut]);

  return (
    <main className="page-shell py-24 text-center">
      <p className="text-sm text-muted-foreground">Signing you out…</p>
    </main>
  );
}
