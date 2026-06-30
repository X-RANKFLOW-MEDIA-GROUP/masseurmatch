import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import { SignupShell } from "./_components/signup-shell";

export const metadata: Metadata = createPageMetadata({
  title: "Sign Up",
  description:
    "Create your professional profile on MasseurMatch, verify your identity, and start getting discovered by clients near you.",
  path: "/signup",
  keywords: [
    "massage therapist sign up",
    "get listed as a massage therapist",
    "massage directory profile",
    "therapist listing signup",
    "get massage clients online",
  ],
  // Onboarding funnel — keep out of the index alongside /login, /register, and
  // /forgot-password (robots.txt also disallows /signup).
  noIndex: true,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <SignupShell>{children}</SignupShell>;
}
