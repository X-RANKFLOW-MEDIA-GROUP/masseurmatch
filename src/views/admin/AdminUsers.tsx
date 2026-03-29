import LegacyAdminView from "./LegacyAdminView";

export default function AdminUsers() {
  return (
    <LegacyAdminView
      description="User management now lives in the dedicated users page of the admin console."
      href="/admin/users"
      title="Admin Users"
    />
  );
}
