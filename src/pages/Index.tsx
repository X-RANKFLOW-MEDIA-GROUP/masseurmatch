import { Link } from "react-router-dom";
import { SafetyDisclaimer } from "@/components/legal/SafetyDisclaimer";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Star, ArrowRight, MapPin } from "lucide-react";
import { ShieldIllustration, CommunityIllustration, GrowthIllustration } from "@/components/icons/IllustrationIcons";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { TextReveal } from "@/components/animations/TextReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { Marquee } from "@/components/animations/Marquee";
import { ParallaxSection } from "@/components/animations/ParallaxSection";
import { GradientMesh } from "@/components/animations/GradientMesh";
import { fadeUp } from "@/components/animations/variants";

const Index = () => {
  const scrollRef = useScrollReveal();

  const featuredTherapists = [
    {
      id: 1, name: "Marcus Rivera", city: "Los Angeles",
      specialty: "Deep Tissue & Sports Massage",
      rating: 4.9, reviews: 127,
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop",
      verified: true, plan: "Platinum"
    },
    {
      id: 2, name: "James Chen", city: "San Francisco",
      specialty: "Swedish & Relaxation Massage",
      rating: 4.8, reviews: 94,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
      verified: true, plan: "Gold"
    },
    {
      id: 3, name: "David Anderson", city: "New York",
      specialty: "Therapeutic Wellness Bodywork",
      rating: 5.0, reviews: 156,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop",
      verified: true, plan: "Premium"
    },
    {
      id: 4, name: "Alex Thompson", city: "Miami",
      specialty: "Hot Stone & Aromatherapy",
      rating: 4.9, reviews: 112,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop",
      verified: true, plan: "Premium"
    },
    {
      id: 5, name: "Ryan Martinez", city: "Chicago",
      specialty: "Sports Recovery Massage",
      rating: 4.7, reviews: 89,
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop",
      verified: true, plan: "Standard"
    },
    {
      id: 6, name: "Kyle Johnson", city: "Seattle",
      specialty: "Men's Wellness & Bodywork",
      rating: 4.8, reviews: 103,
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=800&fit=crop",
      verified: false, plan: "Standard"
    }
  ];

  const marqueeWords = [
    "Deep Tissue", "Swedish", "Sports Recovery", "Hot Stone", "Aromatherapy",
    "Thai Massage", "Shiatsu", "Reflexology", "Men's Wellness", "Bodywork",
    "Relaxation", "Therapeutic", "Gay-Friendly",
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <CursorGlow />
      <ScrollProgress />
      <Header />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <GradientMesh />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-8"
            >
              The #1 Gay Massage Directory
            </motion.p>

            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold text-foreground leading-[0.9] tracking-tight mb-8">
              <TextReveal text="Find Verified" delay={0.3} />
              <br />
              <TextReveal text="Male Massage" delay={0.5} />
              <br />
              <TextReveal text="Therapists" delay={0.7} />
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Browse trusted, gay-friendly massage professionals near you. 
              Read reviews, compare services, and find your next therapist with confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <MagneticButton>
                <Link to="/explore">
                  <Button size="lg" className="w-full sm:w-auto group text-base px-8">
                    Explore Therapists
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                    View Plans
                  </Button>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      </section>

      {/* ─── MARQUEE ─── */}
      <section className="py-8 border-b border-border overflow-hidden">
        <Marquee items={marqueeWords} />
      </section>

      {/* ─── STATS ─── */}
      <section className="py-28 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Male Therapists", end: 10000, suffix: "+" },
              { label: "Cities Covered", end: 500, suffix: "+" },
              { label: "Verified Profiles", end: 8500, suffix: "+" },
              { label: "5-Star Reviews", end: 98, suffix: "%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl font-bold text-foreground mb-2 font-heading">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED THERAPISTS ─── */}
      <section className="py-28 md:py-36">
        <div className="container mx-auto px-4">
          <div className="reveal mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Featured Male Massage Professionals</p>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              <TextReveal text="Top Verified Therapists" />
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Discover gay-friendly male massage therapists verified for trust, professionalism, and excellence in men's bodywork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {featuredTherapists.map((therapist, i) => (
              <motion.div
                key={therapist.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
              >
                <Link
                  to={`/therapist/${therapist.id}`}
                  className="bg-background p-8 group transition-all duration-700 hover:bg-card block glow-hover relative"
                >
                  <div className="relative mb-6 overflow-hidden">
                    <img
                      src={therapist.image}
                      alt={`${therapist.name} — gay-friendly male massage therapist in ${therapist.city}`}
                      loading="lazy"
                      className="w-full h-72 object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                    />
                    {therapist.verified && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 text-xs text-foreground">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{therapist.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{therapist.city}</p>
                      <p className="text-sm text-muted-foreground">{therapist.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-foreground text-foreground" />
                      <span>{therapist.rating}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                    View Profile
                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-16"
          >
            <MagneticButton>
              <Link to="/explore">
                <Button variant="outline" size="lg" className="group">
                  Browse All Male Massage Therapists
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <ParallaxSection speed={0.15}>
        <section className="py-28 md:py-36 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="reveal mb-16 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Why Choose MasseurMatch</p>
              <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
                <TextReveal text="Built for Trust & Safety" />
              </h2>
              <p className="text-muted-foreground mt-4">
                The most trusted gay massage directory — every male therapist is professionally verified for your peace of mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
              {[
                {
                  Icon: ShieldIllustration, num: "01", title: "Professional Directory",
                  desc: "A curated advertising directory of male massage therapists. Browse listings, read reviews, and contact providers directly. Note: we do not verify licenses or credentials."
                },
                {
                  Icon: CommunityIllustration, num: "02", title: "Gay-Friendly Community",
                  desc: "A trusted directory built specifically for men seeking professional male massage services. Read authentic reviews from clients in a safe, inclusive space."
                },
                {
                  Icon: GrowthIllustration, num: "03", title: "Grow Your Practice",
                  desc: "Flexible advertising plans designed to help male massage therapists reach more clients seeking men's bodywork services."
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.num}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-background p-12 glow-hover relative"
                >
                  <feature.Icon className="text-muted-foreground mb-6" size={40} />
                  <div className="text-5xl font-bold text-foreground/10 mb-4 font-heading">{feature.num}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* ─── TESTIMONIAL STRIP ─── */}
      <section className="py-20 border-t border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.blockquote
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-2xl md:text-4xl font-heading font-bold text-foreground leading-snug mb-8"
            >
              "Finally, a directory I can trust. Found an incredible male massage therapist in minutes."
            </motion.blockquote>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm text-muted-foreground uppercase tracking-widest"
            >
              — Verified Client, New York
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-36 md:py-44">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-7xl font-bold text-foreground tracking-tight mb-8">
              <TextReveal text="Ready to get started?" />
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              List your male massage services today and connect with thousands of clients 
              seeking gay-friendly, professional bodywork in their area.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <MagneticButton>
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto group text-base px-8">
                    Create Free Profile
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                    View Plans
                  </Button>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED CITIES ─── */}
      <section className="py-28 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="reveal mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Browse by City</p>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              <TextReveal text="Featured Cities" />
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border max-w-5xl mx-auto">
            {[
              { slug: "los-angeles", name: "Los Angeles", state: "CA" },
              { slug: "new-york", name: "New York", state: "NY" },
              { slug: "san-francisco", name: "San Francisco", state: "CA" },
              { slug: "miami", name: "Miami", state: "FL" },
              { slug: "chicago", name: "Chicago", state: "IL" },
              { slug: "seattle", name: "Seattle", state: "WA" },
            ].map((city, i) => (
              <motion.div
                key={city.slug}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link
                  to={`/city/${city.slug}`}
                  className="bg-background p-6 group glow-hover block text-center"
                >
                  <MapPin className="w-5 h-5 text-muted-foreground mx-auto mb-3 group-hover:text-foreground transition-colors" />
                  <h3 className="text-sm font-semibold">{city.name}</h3>
                  <p className="text-xs text-muted-foreground">{city.state}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SafetyDisclaimer />
      <Footer />
    </div>
  );
};

export default Index;
