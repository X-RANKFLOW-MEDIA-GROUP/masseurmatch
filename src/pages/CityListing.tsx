import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SafetyDisclaimer } from "@/components/legal/SafetyDisclaimer";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";
import { SEOHead } from "@/components/seo/SEOHead";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCityBySlug, isValidCitySlug } from "@/data/cities";
import { buildProfileUrl, buildCityUrl } from "@/lib/urls";
import NotFound from "./NotFound";

const BASE_URL = "https://masseurmatch.com";

const CityListing = () => {
  const { city } = useParams<{ city: string }>();
  const scrollRef = useScrollReveal();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const citySlug = city || "";
  const cityData = getCityBySlug(citySlug);
  const isValid = isValidCitySlug(citySlug);

  const cityDisplayName = cityData?.name || citySlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const cityState = cityData?.stateCode || "";
  const cityIntro = cityData?.intro || `Browse verified massage therapists in ${cityDisplayName}.`;

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!citySlug || !isValid) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, slug, display_name, full_name, city, specialties, incall_price, is_verified_identity, avatar_url" as any)
        .eq("is_active", true)
        .ilike("city", cityDisplayName)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProfiles(data);

        if (data.length > 0) {
          const profileIds = data.map((p: any) => p.id);
          const { data: photos } = await supabase
            .from("profile_photos")
            .select("profile_id, storage_path")
            .in("profile_id", profileIds)
            .eq("is_primary", true)
            .eq("moderation_status", "approved");

          if (photos) {
            const map: Record<string, string> = {};
            photos.forEach((p: any) => { map[p.profile_id] = p.storage_path; });
            setPhotoMap(map);
          }
        }
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [citySlug, cityDisplayName]);

  // Early return after all hooks
  if (!isValid) {
    return <NotFound />;
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": cityDisplayName, "item": `${BASE_URL}/${citySlug}` },
      { "@type": "ListItem", "position": 3, "name": "Massage Therapists", "item": `${BASE_URL}/${citySlug}/massage-therapists` },
    ],
  };

  const localBusinessListJsonLd = profiles.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Massage Therapists in ${cityDisplayName}`,
    "numberOfItems": profiles.length,
    "itemListElement": profiles.slice(0, 20).map((p: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "HealthAndBeautyBusiness",
        "name": p.display_name || p.full_name,
        "url": `${BASE_URL}/${citySlug}/therapist/${p.slug || p.id}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": cityDisplayName,
          "addressRegion": cityState,
        },
      },
    })),
  } : null;

  const listingKeywords = [
    `gay massage ${cityDisplayName}`, `male massage therapist ${cityDisplayName}`,
    `M4M massage ${cityDisplayName}`, `LGBTQ massage ${cityDisplayName}`,
    `gay-friendly bodywork ${cityDisplayName}`, `men's wellness ${cityDisplayName}`,
    "male massage therapist near me", "gay-friendly massage", "M4M massage",
    "LGBTQ massage directory", "men's wellness massage", "gay massage directory",
    "deep tissue massage", "Swedish massage", "sports recovery massage",
  ].join(", ");

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title={`Massage Therapists in ${cityDisplayName}${cityState ? `, ${cityState}` : ""} — MasseurMatch`}
        description={`Find ${profiles.length || ""} verified massage therapists in ${cityDisplayName}. Browse profiles, compare services and prices. Contact providers directly.`}
        path={`/${citySlug}/massage-therapists`}
        keywords={listingKeywords}
        jsonLd={[breadcrumbJsonLd, ...(localBusinessListJsonLd ? [localBusinessListJsonLd] : [])]}
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-24 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-4xl mx-auto flex-wrap">
          <li>
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" /> Home
            </Link>
          </li>
          <li className="text-muted-foreground/50">/</li>
          <li>
            <Link to={buildCityUrl(citySlug)} className="hover:text-foreground transition-colors">
              {cityDisplayName}
            </Link>
          </li>
          <li className="text-muted-foreground/50">/</li>
          <li className="text-foreground font-medium" aria-current="page">Massage Therapists</li>
        </ol>
      </nav>

      <section className="pb-16">
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
              <TextReveal text={`Massage Therapists in ${cityDisplayName}`} delay={0.1} />
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
              {profiles.map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Link
                    to={buildProfileUrl(citySlug, p.slug || p.id)}
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
        </div>
      </section>

      <SafetyDisclaimer />
      <Footer />
    </div>
  );
};

export default CityListing;
