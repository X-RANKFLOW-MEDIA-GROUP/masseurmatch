import { LoginForm } from "@/mm/components/auth-forms";
import { SectionHeading } from "@/mm/components/primitives";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Log in",
  description: "Therapist and admin access for the MasseurMatch directory platform.",
  path: "/login",
});

type LoginPageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Access"
        title="Log in to manage your listing."
        description="Therapist and admin users can sign in here. Visitor browsing never requires an account."
      />
      <div className="mt-10">
        <LoginForm redirectPath={resolvedSearchParams?.redirect} />
      </div>
    </section>
  );
}
