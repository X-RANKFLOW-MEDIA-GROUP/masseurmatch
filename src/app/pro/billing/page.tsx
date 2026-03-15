import { BillingPanel } from "@/mm/components/pro-tools";
import { Card, SectionHeading } from "@/mm/components/primitives";
import { getSubscriptionForUser } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";
import { getSessionUser } from "@/mm/lib/session";

export const metadata = buildMetadata({
  title: "Therapist billing",
  description: "Review the current listing tier, change subscription level, and access the billing portal.",
  path: "/pro/billing",
});

type ProBillingPageProps = {
  searchParams?: Promise<{ portal?: string }>;
};

export default async function ProBillingPage({ searchParams }: ProBillingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const session = await getSessionUser();

  if (!session) {
    return null;
  }

  const subscription = await getSubscriptionForUser(session.id);

  if (!subscription) {
    return null;
  }

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Billing"
        title="Manage visibility tiers and billing state."
        description="Change between Free, Pro, and Featured plans. The portal link is included here for production Stripe portal handoff."
      />
      {resolvedSearchParams?.portal ? (
        <Card className="mt-8">
          <p className="text-sm text-muted-foreground">Billing portal opened in demo mode. Connect a live Stripe portal URL in production.</p>
        </Card>
      ) : null}
      <div className="mt-10">
        <BillingPanel subscription={subscription} />
      </div>
    </section>
  );
}
