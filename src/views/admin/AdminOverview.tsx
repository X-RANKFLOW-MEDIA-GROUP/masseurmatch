import LegacyAdminView from "./LegacyAdminView";

export default function AdminOverview() {
  return (
    <LegacyAdminView
      description="This legacy overview now points to the current admin dashboard."
      href="/admin"
      title="Admin Overview"
    />
  );
}

