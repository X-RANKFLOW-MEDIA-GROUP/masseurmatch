import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Sparkles, CreditCard, Shield, Gift, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";

const Pricing = () => {
  const scrollRef = useScrollReveal();
  const { t } = useTranslation();
  const { subscription } = useAuth();

  const plans = [
    {
      name: t("pricing.free"), price: t("pricing.freePrice"), period: t("pricing.month"),
      description: t("pricing.freeDesc"),
      features: [t("pricing.freeFeature1"), t("pricing.freeFeature2"), t("pricing.freeFeature3"), t("pricing.freeFeature4"), t("pricing.freeFeature5")],
      cta: t("pricing.freeCta"), popular: false, isFree: true, founderPrice: null as string | null,
    },
    {
      name: t("pricing.standard"), price: t("pricing.standardPrice"), period: t("pricing.month"),
      description: t("pricing.standardDesc"),
      features: [t("pricing.standardFeature1"), t("pricing.standardFeature2"), t("pricing.standardFeature3"), t("pricing.standardFeature4"), t("pricing.standardFeature5"), t("pricing.standardFeature6")],
      cta: t("pricing.standardCta"), popular: false, isFree: false, founderPrice: "$19.50",
    },
    {
      name: t("pricing.pro"), price: t("pricing.proPrice"), period: t("pricing.month"),
      description: t("pricing.proDesc"),
      features: [t("pricing.proFeature1"), t("pricing.proFeature2"), t("pricing.proFeature3"), t("pricing.proFeature4"), t("pricing.proFeature5"), t("pricing.proFeature6"), t("pricing.proFeature7"), t("pricing.proFeature8")],
      cta: t("pricing.proCta"), popular: true, isFree: false, founderPrice: "$39.50",
    },
    {
      name: t("pricing.elite"), price: t("pricing.elitePrice"), period: t("pricing.month"),
      description: t("pricing.eliteDesc"),
      features: [t("pricing.eliteFeature1"), t("pricing.eliteFeature2"), t("pricing.eliteFeature3")],
      cta: t("pricing.eliteCta"), popular: false, isFree: false, founderPrice: "$49.50",
    },
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title="Advertising Plans — MasseurMatch Gay Massage Directory"
        description="Choose your advertising plan on MasseurMatch. Free to Platinum plans for male massage therapists. Reach more gay-friendly massage clients."
        path="/pricing"
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-16">
        {subscription.config_error && (
          <div className="container mx-auto px-4 mb-6">
            <div className="max-w-3xl mx-auto flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-accent-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                Subscription info is temporarily unavailable. Prices shown are standard rates — your actual plan will be reflected once the system reconnects.
              </p>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              {t("pricing.tag")}
            </motion.p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <TextReveal text={t("pricing.title")} delay={0.1} />
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("pricing.desc")}
            </motion.p>
          </div>

          {/* Founder Deal Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-3xl mx-auto mb-12 p-6 rounded-lg border border-primary/20 bg-primary/5 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg text-foreground">Founder Deal — 50% OFF for 3 months</span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Limited to the first 50 members. All paid plans include a 14-day free trial.</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="w-3 h-3" /> Card required
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" /> Anti-fraud protection
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border max-w-7xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`bg-background p-10 glow-hover relative ${plan.popular ? 'ring-1 ring-foreground/20' : ''}`}
              >
                {plan.popular && <div className="absolute -top-px left-0 right-0 h-px bg-foreground" />}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{plan.name}</p>
                    {plan.popular && <Badge className="text-[10px]">Most Popular</Badge>}
                    {plan.isFree && <Badge variant="secondary" className="text-[10px]">14 days</Badge>}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-bold text-foreground font-heading">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>
                  {plan.founderPrice && (
                    <p className="text-xs text-primary font-semibold">
                      Founder price: {plan.founderPrice}/mo for 3 months
                    </p>
                  )}
                  {plan.isFree && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <CreditCard className="w-3 h-3" /> Card required to start trial
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-10">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant={plan.popular ? "default" : "outline"} className="w-full group">
                    {plan.cta}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Add-ons Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mt-20 p-8 rounded-lg border border-border bg-background"
          >
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">{t("pricing.addonsTitle")}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{t("pricing.addonsDesc")}</p>
            <ul className="space-y-3">
              {[t("pricing.addon1"), t("pricing.addon2"), t("pricing.addon3"), t("pricing.addon4"), t("pricing.addon5")].map((addon, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{addon}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="max-w-3xl mx-auto mt-32">
            <div className="reveal mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-center">
                <TextReveal text={t("pricing.faqTitle")} />
              </h2>
            </div>
            <div className="space-y-px bg-border">
              {[
                { q: t("pricing.faqQ1"), a: t("pricing.faqA1") },
                { q: t("pricing.faqQ2"), a: t("pricing.faqA2") },
                { q: t("pricing.faqQ3"), a: t("pricing.faqA3") },
                { q: t("pricing.faqQ4"), a: t("pricing.faqA4") },
                { q: t("pricing.faqQ5"), a: t("pricing.faqA5") },
              ].map((faq, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-background p-8">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground max-w-xl mx-auto">
            <p>{t("pricing.faqDisclaimer")}</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
