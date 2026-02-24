import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SafetyDisclaimer } from "@/components/legal/SafetyDisclaimer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo/SEOHead";

const FAQPage = () => {
  const scrollRef = useScrollReveal();
  const { t } = useTranslation();

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    { q: t("faq.q8"), a: t("faq.a8") },
    { q: t("faq.q9"), a: t("faq.a9") },
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title="FAQ — MasseurMatch Gay Massage Directory"
        description="Frequently asked questions about MasseurMatch. Learn about our gay massage directory, how it works, and our policies."
        path="/faq"
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              {t("faq.tag")}
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <TextReveal text={t("faq.title")} delay={0.1} />
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-lg">
              {t("faq.desc")}
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto space-y-px bg-border rounded-lg overflow-hidden">
            {faqs.map((faq, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-background p-8">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center text-sm text-muted-foreground space-x-4">
            <Link to="/safety" className="underline-sweep hover:text-foreground transition-colors">{t("nav.safety")}</Link>
            <Link to="/terms" className="underline-sweep hover:text-foreground transition-colors">{t("footer.termsOfService")}</Link>
            <Link to="/privacy" className="underline-sweep hover:text-foreground transition-colors">{t("footer.privacyPolicy")}</Link>
            <Link to="/contact" className="underline-sweep hover:text-foreground transition-colors">{t("nav.contact")}</Link>
          </div>
        </div>
      </section>

      <SafetyDisclaimer />
      <Footer />
    </div>
  );
};

export default FAQPage;
