import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { RouteError } from "@/app/api/_lib/http";
import { createPageMetadata } from "@/app/_lib/seo";
import { requireAdminSession } from "@/app/api/_lib/supabase-server";

export const metadata: Metadata = createPageMetadata({
  title: "Admin dashboard",
  description: "Private admin dashboard.",
  path: "/admin",
  noIndex: true,
});

async function ensureAdminAccess() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    await requireAdminSession(
      new Request("http://localhost/admin", {
        headers: {
          cookie: cookieHeader,
        },
      }),
    );
  } catch (error) {
    if (error instanceof RouteError && error.status === 401) {
      redirect("/login?redirect=%2Fadmin");
    }

    redirect("/");
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureAdminAccess();
  return <>{children}</>;
}
