import { Link, useNavigate } from "react-router-dom";
import { SafetyDisclaimer } from "@/components/legal/SafetyDisclaimer";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { CheckCircle2, Star, ArrowRight, MapPin, Tag, UserPlus, Plane, Search, Eye, MessageSquare, Users, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShieldIllustration, CommunityIllustration, GrowthIllustration } from "@/components/icons/IllustrationIcons";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { TextReveal } from "@/components/animations/TextReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { Marquee } from "@/components/animations/Marquee";
import { ParallaxSection } from "@/components/animations/ParallaxSection";
import { GradientMesh } from "@/components/animations/GradientMesh";
import { TiltCard } from "@/components/animations/TiltCard";
import { ImageReveal } from "@/components/animations/ImageReveal";
import { HorizontalScroll, HorizontalPanel } from "@/components/animations/HorizontalScroll";
import { fadeUp } from "@/components/animations/variants";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";

const Index = () => {
  const scrollRef = useScrollReveal();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { city: detectedCity, loading: geoLoading, prompted: geoPrompted, denied: geoDenied, requestLocation } = useGeolocation();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // City search state
  const [heroCity, setHeroCity] = useState("");

  // Fetch featured therapists from database
  const [featuredTherapists, setFeaturedTherapists] = useState<any[]>([]);
  const [specialOfferProfiles, setSpecialOfferProfiles] = useState<any[]>([]);
  const [newProfiles, setNewProfiles] = useState<any[]>([]);
  const [nearbyProfiles, setNearbyProfiles] = useState<any[]>([]);
  const [realStats, setRealStats] = useState({ therapists: 0, cities: 0 });

  // Show location prompt after a small delay if not prompted yet
  useEffect(() => {
    const dismissed = localStorage.getItem("mm_geo_dismissed");
    if (!geoPrompted && !geoLoading && !dismissed) {
      const timer = setTimeout(() => setShowLocationPrompt(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [geoPrompted, geoLoading]);

  // Fetch nearby therapists when city is detected
  useEffect(() => {
    if (!detectedCity) return;
    const fetchNearby = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, full_name, city, avatar_url, specialties, slug")
        .eq("is_active", true)
        .eq("status", "active")
        .ilike("city", detectedCity.name)
        .limit(6);
      if (data) {
        setNearbyProfiles(data.map((p: any) => ({
          id: p.id,
          name: p.display_name || p.full_name || "Therapist",
          city: p.city || "",
          specialty: (p.specialties || []).slice(0, 2).join(", ") || "Massage Therapy",
          image: p.avatar_url || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop",
          slug: p.slug,
        })));
      }
    };
    fetchNearby();
  }, [detectedCity]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const [featuredRes, specialsRes, newRes] = await Promise.all([
        supabase
          .from("featured_masters")
          .select("*, profiles(id, display_name, full_name, city, specialties, avatar_url, is_verified_identity)")
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("weekly_specials")
          .select("profile_id, text, profiles(id, display_name, full_name, city, avatar_url, specialties)")
          .eq("is_active", true)
          .gt("expires_at", new Date().toISOString())
          .limit(6),
        supabase
          .from("profiles")
          .select("id, display_name, full_name, city, avatar_url, specialties, created_at")
          .eq("status", "active")
          .eq("is_active", true)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      if (featuredRes.data && featuredRes.data.length > 0) {
        setFeaturedTherapists(
          featuredRes.data.map((f) => ({
            id: f.profiles?.id,
            name: f.profiles?.display_name || f.profiles?.full_name || "Therapist",
            city: f.city || f.profiles?.city || "",
            specialty: f.profiles?.specialties?.join(", ") || "Male Massage",
            image: f.profiles?.avatar_url || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop",
            verified: f.profiles?.is_verified_identity || false,
          }))
        );
      }

      if (specialsRes.data && specialsRes.data.length > 0) {
        setSpecialOfferProfiles(
          specialsRes.data.map((s: any) => ({
            id: s.profiles?.id || s.profile_id,
            name: s.profiles?.display_name || s.profiles?.full_name || "Therapist",
            city: s.profiles?.city || "",
            specialText: s.text,
            image: s.profiles?.avatar_url || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop",
          }))
        );
      }

      if (newRes.data && newRes.data.length > 0) {
        setNewProfiles(
          newRes.data.map((p: any) => ({
            id: p.id,
            name: p.display_name || p.full_name || "Therapist",
            city: p.city || "",
            specialty: (p.specialties || []).slice(0, 2).join(", ") || "Massage Therapy",
            image: p.avatar_url || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop",
          }))
        );
      }
    };
    fetchFeatured();

    // Fetch real stats
    const fetchStats = async () => {
      const { count: therapistCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("status", "active");
      const { data: cityData } = await supabase
        .from("profiles")
        .select("city")
        .eq("is_active", true)
        .not("city", "is", null);
      const uniqueCities = new Set((cityData || []).map((p: any) => p.city?.toLowerCase()).filter(Boolean));
      setRealStats({ therapists: therapistCount || 0, cities: uniqueCities.size });
    };
    fetchStats();
  }, []);

  const marqueeWords = [
    "Gay Massage", "M4M Massage", "Male Massage Therapist", "Deep Tissue",
    "Swedish", "Sports Recovery", "Hot Stone", "Aromatherapy", "Thai Massage",
    "Gay-Friendly Bodywork", "Men's Wellness", "LGBTQ Massage", "Shiatsu",
    "Reflexology", "Tantric Bodywork", "Male-to-Male Massage", "Relaxation",
    "Therapeutic", "Sensual Bodywork", "Gay Spa", "Masculine Touch",
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef} id="main-content">
      <SEOHead
        title="Gay Massage Directory — Find Male Massage Therapists Near You | MasseurMatch"
        description="The #1 gay massage directory. Browse verified male massage therapists near you. Deep tissue, Swedish, sports & therapeutic massage. Gay-friendly, trusted professionals."
        path="/"
        keywords="gay massage, male massage therapist, M4M massage, LGBTQ massage, gay-friendly massage, men's wellness massage, gay massage directory, male massage therapist near me, deep tissue massage, Swedish massage, sports recovery massage, therapeutic bodywork, gay-friendly bodywork, relaxation massage"
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      {/* ─── LOCATION PROMPT OVERLAY ─── */}
      <AnimatePresence>
        {showLocationPrompt && !geoPrompted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-sm w-full mx-4 p-8 rounded-2xl text-center"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 40px 100px hsl(0 0% 0% / 0.5)",
              }}
            >
              <motion.div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: "hsl(var(--primary) / 0.1)",
                  border: "1px solid hsl(var(--primary) / 0.2)",
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Navigation className="w-7 h-7 text-primary" />
              </motion.div>

              <h3 className="text-xl font-bold text-foreground mb-2">Find Therapists Near You</h3>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Allow location access to discover massage therapists in your area instantly.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => {
                    setShowLocationPrompt(false);
                    requestLocation();
                  }}
                >
                  <MapPin className="w-4 h-4" />
                  Enable Location
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    setShowLocationPrompt(false);
                    // Mark as prompted so it doesn't show again
                    localStorage.setItem("mm_geo_dismissed", "1");
                  }}
                >
                  Maybe Later
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <GradientMesh />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {detectedCity ? (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-8 flex items-center justify-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Therapists in {detectedCity.name}, {detectedCity.stateCode}
              </motion.p>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-8"
              >
                {t("home.heroTag")}
              </motion.p>
            )}

            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold text-foreground leading-[0.9] tracking-tight mb-8">
              <TextReveal text={t("home.heroTitle1")} delay={0.3} />
              <br />
              <TextReveal text={t("home.heroTitle2")} delay={0.5} />
              <br />
              <TextReveal text={t("home.heroTitle3")} delay={0.7} />
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              {t("home.heroDesc")}
            </motion.p>

            {/* City Search Autocomplete */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="max-w-md mx-auto mb-8"
            >
              <div className="relative">
                <CityAutocomplete
                  value={heroCity}
                  onChange={(val) => {
                    setHeroCity(val);
                    // If user selects from dropdown, navigate
                    const slug = val.toLowerCase().replace(/\s+/g, "-");
                    if (val && slug) {
                      navigate(`/${slug}`);
                    }
                  }}
                  placeholder="Search your city..."
                  className="w-full"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <MagneticButton>
                <Link to="/explore">
                  <Button size="lg" className="w-full sm:w-auto group text-base px-8">
                    {t("home.exploreBtn")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                    {t("home.viewPlans")}
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

      {/* ─── NEAR YOU ─── */}
      {detectedCity && nearbyProfiles.length > 0 && (
        <section className="py-20 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Near You
                  </p>
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                    <TextReveal text={`In ${detectedCity.name}`} />
                  </h2>
                </div>
                <Link to={`/${detectedCity.slug}/massage-therapists`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {nearbyProfiles.map((p, i) => (
                  <motion.div key={p.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                    <Link to={`/${detectedCity.slug}/therapist/${p.slug || p.id}`}>
                      <TiltCard className="glass-card p-4 text-center group">
                        <img src={p.image} alt={p.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 grayscale group-hover:grayscale-0 transition-all" loading="lazy" />
                        <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{p.specialty}</p>
                      </TiltCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              <TextReveal text="Three Simple Steps" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Search, num: "01", title: "Browse", desc: "Search verified massage therapists by city, specialty, or availability." },
              { icon: Eye, num: "02", title: "Contact", desc: "View profiles, compare services, and reach out directly to your therapist." },
              { icon: MessageSquare, num: "03", title: "Meet", desc: "Schedule your session directly with the therapist. We're a directory — no middleman." },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-4xl font-bold text-foreground/10 mb-2 font-heading">{step.num}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-28 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-12">
            {[
              { label: t("home.statTherapists"), end: realStats.therapists || 0, suffix: "+" },
              { label: t("home.statCities"), end: realStats.cities || 0, suffix: "" },
            ].filter(s => s.end > 0).map((stat, i) => (
              <motion.div
                key={stat.label + i}
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

      {/* ─── FEATURED THERAPISTS — Horizontal Scroll ─── */}
      {featuredTherapists.length > 0 && (
        <>
          <HorizontalScroll panels={Math.min(featuredTherapists.length + 1, 5)}>
            {/* Panel 1: Intro */}
            <HorizontalPanel>
              <div className="max-w-2xl">
                <motion.p
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6"
                >
                  {t("home.featuredTag")}
                </motion.p>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight leading-[0.9] mb-6">
                  <TextReveal text={t("home.featuredTitle")} />
                </h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-lg text-muted-foreground max-w-md"
                >
                  {t("home.featuredDesc")}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mt-10 flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <div className="w-12 h-px bg-muted-foreground/30" />
                  <span className="uppercase tracking-[0.3em] text-xs">Scroll to explore</span>
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </motion.div>
              </div>
            </HorizontalPanel>

            {/* Therapist panels */}
            {featuredTherapists.slice(0, 4).map((therapist, i) => (
              <HorizontalPanel key={therapist.id}>
                <TiltCard className="glass-card overflow-hidden group w-full max-w-lg">
                  <Link to={therapist.city ? `/${therapist.city.toLowerCase().replace(/\s+/g, "-")}/therapist/${therapist.id}` : `/therapist/${therapist.id}`} className="block">
                    <ImageReveal
                      direction={i % 2 === 0 ? "bottom" : "top"}
                      duration={1.4}
                      delay={0.1}
                      className="relative"
                    >
                      <img
                        src={therapist.image}
                        alt={`${therapist.name} — gay-friendly male massage therapist in ${therapist.city}`}
                        loading="lazy"
                        className="w-full h-[420px] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                      />
                      {therapist.verified && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs text-foreground z-20">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("home.verified")}
                        </div>
                      )}
                    </ImageReveal>

                     <div className="p-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-5xl font-bold text-foreground/5 font-heading">
                          0{i + 1}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border rounded px-2 py-0.5">
                          Advertiser
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">{therapist.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{therapist.city}</p>
                      <p className="text-sm text-muted-foreground">{therapist.specialty}</p>

                      <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                        {t("home.viewProfile")}
                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </HorizontalPanel>
            ))}
          </HorizontalScroll>

          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center py-16"
            >
              <MagneticButton>
                <Link to="/explore">
                  <Button variant="outline" size="lg" className="group">
                    {t("home.browseAll")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </>
      )}

      {/* ─── WHY CHOOSE US ─── */}
      <ParallaxSection speed={0.15}>
        <section className="py-28 md:py-36 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="reveal mb-16 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">{t("home.whyTag")}</p>
              <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
                <TextReveal text={t("home.whyTitle")} />
              </h2>
              <p className="text-muted-foreground mt-4">
                {t("home.whyDesc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { Icon: ShieldIllustration, num: "01", title: t("home.feature01Title"), desc: t("home.feature01Desc") },
                { Icon: CommunityIllustration, num: "02", title: t("home.feature02Title"), desc: t("home.feature02Desc") },
                { Icon: GrowthIllustration, num: "03", title: t("home.feature03Title"), desc: t("home.feature03Desc") },
              ].map((feature, i) => (
                <motion.div
                  key={feature.num}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <TiltCard className="glass-card p-12">
                    <feature.Icon className="text-muted-foreground mb-6" size={40} />
                    <div className="text-5xl font-bold text-foreground/10 mb-4 font-heading">{feature.num}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </TiltCard>
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
              {t("home.testimonial")}
            </motion.blockquote>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm text-muted-foreground uppercase tracking-widest"
            >
              {t("home.testimonialAuthor")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── SPECIAL OFFERS ─── */}
      {specialOfferProfiles.length > 0 && (
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-warning mb-2 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> Weekly Specials
                  </p>
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                    <TextReveal text="Special Offers" />
                  </h2>
                </div>
                <Link to="/explore">
                  <Button variant="outline" size="sm" className="gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialOfferProfiles.slice(0, 6).map((p, i) => (
                  <motion.div key={p.id + "-" + i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                    <Link to={p.city ? `/${p.city.toLowerCase().replace(/\s+/g, "-")}/therapist/${p.id}` : `/therapist/${p.id}`}>
                      <TiltCard className="glass-card p-5 group">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-full object-cover" loading="lazy" />
                          <div>
                            <h3 className="font-semibold text-sm">{p.name}</h3>
                            <p className="text-xs text-muted-foreground">{p.city}</p>
                          </div>
                          <Badge className="ml-auto text-[10px] bg-warning/20 text-warning border-warning/30">
                            <Tag className="w-2.5 h-2.5 mr-0.5" /> Offer
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{p.specialText}</p>
                      </TiltCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── NEW THERAPISTS ─── */}
      {newProfiles.length > 0 && (
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-success mb-2 flex items-center gap-2">
                    <UserPlus className="w-3.5 h-3.5" /> Just Joined
                  </p>
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                    <TextReveal text="New Therapists" />
                  </h2>
                </div>
                <Link to="/explore">
                  <Button variant="outline" size="sm" className="gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {newProfiles.slice(0, 6).map((p, i) => (
                  <motion.div key={p.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                    <Link to={p.city ? `/${p.city.toLowerCase().replace(/\s+/g, "-")}/therapist/${p.id}` : `/therapist/${p.id}`}>
                      <TiltCard className="glass-card p-4 text-center group">
                        <img src={p.image} alt={p.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 grayscale group-hover:grayscale-0 transition-all" loading="lazy" />
                        <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{p.city}</p>
                        <Badge className="mt-2 text-[10px] bg-success/20 text-success border-success/30">
                          <UserPlus className="w-2.5 h-2.5 mr-0.5" /> New
                        </Badge>
                      </TiltCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="py-36 md:py-44">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-7xl font-bold text-foreground tracking-tight mb-8">
              <TextReveal text={t("home.ctaTitle")} />
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              {t("home.ctaDesc")}
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
                    {t("home.ctaBtn")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                    {t("home.viewPlans")}
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
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">{t("home.citiesTag")}</p>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              <TextReveal text={t("home.citiesTitle")} />
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
                  to={`/${city.slug}`}
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

      <NewsletterSignup />
      <SafetyDisclaimer />
      <Footer />
    </div>
  );
};

export default Index;
