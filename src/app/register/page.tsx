import { RegisterForm } from "@/mm/components/auth-forms";
import { SectionHeading } from "@/mm/components/primitives";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Register",
  description: "Create a therapist account on MasseurMatch and move into the onboarding flow.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Therapist registration"
        title="Create your therapist account."
        description="Registration is for therapists only. After signup you will continue into the profile onboarding flow."
      />
      <div className="mt-10">
        <RegisterForm />
      </div>
    </section>
  );
}
