import LegacyAdminView from "./LegacyAdminView";

export default function AdminFeatured() {
  return (
    <LegacyAdminView
      description="Featured listing management is now handled from the therapists admin page."
      href="/admin/therapists"
      title="Admin Featured Listings"
    />
  );
}

