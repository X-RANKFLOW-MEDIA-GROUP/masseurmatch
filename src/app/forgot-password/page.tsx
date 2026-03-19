import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Forgot password",
  description: "Private password reset flow.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
