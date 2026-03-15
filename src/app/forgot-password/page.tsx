import { ForgotPasswordForm } from "@/mm/components/auth-forms";
import { SectionHeading } from "@/mm/components/primitives";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Forgot password",
  description: "Request password reset instructions for a therapist or admin account.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Account help"
        title="Reset your password."
        description="Enter the email attached to your therapist or admin account and we will process the reset request."
      />
      <div className="mt-10">
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
