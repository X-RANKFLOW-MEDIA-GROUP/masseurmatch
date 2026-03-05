import { useParams, Link } from "react-router-dom";
import { AdTransparency } from "@/components/legal/AdTransparency";
import { SafetyDisclaimer } from "@/components/legal/SafetyDisclaimer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, CheckCircle2, Phone, Globe, Clock, ArrowRight,
  MessageSquare, Bookmark, Award, Languages, ChevronLeft, ChevronRight,
  Plane, Home, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { SEOHead } from "@/components/seo/SEOHead";
import { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface ProfilePhoto {
  id: string;
  storage_path: string;
  is_primary: boolean | null;
  sort_order: number | null;
}

interface TravelEntry {
  id: string;
  destination_city: string;
  destination_state: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const BASE_URL = "https://masseurmatch.com";

const TherapistProfile = () => {
  const scrollRef = useScrollReveal();
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const travelRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [travel, setTravel] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) { setNotFound(true); setLoading(false); return; }
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(data);

      const [photosRes, travelRes] = await Promise.all([
        supabase
          .from("profile_photos")
          .select("id, storage_path, is_primary, sort_order")
          .eq("profile_id", id)
          .eq("moderation_status", "approved")
          .order("sort_order", { ascending: true }),
        supabase
          .from("provider_travel")
          .select("id, destination_city, destination_state, start_date, end_date, is_active")
          .eq("profile_id", id)
          .eq("is_active", true)
          .gte("end_date", new Date().toISOString().split("T")[0])
          .order("start_date", { ascending: true }),
      ]);

      if (photosRes.data) setPhotos(photosRes.data);
      if (travelRes.data) setTravel(travelRes.data);
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  const scrollTravel = (dir: "left" | "right") => {
    travelRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  // Derived data
  const displayName = profile?.display_name || profile?.full_name || "Therapist";
  const cityLabel = profile ? [profile.city, profile.state].filter(Boolean).join(", ") : "";
  const specialties = (profile?.specialties || []) as string[];
  const certifications = (profile?.certifications || []) as string[];
  const langs = (profile?.languages || []) as string[];
  const socialMedia = (profile?.social_media || {}) as Record<string, string>;
  const businessHours = (profile?.business_hours || {}) as Record<string, string>;
  const customFaq = (profile?.custom_faq || []) as { question: string; answer: string }[];
  const pricingSessions = (profile?.pricing_sessions || []) as { name: string; duration: number; incall: number; outcall: number }[];
  const primaryPhoto = photos.find(p => p.is_primary) || photos[0];
  const galleryPhotos = photos.map(p => p.storage_path);

  // ── Build rich JSON-LD ──
  const jsonLdItems = useMemo(() => {
    if (!profile) return [];
    const items: Record<string, unknown>[] = [];

    // 1. BreadcrumbList
    items.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Explore Therapists", "item": `${BASE_URL}/explore` },
        ...(profile.city ? [{ "@type": "ListItem", "position": 3, "name": profile.city, "item": `${BASE_URL}/city/${profile.city?.toLowerCase().replace(/\s+/g, "-")}` }] : []),
        { "@type": "ListItem", "position": profile.city ? 4 : 3, "name": displayName, "item": `${BASE_URL}/therapist/${id}` },
      ],
    });

    // 2. LocalBusiness (rich)
    const priceMin = Math.min(
      ...[profile.incall_price, profile.outcall_price, ...pricingSessions.map(s => Math.min(s.incall, s.outcall))].filter(Boolean).map(Number)
    );
    const priceMax = Math.max(
      ...[profile.incall_price, profile.outcall_price, ...pricingSessions.map(s => Math.max(s.incall, s.outcall))].filter(Boolean).map(Number)
    );

    const openingHoursSpec = Object.entries(businessHours).map(([day, hours]) => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": day,
      "opens": hours.split("-")[0]?.trim() || "09:00",
      "closes": hours.split("-")[1]?.trim() || "18:00",
    }));

    const localBusiness: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "HealthAndBeautyBusiness",
      "name": displayName,
      "description": profile.bio || `Professional massage therapist in ${cityLabel}. Specializing in ${specialties.slice(0, 3).join(", ")}.`,
      "url": `${BASE_URL}/therapist/${id}`,
      ...(primaryPhoto && { "image": primaryPhoto.storage_path }),
      "address": {
        "@type": "PostalAddress",
        "addressLocality": profile.city || undefined,
        "addressRegion": profile.state || undefined,
        "postalCode": profile.zip_code || undefined,
        "addressCountry": profile.country || "US",
      },
      ...(profile.phone && { "telephone": profile.phone }),
      ...(isFinite(priceMin) && isFinite(priceMax) && { "priceRange": `$${priceMin} - $${priceMax}` }),
      ...(openingHoursSpec.length > 0 && { "openingHoursSpecification": openingHoursSpec }),
      ...(langs.length > 0 && { "knowsLanguage": langs }),
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Massage Services",
        "itemListElement": pricingSessions.length > 0
          ? pricingSessions.map((s, i) => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": s.name,
                "description": `${s.duration}-minute ${s.name} session`,
              },
              "priceSpecification": [
                { "@type": "UnitPriceSpecification", "price": s.incall, "priceCurrency": "USD", "name": "Incall" },
                { "@type": "UnitPriceSpecification", "price": s.outcall, "priceCurrency": "USD", "name": "Outcall" },
              ],
            }))
          : [
              ...(profile.incall_price ? [{
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Incall Massage Session" },
                "price": Number(profile.incall_price),
                "priceCurrency": "USD",
              }] : []),
              ...(profile.outcall_price ? [{
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Outcall Massage Session" },
                "price": Number(profile.outcall_price),
                "priceCurrency": "USD",
              }] : []),
            ],
      },
    };
    items.push(localBusiness);

    // 3. FAQPage (if custom FAQ exists)
    if (customFaq.length > 0) {
      items.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": customFaq.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
        })),
      });
    }

    return items;
  }, [profile, photos, customFaq, pricingSessions, businessHours, id]);

  // ── SEO Meta Description (rich, keyword-dense) ──
  const seoDescription = useMemo(() => {
    if (!profile) return "";
    const parts: string[] = [];
    parts.push(`Book ${displayName}, a professional massage therapist in ${cityLabel || "your city"}.`);
    if (specialties.length > 0) parts.push(`Specializing in ${specialties.slice(0, 4).join(", ")}.`);
    if (certifications.length > 0) parts.push(`Certified: ${certifications.slice(0, 2).join(", ")}.`);
    if (profile.incall_price || pricingSessions.length > 0) {
      const price = pricingSessions[0]?.incall || Number(profile.incall_price);
      if (price) parts.push(`Starting at $${price}.`);
    }
    if (langs.length > 1) parts.push(`Speaks ${langs.join(", ")}.`);
    parts.push("Verified profile on MasseurMatch.");
    return parts.join(" ").slice(0, 160);
  }, [profile]);

  const seoTitle = profile
    ? `${displayName} — ${specialties[0] || "Massage"} Therapist in ${cityLabel || "Your City"} | MasseurMatch`
    : "Therapist Profile | MasseurMatch";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="relative h-72 md:h-96 bg-secondary animate-pulse" />
        <div className="container mx-auto px-4 -mt-28 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg animate-pulse">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-36 h-36 rounded-full bg-secondary flex-shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-secondary rounded w-1/3" />
                  <div className="h-4 bg-secondary rounded w-1/4" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-10 bg-secondary rounded w-28" />
                    <div className="h-10 bg-secondary rounded w-28" />
                  </div>
                </div>
              </div>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg animate-pulse">
                <div className="h-6 bg-secondary rounded w-1/4 mb-6" />
                <div className="space-y-3">
                  <div className="h-4 bg-secondary rounded w-full" />
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Profile Not Found | MasseurMatch" description="This therapist profile could not be found." path={`/therapist/${id || ""}`} noindex />
        <Header />
        <div className="flex items-center justify-center py-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground mb-6">This therapist profile doesn't exist or is no longer active.</p>
            <Link to="/explore" className="text-primary underline-sweep hover:text-foreground">Browse all therapists</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        path={`/therapist/${id}`}
        ogImage={primaryPhoto?.storage_path || undefined}
        ogType="profile"
        jsonLd={jsonLdItems}
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-4 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-5xl mx-auto flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1" itemProp="item">
              <Home className="w-3 h-3" /><span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          <li className="text-muted-foreground/50">/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/explore" className="hover:text-foreground transition-colors" itemProp="item">
              <span itemProp="name">Explore</span>
            </Link>
            <meta itemProp="position" content="2" />
          </li>
          {profile.city && (
            <>
              <li className="text-muted-foreground/50">/</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to={`/city/${profile.city.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-foreground transition-colors" itemProp="item">
                  <span itemProp="name">{profile.city}</span>
                </Link>
                <meta itemProp="position" content="3" />
              </li>
            </>
          )}
          <li className="text-muted-foreground/50">/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" aria-current="page">
            <span className="text-foreground font-medium" itemProp="name">{displayName}</span>
            <meta itemProp="position" content={profile.city ? "4" : "3"} />
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="relative h-72 md:h-96 overflow-hidden bg-secondary">
        {galleryPhotos.length > 0 && (
          <img src={galleryPhotos[0]} alt={`${displayName} massage studio in ${cityLabel}`} className="w-full h-full object-cover" loading="eager" fetchPriority="high" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
      </motion.div>

      <div className="container mx-auto px-4 -mt-28 relative z-10">
        <article className="max-w-5xl mx-auto" itemScope itemType="https://schema.org/HealthAndBeautyBusiness">
          <meta itemProp="name" content={displayName} />
          <meta itemProp="url" content={`${BASE_URL}/therapist/${id}`} />
          {primaryPhoto && <meta itemProp="image" content={primaryPhoto.storage_path} />}
          {profile.phone && <meta itemProp="telephone" content={profile.phone} />}

          {/* Profile Header */}
          <motion.header initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="relative flex-shrink-0">
                <div className="w-36 h-36 rounded-full p-[3px]" style={{ background: "linear-gradient(135deg, hsl(145 80% 50%), hsl(160 70% 40%))" }}>
                  {primaryPhoto ? (
                    <img src={primaryPhoto.storage_path} alt={`${displayName}, massage therapist in ${cityLabel}`} className="w-full h-full rounded-full object-cover border-2 border-background" width={144} height={144} />
                  ) : (
                    <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center text-3xl font-bold border-2 border-background" aria-label={displayName}>
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
                {profile.is_active && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background" title="Online now" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold" itemProp="name">{displayName}</h1>
                  {profile.is_verified_identity && (
                    <Badge className="bg-foreground text-background text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />Verified
                    </Badge>
                  )}
                </div>

                {cityLabel && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <MapPin className="w-4 h-4" />
                    <span>
                      <span itemProp="addressLocality">{profile.city}</span>
                      {profile.state && <>, <span itemProp="addressRegion">{profile.state}</span></>}
                    </span>
                  </div>
                )}

                {specialties.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-4">{specialties.slice(0, 3).join(" · ")}</p>
                )}

                {/* Quick stats row */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                  {langs.length > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Languages className="w-3.5 h-3.5" />
                      <span>{langs.join(", ")}</span>
                    </div>
                  )}
                  {certifications.length > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Award className="w-3.5 h-3.5" />
                      <span>{certifications.length} certification{certifications.length > 1 ? "s" : ""}</span>
                    </div>
                  )}
                  {(profile.incall_price || pricingSessions.length > 0) && (
                    <div className="flex items-center gap-1 text-muted-foreground" itemProp="priceRange">
                      <Star className="w-3.5 h-3.5" />
                      <span>From ${pricingSessions[0]?.incall || Number(profile.incall_price || 0)}/session</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {profile.phone && (
                    <MagneticButton>
                      <Button asChild className="group">
                        <a href={`tel:${profile.phone}`} aria-label={`Call ${displayName}`}>
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    </MagneticButton>
                  )}
                  {socialMedia.whatsapp && (
                    <MagneticButton>
                      <Button asChild variant="outline" className="group">
                        <a href={`https://wa.me/${socialMedia.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label={`Message ${displayName} on WhatsApp`}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          WhatsApp
                        </a>
                      </Button>
                    </MagneticButton>
                  )}
                  <Button variant="ghost" aria-label="Save profile"><Bookmark className="w-4 h-4 mr-1" />Save</Button>
                </div>
              </div>
            </div>
          </motion.header>

          {/* About */}
          {(profile.bio || certifications.length > 0) && (
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg" aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-2xl font-bold mb-6">About {displayName}</h2>
              {profile.bio && (
                <p className="text-muted-foreground leading-relaxed text-base italic mb-8" itemProp="description">
                  "{profile.bio}"
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {certifications.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <Award className="w-3.5 h-3.5" />Credentials & Certifications
                    </h3>
                    <ul className="space-y-3" aria-label="Certifications">
                      {certifications.map((cert, i) => (
                        <li key={i} className="flex items-center border-b border-border pb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {profile.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${profile.phone}`} className="hover:text-foreground transition-colors">{profile.phone}</a>
                      </div>
                    )}
                    {socialMedia.website && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={socialMedia.website.startsWith("http") ? socialMedia.website : `https://${socialMedia.website}`} target="_blank" rel="noopener noreferrer" className="underline-sweep">{socialMedia.website}</a>
                      </div>
                    )}
                    {socialMedia.instagram && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={`https://instagram.com/${socialMedia.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="underline-sweep">@{socialMedia.instagram.replace("@","")}</a>
                      </div>
                    )}
                  </div>
                  {langs.length > 0 && (
                    <>
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mt-6 mb-3 flex items-center gap-2">
                        <Languages className="w-3.5 h-3.5" />Languages Spoken
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {langs.map(l => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* Services & Pricing */}
          {(profile.incall_price || profile.outcall_price || pricingSessions.length > 0) && (
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg" aria-labelledby="services-heading">
              <h2 id="services-heading" className="text-2xl font-bold mb-6">Services & Pricing</h2>

              {pricingSessions.length > 0 ? (
                <div className="overflow-x-auto mb-8">
                  <table className="w-full text-sm" aria-label="Pricing table">
                    <thead>
                      <tr className="border-b border-border">
                        <th scope="col" className="text-left py-3 pr-4 font-semibold">Service</th>
                        <th scope="col" className="text-center py-3 px-2 font-normal text-xs uppercase tracking-wider text-muted-foreground">Duration</th>
                        <th scope="col" className="text-center py-3 px-2 font-normal text-xs uppercase tracking-wider text-muted-foreground">Incall</th>
                        <th scope="col" className="text-center py-3 px-2 font-normal text-xs uppercase tracking-wider text-muted-foreground">Outcall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingSessions.map((s, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors" itemProp="makesOffer" itemScope itemType="https://schema.org/Offer">
                          <td className="py-4 pr-4 font-semibold" itemProp="itemOffered" itemScope itemType="https://schema.org/Service">
                            <span itemProp="name">{s.name}</span>
                          </td>
                          <td className="text-center py-4 px-2 text-muted-foreground">{s.duration}min</td>
                          <td className="text-center py-4 px-2 font-semibold">${s.incall}</td>
                          <td className="text-center py-4 px-2 font-semibold">${s.outcall}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex gap-8 text-sm mb-6">
                  {profile.incall_price && <div><span className="text-muted-foreground">Incall:</span> <span className="font-semibold">${Number(profile.incall_price).toFixed(0)}/hr</span></div>}
                  {profile.outcall_price && <div><span className="text-muted-foreground">Outcall:</span> <span className="font-semibold">${Number(profile.outcall_price).toFixed(0)}/hr</span></div>}
                </div>
              )}

              {specialties.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Specialties & Modalities</h3>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {/* Travel */}
          {travel.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg" aria-labelledby="travel-heading">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 id="travel-heading" className="text-2xl font-bold flex items-center gap-3"><Plane className="w-5 h-5" />Upcoming Travel</h2>
                  <p className="text-sm text-muted-foreground mt-1">Contact me in advance when I'm visiting your city</p>
                </div>
                <div className="hidden md:flex gap-2">
                  <button onClick={() => scrollTravel("left")} className="border border-border rounded-md p-2 hover:bg-secondary transition-colors" aria-label="Scroll left"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => scrollTravel("right")} className="border border-border rounded-md p-2 hover:bg-secondary transition-colors" aria-label="Scroll right"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div ref={travelRef} className="flex gap-4 overflow-x-auto pb-2" role="list">
                {travel.map((trip, i) => (
                  <motion.div key={trip.id} role="listitem" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex-shrink-0 w-56 border border-border rounded-lg p-5 hover:border-muted-foreground/40 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">{trip.destination_city}{trip.destination_state ? `, ${trip.destination_state}` : ""}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={trip.start_date}>{new Date(trip.start_date).toLocaleDateString()}</time> – <time dateTime={trip.end_date}>{new Date(trip.end_date).toLocaleDateString()}</time>
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Gallery */}
          {galleryPhotos.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg" aria-labelledby="gallery-heading">
              <h2 id="gallery-heading" className="text-2xl font-bold mb-6">Photo Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {galleryPhotos.map((image, index) => (
                  <motion.div key={index} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} className="relative overflow-hidden rounded-md aspect-[4/3] cursor-pointer group" onClick={() => setSelectedImage(image)}>
                    <img src={image} alt={`${displayName} — ${specialties[index % specialties.length] || "massage"} session photo ${index + 1}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" width={400} height={300} />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Lightbox */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)} role="dialog" aria-label="Image preview">
                <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={selectedImage} alt={`${displayName} full-size photo`} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Business Hours */}
          {Object.keys(businessHours).length > 0 && (
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg" aria-labelledby="hours-heading">
              <h2 id="hours-heading" className="text-2xl font-bold mb-6">Availability & Business Hours</h2>
              <div className="space-y-px bg-border rounded-lg overflow-hidden">
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-background">
                    <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-sm">{day}</span></div>
                    <span className="text-sm text-muted-foreground">{hours}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* FAQ */}
          {customFaq.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-2xl font-bold mb-6 flex items-center gap-3"><MessageSquare className="w-5 h-5" />Frequently Asked Questions</h2>
              <div className="space-y-px bg-border rounded-lg overflow-hidden">
                {customFaq.map((faq, i) => (
                  <details key={i} className="bg-background group">
                    <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/30 transition-colors list-none">
                      <span className="font-semibold text-sm pr-4">{faq.question}</span>
                    </summary>
                    <div className="px-5 pb-5 pt-0"><p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p></div>
                  </details>
                ))}
              </div>
            </motion.section>
          )}

          <div className="mb-8"><AdTransparency /></div>
        </article>
      </div>

      <SafetyDisclaimer />

      {/* Sticky Action Bar */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 25 }} className="fixed bottom-0 left-0 right-0 z-40 border-t border-border" style={{ background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between py-3 gap-3">
            <div className="hidden md:flex items-center gap-3">
              {primaryPhoto && <img src={primaryPhoto.storage_path} alt="" className="w-9 h-9 rounded-full object-cover" />}
              <div>
                <p className="text-sm font-semibold">{displayName}</p>
                {cityLabel && <p className="text-[10px] text-muted-foreground">{cityLabel}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {profile.phone && (
                <MagneticButton>
                  <Button asChild size="sm" className="flex-1 md:flex-none group">
                    <a href={`tel:${profile.phone}`} aria-label={`Contact ${displayName}`}>
                      Contact <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </MagneticButton>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default TherapistProfile;
