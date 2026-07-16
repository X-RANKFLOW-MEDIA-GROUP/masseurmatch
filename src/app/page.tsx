import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/metadata";
import ComingSoonPage from "./coming-soon/page";

export const metadata: Metadata = createPageMetadata({
  title: "MasseurMatch — Coming Soon",
  description:
    "AI-powered verified therapist discovery — a premium directory of male massage therapists you can trust.",
  path: "/",
});

export default function Page() {
  return <ComingSoonPage />;
}
