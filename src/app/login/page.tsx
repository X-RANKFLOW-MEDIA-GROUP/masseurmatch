import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Login",
  description: "Private account login.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginPageClient />;
}
