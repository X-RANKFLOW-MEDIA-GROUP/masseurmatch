import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import AdminEmailCenter from "./AdminEmailCenter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminEmailsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email Center"
        description="Generate AI assisted newsletters and campaigns, segment audiences, save templates, schedule delivery, and monitor the compliant lifecycle email system."
      />
      <AdminEmailCenter />
    </div>
  );
}
