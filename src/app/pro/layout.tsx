import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RouteError } from "@/app/api/_lib/http";
import { createPageMetadata } from "@/app/_lib/metadata";
import { requireRequestSession } from "@/app/_lib/session";
import ProLayoutClient from "./ProLayoutClient";

export const metadata: Metadata = createPageMetadata({
  title: "Pro dashboard",
  description: "Private therapist dashboard.",
  path: "/pro",
  noIndex: true,
});

async function ensureProAccess() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    requireRequestSession(
      new Request("http://localhost/pro", {
        headers: {
          cookie: cookieHeader,
        },
      }),
    );
  } catch (error) {
    if (error instanceof RouteError && error.status === 401) {
      redirect("/login?redirect=%2Fpro%2Fdashboard");
    }

    redirect("/");
  }
}

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  await ensureProAccess();
  return <ProLayoutClient>{children}</ProLayoutClient>;
}
