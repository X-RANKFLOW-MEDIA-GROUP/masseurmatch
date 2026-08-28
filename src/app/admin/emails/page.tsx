import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import AdminEmailCenter from "./AdminEmailCenter";
import SystemEmailTools from "./SystemEmailTools";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminEmailsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email Center"
        description="Preview system templates, verify AI setup, create campaigns, segment audiences, save templates, schedule delivery, and monitor email operations."
      />
      <SystemEmailTools />
      <AdminEmailCenter />
    </div>
  );
}
