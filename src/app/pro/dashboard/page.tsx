import { ProfileEditor } from "@/mm/components/pro-tools";
import { Card, SectionHeading } from "@/mm/components/primitives";
import { getCities, getSubscriptionForUser, getTherapistForUser, getTherapistReviews } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";
import { getSessionUser } from "@/mm/lib/session";

export const metadata = buildMetadata({
  title: "Therapist dashboard",
  description: "Review profile completeness, listing status, views, reviews, and profile editing tools.",
  path: "/pro/dashboard",
});

export default async function ProDashboardPage() {
  const session = await getSessionUser();

  if (!session) {
    return null;
  }

  const [therapist, cities, subscription] = await Promise.all([
    getTherapistForUser(session.id),
    getCities(),
    getSubscriptionForUser(session.id),
  ]);

  if (!therapist || !subscription) {
    return null;
  }

  const reviews = await getTherapistReviews(therapist.id);

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Dashboard"
        title="Monitor your listing and keep the profile sharp."
        description="This dashboard shows profile completeness, listing status, view count, and approved review coverage."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Completeness</p>
          <p className="mt-4 font-display text-4xl">{therapist.profileCompleteness}%</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Status</p>
          <p className="mt-4 font-display text-4xl">{therapist.status}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Views</p>
          <p className="mt-4 font-display text-4xl">{therapist.viewCount}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Approved reviews</p>
          <p className="mt-4 font-display text-4xl">{reviews.length}</p>
        </Card>
      </div>
      <div className="mt-10">
        <ProfileEditor cities={cities} therapist={therapist} />
      </div>
    </section>
  );
}
