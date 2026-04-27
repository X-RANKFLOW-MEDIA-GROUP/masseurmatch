import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = createPageMetadata({
  title: "Reset password",
  description: "Set a new password for your MasseurMatch account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
