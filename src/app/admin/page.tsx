import Link from "next/link";
import { Card, SectionHeading } from "@/mm/components/primitives";
import { getAdminStats } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Admin overview",
  description: "Review therapist, city, revenue, and moderation totals across the MasseurMatch admin console.",
  path: "/admin",
});

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Overview stats for the current directory."
        description="Use these totals to monitor therapist volume, current recurring revenue, city coverage, and moderation load."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Therapists</p>
          <p className="mt-4 font-display text-4xl">{stats.activeTherapists}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">MRR</p>
          <p className="mt-4 font-display text-4xl">${stats.mrr}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Cities</p>
          <p className="mt-4 font-display text-4xl">{stats.cities}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Pending reviews</p>
          <p className="mt-4 font-display text-4xl">{stats.pendingReviews}</p>
        </Card>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["/admin/therapists", "Manage therapists"],
          ["/admin/users", "Manage users"],
          ["/admin/reviews", "Moderate reviews"],
          ["/admin/cities", "City coverage"],
          ["/admin/keywords", "Keyword matrix"],
          ["/admin/blog", "Editorial"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="surface-panel px-5 py-4 text-sm font-semibold text-foreground">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
