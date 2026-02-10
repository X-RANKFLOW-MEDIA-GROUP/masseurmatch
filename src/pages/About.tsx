import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, Users, TrendingUp, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { ParallaxSection } from "@/components/animations/ParallaxSection";
import { fadeUp } from "@/components/animations/variants";

const About = () => {
  const scrollRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <CursorGlow />
      <ScrollProgress />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6"
            >
              About MassageConnect
            </motion.p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[0.95]">
              <TextReveal text="The Trusted Gay Massage Directory" delay={0.1} />
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
            >
              MassageConnect is the premier platform for verified male massage therapists 
              to showcase their expertise and connect with men seeking trusted, gay-friendly 
              wellness and bodywork services.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* Stats */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto">
            {[
              { label: "Male Therapists", end: 10000, suffix: "+" },
              { label: "Cities", end: 500, suffix: "+" },
              { label: "Sessions Booked", end: 2000000, suffix: "+" },
              { label: "Satisfaction", end: 98, suffix: "%" },
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

      {/* Mission */}
      <ParallaxSection speed={0.1}>
        <section className="py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">Our Mission</p>
                <h2 className="text-3xl md:text-5xl font-bold mb-8">
                  <TextReveal text="Creating a safe space for men's wellness" />
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We believe every man deserves access to quality massage therapy in a safe, inclusive environment. 
                  Our mission is to create the most trusted gay massage directory — a marketplace where professional 
                  male massage therapists build their practice and clients find verified, gay-friendly professionals 
                  with confidence.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </ParallaxSection>

      <div className="h-px bg-border" />

      {/* Values */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <div className="reveal mb-16 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Our Values</p>
            <h2 className="text-3xl md:text-5xl font-bold">
              <TextReveal text="What we stand for" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border max-w-4xl">
            {[
              {
                icon: Shield, title: "Trust & Safety",
                desc: "All male massage professionals undergo thorough verification including license validation, identity checks, and background screening — ensuring a safe experience for the gay community."
              },
              {
                icon: Users, title: "LGBTQ+ Inclusive Community",
                desc: "We foster a supportive, gay-friendly community of male wellness professionals and clients. Everyone is welcome, and inclusion is at our core."
              },
              {
                icon: TrendingUp, title: "Professional Growth",
                desc: "Flexible tools and subscription plans designed to help male massage therapists grow their practice and reach more men seeking quality bodywork."
              },
              {
                icon: Heart, title: "Quality Standards",
                desc: "We maintain the highest standards to ensure clients receive exceptional men's wellness experiences from verified, professional male massage therapists."
              },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-background p-12 glow-hover"
              >
                <value.icon className="w-5 h-5 text-muted-foreground mb-6" />
                <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* SEO Block */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto reveal">
            <h2 className="text-2xl font-bold mb-6">About Our Gay Massage Directory</h2>
            <div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>
                MassageConnect is the most comprehensive gay massage directory on the internet. We connect 
                men with verified male massage therapists across 500+ cities in the United States. Our platform 
                specializes in helping gay, bisexual, and queer men find professional, trusted bodywork services.
              </p>
              <p>
                Whether you're searching for deep tissue massage, Swedish relaxation massage, sports recovery, 
                hot stone therapy, Thai massage, or therapeutic wellness bodywork from a male therapist, 
                MassageConnect makes it easy to find, compare, and book appointments with confidence.
              </p>
              <p>
                Every male massage therapist in our directory can be verified through our multi-step process 
                including professional license validation, identity verification, and real client reviews. 
                We're proud to serve the LGBTQ+ community with a safe, professional, and inclusive platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
