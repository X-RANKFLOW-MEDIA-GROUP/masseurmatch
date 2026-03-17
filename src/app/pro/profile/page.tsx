import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/metadata";
import ProProfilePageClient from "./ProProfilePageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Edit pro profile",
  description: "Private therapist profile editor.",
  path: "/pro/profile",
  noIndex: true,
});

export default function ProProfilePage() {
  return <ProProfilePageClient />;
}
