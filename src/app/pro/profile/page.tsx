import { redirect } from "next/navigation";

// The profile editor lives at /pro/listing. This route was a second, partial
// editor writing the same table with divergent field names; it now redirects
// so there is a single source of truth for editing a profile.
export default function ProProfilePage() {
  redirect("/pro/listing");
}
