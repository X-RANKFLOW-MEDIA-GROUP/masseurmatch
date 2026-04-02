import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Reset password",
  description: "Set a new password for your account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}
