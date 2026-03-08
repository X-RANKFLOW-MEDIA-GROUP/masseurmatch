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
import { getCityBySlug, isValidCitySlug, US_CITIES } from "@/data/cities";
import { buildCityUrl, buildCityListingUrl, buildProfileUrl, cityNameToSlug } from "@/lib/urls";
import NotFound from "./NotFound";

const BASE_URL = "https://masseurmatch.com";

const City = () => {
  const { city: slug } = useParams<{ city: string }>();
  const scrollRef = useScrollReveal();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const citySlug = slug || "";
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
        .order("created_at", { ascending: false })
        .limit(6);

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
  }, [citySlug, cityDisplayName, isValid]);

  // If not a known city, show 404
  if (!isValid) {
    return <NotFound />;
  }

  // Get nearby cities for "Browse Other Cities"
  // Get nearby cities — prioritize same state, then alphabetical
  const otherCities = US_CITIES
    .filter(c => c.slug !== citySlug)
    .sort((a, b) => {
      const aMatch = a.state === cityData?.state ? 0 : 1;
      const bMatch = b.state === cityData?.state ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 12);

  // City-specific FAQ
  const cityFaqs = [
    { q: `How do I find a massage therapist in ${cityDisplayName}?`, a: `Browse our directory of verified massage therapists in ${cityDisplayName}. Use filters to narrow by specialty, price range, or availability. Contact therapists directly through their profile.` },
    { q: `Are the massage therapists in ${cityDisplayName} verified?`, a: `MasseurMatch offers optional identity verification through a secure third-party process. Look for the verified badge on profiles. We are an advertising directory and do not verify licenses or credentials.` },
    { q: `How much does a massage cost in ${cityDisplayName}?`, a: `Massage prices in ${cityDisplayName} vary by therapist, session length, and type. Browse profiles to compare rates — most therapists list their incall and outcall pricing.` },
    { q: `Can I book a massage directly on MasseurMatch?`, a: `No. MasseurMatch is a directory only. You contact therapists directly through their listed contact methods and arrange sessions independently.` },
  ];

  const profileCount = profiles.length;

  const cityJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
        { "@type": "ListItem", "position": 2, "name": `${cityDisplayName}${cityState ? `, ${cityState}` : ""}`, "item": `${BASE_URL}/${citySlug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": cityFaqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title={`${profileCount > 0 ? `${profileCount} ` : ""}Male Massage Therapists in ${cityDisplayName}${cityState ? `, ${cityState}` : ""} — MasseurMatch`}
        description={`${profileCount > 0 ? `Browse ${profileCount} verified` : "Find"} gay-friendly male massage therapists in ${cityDisplayName}. Compare services, prices, and contact therapists directly.`}
        path={`/${citySlug}`}
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

            {/* CTA to full listing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <Link to={buildCityListingUrl(citySlug)}>
                <Badge className="px-6 py-2 text-sm cursor-pointer hover:bg-primary/90 transition-colors">
                  Browse All Therapists in {cityDisplayName}
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Badge>
              </Link>
            </motion.div>
          </div>

          {/* Featured Therapist Cards (preview) */}
          {loading ? (
            <div className="max-w-4xl mx-auto space-y-px bg-border rounded-lg overflow-hidden mb-12">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 p-6 bg-background animate-pulse">
                  <div className="w-full md:w-40 h-40 md:h-28 rounded-lg bg-secondary flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-secondary rounded w-1/3" />
                    <div className="h-3 bg-secondary rounded w-1/4" />
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
            <>
              <div className="max-w-4xl mx-auto space-y-px bg-border rounded-lg overflow-hidden mb-8">
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

              {/* View all CTA */}
              <div className="max-w-4xl mx-auto text-center mb-12">
                <Link to={buildCityListingUrl(citySlug)} className="text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                  View all therapists in {cityDisplayName} →
                </Link>
              </div>
            </>
          )}

          {/* City FAQ Section */}
          <div className="max-w-4xl mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {cityFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="border border-border rounded-lg p-5 bg-card"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Other Cities */}
          {otherCities.length > 0 && (
            <div className="max-w-4xl mx-auto mt-16">
              <h2 className="text-2xl font-bold mb-2">Nearby Cities</h2>
              <p className="text-sm text-muted-foreground mb-6">Find massage therapists in cities near {cityDisplayName}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {otherCities.map(c => (
                  <Link
                    key={c.slug}
                    to={buildCityUrl(c.slug)}
                    className="border border-border rounded-lg p-4 hover:bg-card transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="font-semibold group-hover:text-foreground transition-colors">
                        {c.name}{c.stateCode ? `, ${c.stateCode}` : ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link to="/cities" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                  View all 200+ cities →
                </Link>
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
