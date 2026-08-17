import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/app/_lib/seo";
import { createServerSupabase } from "@/lib/supabase/server";
import { normalizeSessionRole } from "@/app/api/_lib/session";
import { getProviderPhoneVerificationState } from "@/lib/provider-phone-verification";
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

  // Admins are not provider listings and should not be forced through provider
  // phone verification just to use administrative tooling under /pro.
  if (role === "admin") return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, phone_number, is_verified_phone")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return;

  const { verified } = getProviderPhoneVerificationState({
    profilePhone: profile.phone,
    profilePhoneNumber: profile.phone_number,
    isVerifiedPhone: profile.is_verified_phone,
    authPhone: user.phone,
    phoneConfirmedAt: user.phone_confirmed_at,
  });

  // Every provider account must prove ownership of its profile phone before
  // using /pro. This includes draft/hidden legacy accounts, not only profiles
  // that already reached public visibility.
  if (!verified) {
    redirect("/verify-phone?redirect=%2Fpro%2Fdashboard");
  }
}

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  await ensureProAccess();
  return <ProLayoutClient>{children}</ProLayoutClient>;
}
