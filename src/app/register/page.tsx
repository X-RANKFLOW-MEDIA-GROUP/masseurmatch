import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import RegisterPageClient from "./RegisterPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Register",
  description: "Private therapist registration.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterPageClient />;
}
