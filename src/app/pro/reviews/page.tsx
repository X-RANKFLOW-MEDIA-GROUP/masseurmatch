import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/metadata";
import ProReviewsPageClient from "./ProReviewsPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Import your reviews",
  description: "Bring the reviews you earned on other platforms to your MasseurMatch profile.",
  path: "/pro/reviews",
  noIndex: true,
});

export default function ProReviewsPage() {
  return <ProReviewsPageClient />;
}
