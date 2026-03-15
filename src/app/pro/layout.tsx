import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionToken } from "@/mm/lib/auth-token";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = await readSessionToken(cookieStore.get("mm_session")?.value);

  if (!session || session.role !== "therapist") {
    redirect("/login?redirect=%2Fpro%2Fdashboard");
  }

  return children;
}
