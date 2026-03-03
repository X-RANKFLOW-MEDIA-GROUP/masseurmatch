import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SafetyDisclaimer } from "@/components/legal/SafetyDisclaimer";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";
import { SEOHead } from "@/components/seo/SEOHead";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

// Map slugs to display info for SEO city landing pages
const cityMeta: Record<string, { name: string; state: string; intro: string }> = {
  "los-angeles": { name: "Los Angeles", state: "CA", intro: "Discover professional male massage therapists across Los Angeles — from West Hollywood to Santa Monica." },
  "san-francisco": { name: "San Francisco", state: "CA", intro: "San Francisco's Castro district and beyond offer a welcoming environment for men seeking professional massage services." },
  "new-york": { name: "New York", state: "NY", intro: "From Manhattan to Brooklyn, New York City hosts a diverse community of male massage professionals." },
  "miami": { name: "Miami", state: "FL", intro: "Miami's warm climate and vibrant culture make it a hub for wellness and bodywork." },
  "chicago": { name: "Chicago", state: "IL", intro: "Chicago's Boystown neighborhood and surrounding areas are home to many skilled male massage therapists." },
  "seattle": { name: "Seattle", state: "WA", intro: "Seattle's progressive community and focus on wellness make it an excellent city for finding professional male massage services." },
  "sao-paulo": { name: "São Paulo", state: "SP", intro: "A maior metrópole da América do Sul oferece uma vasta rede de massoterapeutas profissionais." },
  "rio-de-janeiro": { name: "Rio de Janeiro", state: "RJ", intro: "Encontre massoterapeutas verificados no Rio de Janeiro, do Leblon à Barra da Tijuca." },
};

const slugFromCityName = (city: string) =>
  city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const City = () => {
  const { slug } = useParams<{ slug: string }>();
  const scrollRef = useScrollReveal();
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [allCities, setAllCities] = useState<{ slug: string; name: string; state: string }[]>([]);

  const meta = slug ? cityMeta[slug] : null;

  // Derive city name from slug if not in meta (dynamic city)
  const cityDisplayName = meta?.name || (slug ? slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "");
  const cityState = meta?.state || "";
  const cityIntro = meta?.intro || `Browse verified massage therapists in ${cityDisplayName}.`;

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!slug) return;
      setLoading(true);

      // Match profiles by city name (case-insensitive via ilike)
      const searchCity = cityDisplayName;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true)
        .eq("is_verified_identity", true)
        .eq("is_verified_photos", true)
        .ilike("city", searchCity)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProfiles(data);

        // Fetch primary photos for each profile
        if (data.length > 0) {
          const profileIds = data.map(p => p.id);
          const { data: photos } = await supabase
            .from("profile_photos")
            .select("profile_id, storage_path")
            .in("profile_id", profileIds)
            .eq("is_primary", true)
            .eq("moderation_status", "approved");

          if (photos) {
            const map: Record<string, string> = {};
            photos.forEach(p => { map[p.profile_id] = p.storage_path; });
            setPhotoMap(map);
          }
        }
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [slug, cityDisplayName]);

  // Fetch distinct cities for "Browse Other Cities"
  useEffect(() => {
    const fetchCities = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("city, state")
        .eq("is_active", true)
        .eq("is_verified_identity", true)
        .eq("is_verified_photos", true)
        .not("city", "is", null);

      if (data) {
        const seen = new Set<string>();
        const cities: { slug: string; name: string; state: string }[] = [];
        data.forEach(p => {
          if (p.city && !seen.has(p.city.toLowerCase())) {
            seen.add(p.city.toLowerCase());
            cities.push({ slug: slugFromCityName(p.city), name: p.city, state: p.state || "" });
          }
        });
        // Also add meta cities that may not have profiles yet
        Object.entries(cityMeta).forEach(([s, m]) => {
          if (!seen.has(m.name.toLowerCase())) {
            cities.push({ slug: s, name: m.name, state: m.state });
          }
        });
        setAllCities(cities);
      }
    };
    fetchCities();
  }, []);

  if (!slug) {
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
      { "@type": "ListItem", "position": 3, "name": `${cityDisplayName}${cityState ? `, ${cityState}` : ""}`, "item": `https://masseurmatch.com/city/${slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title={`Male Massage Therapists in ${cityDisplayName}${cityState ? `, ${cityState}` : ""} — MasseurMatch`}
        description={`Find gay-friendly male massage therapists in ${cityDisplayName}. Browse verified profiles, compare services and prices.`}
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
              {cityDisplayName}{cityState ? `, ${cityState}` : ""}
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <TextReveal text={`Male Massage Therapists in ${cityDisplayName}`} delay={0.1} />
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed"
            >
              {cityIntro}
            </motion.p>
          </div>

          {/* Therapist Cards */}
          {loading ? (
            <div className="max-w-4xl mx-auto space-y-px bg-border rounded-lg overflow-hidden mb-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 p-6 bg-background animate-pulse">
                  <div className="w-full md:w-40 h-40 md:h-28 rounded-lg bg-secondary flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-secondary rounded w-1/3" />
                    <div className="h-3 bg-secondary rounded w-1/4" />
                    <div className="h-3 bg-secondary rounded w-1/6" />
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 bg-secondary rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No verified therapists found in {cityDisplayName} yet.</p>
              <Link to="/explore" className="text-primary underline-sweep">Browse all therapists</Link>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-px bg-border rounded-lg overflow-hidden mb-12">
              {profiles.map((p, i) => (
                <motion.div
                  key={p.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Link
                    to={`/therapist/${p.id}`}
                    className="flex flex-col md:flex-row gap-6 p-6 bg-background hover:bg-card transition-colors duration-500 group glow-hover relative"
                  >
                    <div className="relative w-full md:w-40 h-40 md:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                      {photoMap[p.id] ? (
                        <img
                          src={photoMap[p.id]}
                          alt={`${p.display_name || p.full_name} — massage therapist in ${cityDisplayName}`}
                          loading="lazy"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold">
                          {(p.display_name || p.full_name || "?").charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{p.display_name || p.full_name}</h3>
                        {p.is_verified_identity && <CheckCircle2 className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {(p.specialties || []).slice(0, 3).join(", ") || "Professional Massage"}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        {p.incall_price && (
                          <span className="font-semibold">${Number(p.incall_price).toFixed(0)}/hr</span>
                        )}
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
          )}

          {/* Other Cities */}
          {allCities.length > 1 && (
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
                      <span className="font-semibold group-hover:text-foreground transition-colors">
                        {c.name}{c.state ? `, ${c.state}` : ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <SafetyDisclaimer />
      <Footer />
    </div>
  );
};

export default City;
