import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import { SignupShell } from "./_components/signup-shell";

const SIGNUP_SOCIAL_IMAGE =
  "https://res.cloudinary.com/dyfxkq2nk/image/upload/c_fill,g_center,w_1200,h_630,q_auto:best/v1785553494/ChatGPT_Image_Jul_31_2026_07_31_32_PM_tsdzpd.png";

export const metadata: Metadata = createPageMetadata({
  title: "Join MasseurMatch — Create Your Therapist Profile",
  description:
    "Create your MasseurMatch profile, verify your identity, and get discovered by clients looking for LGBTQ+-affirming male massage therapists.",
  path: "/signup",
  image: SIGNUP_SOCIAL_IMAGE,
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
