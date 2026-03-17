import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";
import { ShieldCheck, AlertTriangle, UserCheck, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo/SEOHead";

const Safety = () => {
  const scrollRef = useScrollReveal();
  const { t } = useTranslation();

  const tips = [
    { icon: UserCheck, title: t("safety.tip1Title"), desc: t("safety.tip1Desc") },
    { icon: Phone, title: t("safety.tip2Title"), desc: t("safety.tip2Desc") },
    { icon: ShieldCheck, title: t("safety.tip3Title"), desc: t("safety.tip3Desc") },
    { icon: AlertTriangle, title: t("safety.tip4Title"), desc: t("safety.tip4Desc") },
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title="Safety Guidelines — MasseurMatch Gay Massage Directory"
        description="Important safety guidelines for using MasseurMatch. Learn how to stay safe when finding male massage therapists through our directory."
        path="/safety"
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              {t("safety.tag")}
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <TextReveal text={t("safety.title")} delay={0.1} />
            </h1>
          </div>

          <div className="max-w-3xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="glass-card p-8 mb-12">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                {t("safety.importantNotice")}
              </h2>
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p dangerouslySetInnerHTML={{ __html: t("safety.notice1") }} />
                <p dangerouslySetInnerHTML={{ __html: t("safety.notice2") }} />
                <p dangerouslySetInnerHTML={{ __html: t("safety.notice3") }} />
                <p dangerouslySetInnerHTML={{ __html: t("safety.notice4") }} />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold mb-8">{t("safety.tipsTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-lg overflow-hidden mb-12">
              {tips.map((tip, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-background p-8">
                  <tip.icon className="w-6 h-6 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center glass-card p-8">
              <h3 className="text-xl font-bold mb-3">{t("safety.reportTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t("safety.reportDesc")}</p>
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold underline-sweep hover:text-foreground transition-colors">
                {t("safety.contactUs")}
              </Link>
            </motion.div>

            <div className="mt-12 text-center text-sm text-muted-foreground space-x-4">
              <Link to="/faq" className="underline-sweep hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/terms" className="underline-sweep hover:text-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="underline-sweep hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Safety;
