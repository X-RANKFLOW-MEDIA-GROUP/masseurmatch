import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function parseSessionRole(raw: string): string | null {
  try {
    const [payload] = decodeURIComponent(raw).split(".");
    if (!payload) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      role?: string;
    };
    return session?.role ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("mm_session")?.value;
  const role = raw ? parseSessionRole(raw) : null;

  if (role === "provider" || role === "admin") {
    redirect("/pro/dashboard");
  }

  if (role === "client") {
    redirect("/");
  }

  redirect("/login?redirect=/dashboard");
}
