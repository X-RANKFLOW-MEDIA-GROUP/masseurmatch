import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShieldIllustration, CommunityIllustration, GrowthIllustration, HeartIllustration } from "@/components/icons/IllustrationIcons";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { ParallaxSection } from "@/components/animations/ParallaxSection";
import { fadeUp } from "@/components/animations/variants";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo/SEOHead";

const About = () => {
  const scrollRef = useScrollReveal();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title="About MasseurMatch — The Trusted Gay Massage Directory"
        description="Learn about MasseurMatch, the premier gay-friendly directory for male massage therapists. Our mission, values, and commitment to trust and safety."
        path="/about"
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
              {t("about.tag")}
            </motion.p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[0.95]">
              <TextReveal text={t("about.title")} delay={0.1} />
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {t("about.desc")}
            </motion.p>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto">
            {[
              { label: t("about.statTherapists"), end: 10000, suffix: "+" },
              { label: t("about.statCities"), end: 500, suffix: "+" },
              { label: t("about.statSessions"), end: 2000000, suffix: "+" },
              { label: t("about.statSatisfaction"), end: 98, suffix: "%" },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
                <div className="text-3xl md:text-5xl font-bold text-foreground font-heading mb-2">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      <ParallaxSection speed={0.1}>
        <section className="py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">{t("about.missionTag")}</p>
                <h2 className="text-3xl md:text-5xl font-bold mb-8">
                  <TextReveal text={t("about.missionTitle")} />
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{t("about.missionDesc")}</p>
              </motion.div>
            </div>
          </div>
        </section>
      </ParallaxSection>

      <div className="h-px bg-border" />

      <section className="py-28">
        <div className="container mx-auto px-4">
          <div className="reveal mb-16 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">{t("about.valuesTag")}</p>
            <h2 className="text-3xl md:text-5xl font-bold">
              <TextReveal text={t("about.valuesTitle")} />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border max-w-4xl">
            {[
              { Icon: ShieldIllustration, title: t("about.value1Title"), desc: t("about.value1Desc") },
              { Icon: CommunityIllustration, title: t("about.value2Title"), desc: t("about.value2Desc") },
              { Icon: GrowthIllustration, title: t("about.value3Title"), desc: t("about.value3Desc") },
              { Icon: HeartIllustration, title: t("about.value4Title"), desc: t("about.value4Desc") },
            ].map((value, i) => (
              <motion.div key={value.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-background p-12 glow-hover">
                <value.Icon className="text-muted-foreground mb-6" size={36} />
                <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto reveal">
            <h2 className="text-2xl font-bold mb-6">{t("about.seoTitle")}</h2>
            <div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>{t("about.seoP1")}</p>
              <p>{t("about.seoP2")}</p>
              <p>{t("about.seoP3")}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
