import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import AuthPageClient from "./AuthPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Authentication",
  description: "Private login and registration screen.",
  path: "/auth",
  noIndex: true,
});

export default function AuthPage() {
  return <AuthPageClient />;
}