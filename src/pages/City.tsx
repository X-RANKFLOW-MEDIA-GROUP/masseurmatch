import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SafetyDisclaimer } from "@/components/legal/SafetyDisclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";
import { SEOHead } from "@/components/seo/SEOHead";

const cityData: Record<string, { name: string; state: string; intro: string; lat: number; lng: number }> = {
  "los-angeles": { name: "Los Angeles", state: "CA", intro: "Discover professional male massage therapists across Los Angeles — from West Hollywood to Santa Monica. LA's vibrant LGBTQ+ community makes it one of the top cities for finding trusted, gay-friendly bodywork providers.", lat: 34.05, lng: -118.24 },
  "san-francisco": { name: "San Francisco", state: "CA", intro: "San Francisco's Castro district and beyond offer a welcoming environment for men seeking professional massage services. Browse our directory to find male massage therapists throughout the Bay Area.", lat: 37.77, lng: -122.42 },
  "new-york": { name: "New York", state: "NY", intro: "From Manhattan to Brooklyn, New York City hosts a diverse community of male massage professionals. Find gay-friendly therapists offering deep tissue, Swedish, sports recovery, and more.", lat: 40.71, lng: -74.01 },
  "miami": { name: "Miami", state: "FL", intro: "Miami's warm climate and vibrant culture make it a hub for wellness and bodywork. Browse male massage therapists in South Beach, Wilton Manors, and throughout South Florida.", lat: 25.76, lng: -80.19 },
  "chicago": { name: "Chicago", state: "IL", intro: "Chicago's Boystown neighborhood and surrounding areas are home to many skilled male massage therapists. Find professional, gay-friendly bodywork providers in the Windy City.", lat: 41.88, lng: -87.63 },
  "seattle": { name: "Seattle", state: "WA", intro: "Seattle's progressive community and focus on wellness make it an excellent city for finding professional male massage services. Browse our directory for therapists across the Puget Sound region.", lat: 47.61, lng: -122.33 },
};

const therapistsByCity: Record<string, Array<{ id: number; name: string; specialty: string; rating: number; reviews: number; price: string; image: string; verified: boolean; featured: boolean }>> = {
  "los-angeles": [
    { id: 1, name: "Marcus Rivera", specialty: "Deep Tissue & Sports Massage", rating: 4.9, reviews: 127, price: "$120/hr", image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop", verified: true, featured: true },
  ],
  "san-francisco": [
    { id: 2, name: "James Chen", specialty: "Swedish & Relaxation Massage", rating: 4.8, reviews: 94, price: "$100/hr", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop", verified: true, featured: false },
  ],
  "new-york": [
    { id: 3, name: "David Anderson", specialty: "Therapeutic Wellness Bodywork", rating: 5.0, reviews: 156, price: "$150/hr", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop", verified: true, featured: true },
  ],
  "miami": [
    { id: 4, name: "Alex Thompson", specialty: "Hot Stone & Aromatherapy", rating: 4.9, reviews: 112, price: "$110/hr", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop", verified: true, featured: false },
  ],
  "chicago": [
    { id: 5, name: "Ryan Martinez", specialty: "Sports Recovery Massage", rating: 4.7, reviews: 89, price: "$95/hr", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop", verified: true, featured: false },
  ],
  "seattle": [
    { id: 6, name: "Kyle Johnson", specialty: "Men's Wellness & Bodywork", rating: 4.8, reviews: 103, price: "$90/hr", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=800&fit=crop", verified: false, featured: false },
  ],
};

const allCities = Object.entries(cityData).map(([slug, data]) => ({ slug, ...data }));

const City = () => {
  const { slug } = useParams<{ slug: string }>();
  const scrollRef = useScrollReveal();
  const city = slug ? cityData[slug] : null;
  const therapists = slug ? therapistsByCity[slug] || [] : [];

  if (!city) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">City Not Found</h1>
          <Link to="/explore" className="text-muted-foreground underline-sweep hover:text-foreground">Browse all therapists</Link>
        </div>
      </div>
    );
  }

  const cityJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://masseurmatch.com/" },
      { "@type": "ListItem", "position": 2, "name": "Explore", "item": "https://masseurmatch.com/explore" },
      { "@type": "ListItem", "position": 3, "name": `${city.name}, ${city.state}`, "item": `https://masseurmatch.com/city/${slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title={`Male Massage Therapists in ${city.name}, ${city.state} — MasseurMatch`}
        description={`Find gay-friendly male massage therapists in ${city.name}. Browse verified profiles, compare services and prices. Deep tissue, Swedish, sports recovery & more.`}
        path={`/city/${slug}`}
        jsonLd={cityJsonLd}
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4"
            >
              <MapPin className="w-3 h-3 inline mr-1" />
              {city.name}, {city.state}
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <TextReveal text={`Male Massage Therapists in ${city.name}`} delay={0.1} />
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed"
            >
              {city.intro}
            </motion.p>
          </div>

          {/* Therapist Cards */}
          <div className="max-w-4xl mx-auto space-y-px bg-border rounded-lg overflow-hidden mb-12">
            {therapists.map((t, i) => (
              <motion.div
                key={t.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link
                  to={`/therapist/${t.id}`}
                  className="flex flex-col md:flex-row gap-6 p-6 bg-background hover:bg-card transition-colors duration-500 group glow-hover relative"
                >
                  <div className="relative w-full md:w-40 h-40 md:h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={t.image} alt={`${t.name} — male massage therapist in ${city.name}`} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    {t.featured && (
                      <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px]">Featured</Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{t.name}</h3>
                      {t.verified && <CheckCircle2 className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{t.specialty}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-foreground text-foreground" />
                        <span className="font-semibold">{t.rating}</span>
                        <span className="text-muted-foreground">({t.reviews})</span>
                      </div>
                      <span className="font-semibold">{t.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Other Cities */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Browse Other Cities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allCities.filter(c => c.slug !== slug).map(c => (
                <Link
                  key={c.slug}
                  to={`/city/${c.slug}`}
                  className="border border-border rounded-lg p-4 hover:bg-card transition-colors group"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="font-semibold group-hover:text-foreground transition-colors">{c.name}, {c.state}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SafetyDisclaimer />
      <Footer />
    </div>
  );
};

export default City;
