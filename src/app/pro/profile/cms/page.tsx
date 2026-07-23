import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/metadata";
import ProProfileCmsPageClient from "./ProProfileCmsPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Profile CMS",
  description: "Comprehensive profile editor with advanced settings.",
  path: "/pro/profile/cms",
  noIndex: true,
});

export default function ProProfileCmsPage() {
  return <ProProfileCmsPageClient />;
}
