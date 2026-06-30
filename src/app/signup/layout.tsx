import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import { SignupShell } from "./_components/signup-shell";

export const metadata: Metadata = createPageMetadata({
  title: "Sign Up",
  description:
    "Create your professional profile on MasseurMatch, verify your identity, and start getting discovered by clients near you.",
  path: "/signup",
  // Account-creation funnel — disallowed in robots.txt; keep it out of the index too.
  noIndex: true,
  keywords: [
    "massage therapist sign up",
    "get listed as a massage therapist",
    "massage directory profile",
    "therapist listing signup",
    "get massage clients online",
  ],
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <SignupShell>{children}</SignupShell>;
}
