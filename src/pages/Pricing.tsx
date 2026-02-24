import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
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

const Pricing = () => {
  const scrollRef = useScrollReveal();
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pricing.free"), price: t("pricing.freePrice"), period: t("pricing.month"),
      description: t("pricing.freeDesc"),
      features: ["Basic profile listing", "3 photos maximum", "City-level visibility", "Standard search results", "Basic contact display"],
      cta: "Get Started Free", popular: false,
    },
    {
      name: t("pricing.standard"), price: t("pricing.standardPrice"), period: t("pricing.month"),
      description: t("pricing.standardDesc"),
      features: ["Enhanced profile listing", "10 photos maximum", "Featured in search results", "Service menu display", "Basic analytics", "Priority email support"],
      cta: "Start Standard", popular: false,
    },
    {
      name: t("pricing.premium"), price: t("pricing.premiumPrice"), period: t("pricing.month"),
      description: t("pricing.premiumDesc"),
      features: ["Verified badge", "Unlimited photos", "Homepage rotation (3x/week)", "Advanced analytics", "Gallery & hours management", "Premium placement", "24/7 priority support"],
      cta: "Go Premium", popular: true,
    },
    {
      name: t("pricing.gold"), price: t("pricing.goldPrice"), period: t("pricing.month"),
      description: t("pricing.goldDesc"),
      features: ["All Premium features", "Top search placement", "Daily homepage feature", "Extended profile content", "'Featured' badge", "Dedicated account manager", "Custom branding"],
      cta: "Choose Gold", popular: false,
    },
    {
      name: t("pricing.platinum"), price: t("pricing.platinumPrice"), period: t("pricing.month"),
      description: t("pricing.platinumDesc"),
      features: ["All Gold features", "Permanent homepage presence", "'Boosted' badge", "API access", "White-label options", "Custom domain support", "Marketing consultation", "Priority feature requests"],
      cta: "Go Platinum", popular: false,
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border max-w-7xl mx-auto">
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
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-5xl font-bold text-foreground font-heading">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
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

          <div className="max-w-3xl mx-auto mt-32">
            <div className="reveal mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-center">
                <TextReveal text={t("pricing.faqTitle")} />
              </h2>
            </div>
            <div className="space-y-px bg-border">
              {[
                { q: "Can I change plans at any time?", a: "Yes! Upgrade or downgrade your male massage therapist listing anytime. Changes take effect immediately with prorated billing." },
                { q: "What payment methods do you accept?", a: "We accept all major credit cards and PayPal through our secure Stripe payment processor." },
                { q: "Is there a contract or commitment?", a: "No contracts. All plans are month-to-month. Cancel anytime with no penalties." },
                { q: "How does verification work for male massage therapists?", a: "MasseurMatch does not verify licenses, credentials, or qualifications. 'Verified' badges and 'Featured'/'Boosted' labels indicate paid advertising placement only. Users are encouraged to verify providers independently." },
                { q: "Is this platform LGBTQ+ friendly?", a: "Absolutely. MasseurMatch was built as a trusted, inclusive directory for gay-friendly male massage therapists and their clients." },
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
