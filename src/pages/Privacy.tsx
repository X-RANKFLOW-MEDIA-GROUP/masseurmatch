import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";

const Privacy = () => {
  const scrollRef = useScrollReveal();

  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide when creating a provider account (name, email, listing details). For visitors, we collect standard analytics data including IP address, browser type, pages visited, and referring URLs. We use cookies for essential site functionality and analytics.",
    },
    {
      title: "2. How We Use Your Information",
      content: "Provider information is used to display advertising listings on the directory. Analytics data helps us improve the site experience. We do not sell personal information to third parties. We may use email addresses to send service-related communications to providers.",
    },
    {
      title: "3. Cookies",
      content: "We use essential cookies for site functionality and analytics cookies to understand usage patterns. You can disable cookies in your browser settings, though some site features may not work correctly without them.",
    },
    {
      title: "4. Third-Party Services",
      content: "We may use third-party services for analytics (e.g., Google Analytics), payment processing for provider subscriptions, and email delivery. These services have their own privacy policies governing how they handle your data.",
    },
    {
      title: "5. Data Retention",
      content: "Provider account data is retained for the duration of the active subscription plus 30 days. Analytics data is retained in aggregate form. Users may request deletion of their personal data by contacting us.",
    },
    {
      title: "6. Your Rights",
      content: "You have the right to access, correct, or delete your personal information. You may opt out of non-essential cookies. To exercise these rights, please contact us through our Contact page.",
    },
    {
      title: "7. Changes to This Policy",
      content: "We may update this privacy policy periodically. Changes will be posted on this page with an updated revision date. Last updated: February 2026.",
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
              <TextReveal text="Privacy Policy" delay={0.1} />
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
              <Link to="/terms" className="underline-sweep hover:text-foreground transition-colors">Terms of Service</Link>
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

export default Privacy;
