import type { Metadata } from "next";
import { NearMeRedirect } from "@/app/_components/near-me-redirect";

export const metadata: Metadata = {
  title: "Male Massage Therapists Near Me | MasseurMatch",
  description:
    "Find verified male massage therapists near your current location. MasseurMatch detects your city and connects you with LGBTQ+-affirming professionals offering deep tissue, Swedish, outcall, and more.",
  alternates: { canonical: "https://masseurmatch.com/near-me" },
  robots: { index: true, follow: true },
};

export default function NearMePage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <NearMeRedirect />
    </div>
  );
}
