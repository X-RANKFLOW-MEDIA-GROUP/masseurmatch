import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import RegisterPageClient from "./RegisterPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Sign Up",
  description: "Create a therapist account.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterPageClient />;
}
