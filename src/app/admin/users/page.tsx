import { AdminUsersTable } from "@/mm/components/admin-tools";
import { SectionHeading } from "@/mm/components/primitives";
import { getDirectorySnapshot } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Admin users",
  description: "Review all users in the directory and update admin or therapist roles.",
  path: "/admin/users",
});

export default async function AdminUsersPage() {
  const snapshot = await getDirectorySnapshot();

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Admin"
        title="User role management."
        description="Promote or demote platform users between therapist and admin roles."
      />
      <div className="mt-10">
        <AdminUsersTable users={snapshot.users} />
      </div>
    </section>
  );
}
