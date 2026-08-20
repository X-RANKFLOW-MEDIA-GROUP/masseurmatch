import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createPageMetadata } from "@/app/_lib/seo";
import { createServerSupabase } from "@/lib/supabase/server";
import AdminMfaClient from "./AdminMfaClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = createPageMetadata({
  title: "Admin security",
  description: "Secure administrator authentication.",
  path: "/admin-mfa",
  noIndex: true,
});

function safeAdminRedirect(value: string | undefined) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin";
  }
  return value;
}

export default async function AdminMfaPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const destination = safeAdminRedirect(params.redirect);
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/admin-mfa?redirect=${encodeURIComponent(destination)}`)}`);
  }

  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") {
    redirect("/");
  }

  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel === "aal2") {
    redirect(destination);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <AdminMfaClient redirectTo={destination} />
    </main>
  );
}
