import { ContactForm } from "@/mm/components/contact-form";
import { SectionHeading } from "@/mm/components/primitives";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Reach the MasseurMatch team about therapist listings, moderation, partnerships, or support.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Contact"
        title="Talk to the directory team."
        description="Use this form for listing support, city coverage questions, moderation requests, or advertising inquiries."
      />
      <div className="mt-10">
        <ContactForm />
      </div>
    </section>
  );
}
