import LegacyAdminView from "./LegacyAdminView";

export default function AdminModeration() {
  return (
    <LegacyAdminView
      description="Moderation tasks now live on the reviews page in the admin console."
      href="/admin/reviews"
      title="Admin Moderation"
    />
  );
}

