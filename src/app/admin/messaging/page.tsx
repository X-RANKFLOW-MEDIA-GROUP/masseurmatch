import type { Metadata } from "next";

import { createPageMetadata } from "@/app/_lib/seo";
import AdminMessaging from "./AdminMessaging";

export const metadata: Metadata = createPageMetadata({
  title: "Messaging",
  description: "Private MasseurMatch messaging operations dashboard.",
  path: "/admin/messaging",
  noIndex: true,
});

export default function AdminMessagingPage() {
  return <AdminMessaging />;
}
