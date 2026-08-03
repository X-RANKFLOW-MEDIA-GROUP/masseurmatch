import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import AdminEmailComposer from "./AdminEmailComposer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminEmailsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email Center"
        description="Compose and send individual or bulk provider emails through Resend."
      />
      <AdminEmailComposer />
    </div>
  );
}
