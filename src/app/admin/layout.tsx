import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createPageMetadata } from "@/app/_lib/seo";
import { createServerSupabase } from "@/lib/supabase/server";
import AdminLayoutShell from "@/app/admin/_components/AdminLayoutShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = createPageMetadata({
  title: "Admin dashboard",
  description: "Private admin dashboard.",
  path: "/admin",
  noIndex: true,
});

async function ensureAdminAccess() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=%2Fadmin");
  }

  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") {
    redirect("/");
  }

  const { data: assurance, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error || assurance.currentLevel !== "aal2") {
    redirect("/admin-mfa?redirect=%2Fadmin");
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureAdminAccess();
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
