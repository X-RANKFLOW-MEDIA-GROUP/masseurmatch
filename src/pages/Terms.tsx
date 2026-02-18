import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";

const Terms = () => {
  const scrollRef = useScrollReveal();

  const sections = [
    {
      title: "1. About This Directory",
      content: `MasseurMatch ("we," "our," "us") operates an advertising directory that allows massage therapists and bodywork providers ("Providers") to advertise their services. We are not a marketplace, booking platform, or service provider. We do not arrange, facilitate, or guarantee any services between users and providers.`,
    },
    {
      title: "2. No Verification or Endorsement",
      content: `We do not verify, validate, or endorse the licenses, credentials, certifications, qualifications, identity, or background of any Provider listed on this directory. All listing content is self-reported by Providers. "Featured," "Boosted," or similar labels indicate paid advertising placement only and do not imply endorsement, verification, or recommendation.`,
    },
    {
      title: "3. No Booking or Payment Processing",
      content: `MasseurMatch does not process bookings, appointments, or payments. All scheduling, pricing, and payment arrangements are made directly between users and Providers. We bear no responsibility for the outcome of any transaction or interaction.`,
    },
    {
      title: "4. User Responsibilities",
      content: `Users must be 18 years or older to access this directory. Users are solely responsible for conducting their own due diligence before contacting or engaging with any Provider. Users agree to use the directory for lawful purposes only.`,
    },
    {
      title: "5. Provider Responsibilities",
      content: `Providers are solely responsible for the accuracy of their listing content. Providers must comply with all applicable local, state, and federal laws regarding their services. Adult, explicit, or sexual content is strictly prohibited and will result in immediate removal.`,
    },
    {
      title: "6. Limitation of Liability",
      content: `MasseurMatch is provided "as is" without warranties of any kind. We are not liable for any damages, injuries, losses, or disputes arising from the use of this directory or from interactions with Providers. Users engage with Providers entirely at their own risk.`,
    },
    {
      title: "7. Content Policy",
      content: `Adult content, sexually explicit material, and any content promoting illegal activities is strictly prohibited. We reserve the right to remove any listing or user account that violates these terms without notice.`,
    },
    {
      title: "8. Changes to Terms",
      content: `We may update these terms at any time. Continued use of the directory constitutes acceptance of the updated terms. Last updated: February 2026.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4"
            >
              Legal
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <TextReveal text="Terms of Service" delay={0.1} />
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              Last updated: February 2026
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-3">{section.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}

            <div className="pt-8 border-t border-border text-sm text-muted-foreground space-x-4">
              <Link to="/privacy" className="underline-sweep hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/safety" className="underline-sweep hover:text-foreground transition-colors">Safety</Link>
              <Link to="/faq" className="underline-sweep hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/contact" className="underline-sweep hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
