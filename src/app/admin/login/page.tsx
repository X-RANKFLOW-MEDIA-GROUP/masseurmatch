import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import LoginPageClient from "@/app/login/LoginPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Login",
  description: "Admin dashboard login.",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminLoginPage() {
  return <LoginPageClient />;
}
