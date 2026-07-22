import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/app/_lib/metadata";
import { createServerSupabase } from "@/lib/supabase/server";
import { normalizeSessionRole } from "@/app/api/_lib/session";
import ProLayoutClient from "./ProLayoutClient";

export const metadata: Metadata = createPageMetadata({
  title: "Pro dashboard",
  description: "Private therapist dashboard.",
  path: "/pro",
  noIndex: true,
});

async function ensureProAccess() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=%2Fpro%2Fdashboard");
  }

  const role =
    normalizeSessionRole((user.app_metadata as Record<string, unknown> | undefined)?.role) ??
    normalizeSessionRole((user.user_metadata as Record<string, unknown> | undefined)?.role);

  if (role !== "provider" && role !== "admin") {
    redirect("/");
  }
}

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  await ensureProAccess();
  return <ProLayoutClient>{children}</ProLayoutClient>;
}
