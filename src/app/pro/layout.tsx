import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/app/_lib/metadata";
import { parseSessionCookieValue } from "@/app/_lib/session";
import ProLayoutClient from "./ProLayoutClient";

export const metadata: Metadata = createPageMetadata({
  title: "Pro dashboard",
  description: "Private therapist dashboard.",
  path: "/pro",
  noIndex: true,
});

async function ensureProAccess() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get("mm_session")?.value;
  const session = parseSessionCookieValue(rawValue);

  if (!session) {
    redirect("/login?redirect=%2Fpro%2Fdashboard");
  }
}

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  await ensureProAccess();
  return <ProLayoutClient>{children}</ProLayoutClient>;
}
