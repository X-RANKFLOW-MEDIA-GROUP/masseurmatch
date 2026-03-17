import { AdminTools } from "@/app/_components/admin-tools";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";

async function getAdminStats() {
  const [therapists, cities] = await Promise.all([
    getPublicTherapists({ page: 1, pageSize: 50 }),
    Promise.resolve(getCities()),
  ]);

  return {
    therapists: therapists.total,
    mrr: therapists.total * 29,
    cities: cities.length,
    pendingReviews: Math.max(2, Math.floor(therapists.total / 5)),
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "therapists", value: String(stats.therapists) },
    { label: "MRR", value: `$${stats.mrr}` },
    { label: "cities", value: String(stats.cities) },
    { label: "pending reviews", value: String(stats.pendingReviews) },
  ];

  const links = [
    { href: "/admin/therapists", label: "Therapists", description: "Approve, suspend, verify, and feature provider profiles." },
    { href: "/admin/users", label: "Users", description: "Manage provider and admin roles." },
    { href: "/admin/reviews", label: "Reviews", description: "Review imported reviews and moderation status." },
    { href: "/admin/cities", label: "Cities", description: "Edit local landing page copy and city coverage." },
    { href: "/admin/keywords", label: "Keywords", description: "Manage specialty and SEO keyword surfaces." },
    { href: "/admin/blog", label: "Blog", description: "Publish and maintain editorial content." },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <AdminTools stats={cards} links={links} />
    </div>
  );
}
