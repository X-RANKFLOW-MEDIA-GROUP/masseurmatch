import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationPicker } from "@/components/explore/LocationPicker";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search, MapPin, CheckCircle2, Star, ArrowRight, Heart, X,
  LayoutGrid, List, Map as MapIcon, SlidersHorizontal, ChevronDown, Loader2,
  Sparkles, Plane, Zap, Tag, UserPlus
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { TiltCard } from "@/components/animations/TiltCard";
import { ImageReveal } from "@/components/animations/ImageReveal";
import { fadeUp } from "@/components/animations/variants";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { IntentMatchWizard } from "@/components/explore/IntentMatchWizard";

type ViewMode = "cards" | "list" | "map";

interface TherapistItem {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
  verified: boolean;
  price: string;
  priceNum: number;
  available: boolean;
  bio: string;
  isTraveling?: boolean;
  travelBadge?: "visiting_now" | "visiting_soon" | null;
  incallPrice?: number;
  outcallPrice?: number;
  specialties?: string[];
  availableNow?: boolean;
  availableNowExpires?: string | null;
  availableNowTier?: string;
  hasSpecialOffer?: boolean;
  specialOfferText?: string;
  isNewUser?: boolean;
  createdAt?: string;
}

// Simple city → lat/lng fallback for map view
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  "new york": { lat: 40.7128, lng: -74.006 },
  miami: { lat: 25.7617, lng: -80.1918 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  seattle: { lat: 47.6062, lng: -122.3321 },
};

function mapProfileToTherapist(p: any): TherapistItem {
  const cityLower = (p.city || "").toLowerCase();
  const coords = CITY_COORDS[cityLower] || { lat: 39.8283, lng: -98.5795 };
  const primaryPhoto = p.profile_photos?.[0]?.storage_path;
  const avatarUrl = primaryPhoto
    ? supabase.storage.from("profile-photos").getPublicUrl(primaryPhoto).data.publicUrl
    : p.avatar_url || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop";

  const incall = p.incall_price ?? 0;
  const outcall = p.outcall_price ?? 0;
  const displayPrice = incall || outcall;

  // Determine Available Now status
  const now = new Date();
  const isAvailableNow = p.available_now === true &&
    p.available_now_expires &&
    new Date(p.available_now_expires) > now;

  return {
    id: p.id,
    name: p.display_name || p.full_name || "Therapist",
    city: p.city || "Unknown",
    lat: coords.lat,
    lng: coords.lng,
    specialty: (p.specialties || []).slice(0, 2).join(" & ") || "Massage Therapy",
    rating: 5.0,
    reviews: 0,
    image: avatarUrl,
    verified: p.is_verified_profile || false,
    price: displayPrice ? `$${displayPrice}/hr` : "Contact",
    priceNum: displayPrice,
    available: p.is_active || false,
    bio: p.bio?.slice(0, 120) || "",
    isTraveling: false,
    incallPrice: p.incall_price ?? 0,
    outcallPrice: p.outcall_price ?? 0,
    specialties: p.specialties || [],
    availableNow: isAvailableNow,
    availableNowExpires: isAvailableNow ? p.available_now_expires : null,
    availableNowTier: p._tier || "free",
  };
}

/* ═══════════════════════════════════════════
   SWIPE CARD COMPONENT (Tinder-style)
   ═══════════════════════════════════════════ */
const SwipeCard = ({
  therapist,
  onSwipe,
  isFront,
}: {
  therapist: TherapistItem;
  onSwipe: (dir: "left" | "right") => void;
  isFront: boolean;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 120) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: isFront ? 10 : 1 }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isFront ? 1 : 0.95, opacity: isFront ? 1 : 0.6 }}
      animate={{ scale: isFront ? 1 : 0.95, opacity: isFront ? 1 : 0.6 }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        rotate: x.get() > 0 ? 20 : -20,
        transition: { duration: 0.3 },
      }}
    >
      <div className="h-full rounded-2xl border border-border overflow-hidden relative bg-card">
        <img
          src={therapist.image}
          alt={therapist.name}
          className="w-full h-[65%] object-cover"
          width={800}
          height={520}
        />

        <motion.div
          className="absolute top-8 right-8 border-4 rounded-lg px-4 py-2 font-bold text-2xl uppercase tracking-wider rotate-[-20deg]"
          style={{
            opacity: likeOpacity,
            borderColor: "hsl(145 80% 50%)",
            color: "hsl(145 80% 50%)",
          }}
        >
          Like
        </motion.div>
        <motion.div
          className="absolute top-8 left-8 border-4 rounded-lg px-4 py-2 font-bold text-2xl uppercase tracking-wider rotate-[20deg]"
          style={{
            opacity: nopeOpacity,
            borderColor: "hsl(0 80% 55%)",
            color: "hsl(0 80% 55%)",
          }}
        >
          Nope
        </motion.div>

        <div className="absolute top-4 left-4 flex gap-1.5">
          {therapist.verified && (
            <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-border text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {therapist.isTraveling && (
            <Badge className="bg-background/80 backdrop-blur-sm text-primary border-primary/30 text-xs">
              <Plane className="w-3 h-3 mr-1" />
              Visiting
            </Badge>
          )}
          {therapist.availableNow && (
            <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-primary text-xs animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              Available Now
            </Badge>
          )}
        </div>

        {therapist.available && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
            <div className="w-2 h-2 rounded-full neon-ring" style={{ background: "hsl(145 80% 50%)" }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Online</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{therapist.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            {therapist.city}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{therapist.bio}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{therapist.price}</span>
            <Link to={`/therapist/${therapist.id}`}>
              <span className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                View Profile →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Explore = () => {
  const scrollRef = useScrollReveal();
  const { t } = useTranslation();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://masseurmatch.com/" },
      { "@type": "ListItem", "position": 2, "name": "Explore Therapists", "item": "https://masseurmatch.com/explore" },
    ],
  };

  const [therapists, setTherapists] = useState<TherapistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [cardIndex, setCardIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);

  const [priceRange, setPriceRange] = useState([0, 500]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [availableNowOnly, setAvailableNowOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSmartMatch, setShowSmartMatch] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);

      // Fetch profiles and active travel in parallel
      const today = new Date().toISOString().split("T")[0];

      const [profilesRes, travelRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, full_name, bio, city, state, country, specialties, incall_price, outcall_price, avatar_url, is_active, is_verified_profile, is_verified_identity, is_verified_photos, available_now, available_now_expires, profile_photos(storage_path, is_primary, moderation_status)")
          .eq("status", "active")
          .eq("is_active", true)
          .not("city", "is", null)
          .order("created_at", { ascending: false }),
        supabase
          .from("provider_travel")
          .select("profile_id, destination_city, destination_state, start_date, end_date")
          .eq("is_active", true)
          .lte("start_date", today)
          .gte("end_date", today),
      ]);

      if (profilesRes.error) {
        setLoading(false);
        return;
      }

      const activeTravels = travelRes.data || [];
      const travelingProfileIds = new Set(activeTravels.map((t: any) => t.profile_id));

      const mapped = (profilesRes.data || []).map((p: any) => {
        const travel = activeTravels.find((t: any) => t.profile_id === p.id);
        const item = mapProfileToTherapist(p);

        if (travel) {
          // Override city to destination during travel
          item.city = travel.destination_city;
          item.isTraveling = true;
          const cityLower = travel.destination_city.toLowerCase();
          const coords = CITY_COORDS[cityLower] || { lat: 39.8283, lng: -98.5795 };
          item.lat = coords.lat;
          item.lng = coords.lng;
        }

        return item;
      });

      setTherapists(mapped);
      const uniqueCities = [...new Set(mapped.map((t) => t.city).filter(Boolean))].sort();
      setCities(uniqueCities);
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  const TIER_RANK: Record<string, number> = { elite: 1, pro: 2, standard: 3, free: 4 };

  const filteredTherapists = therapists
    .filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === "all" || t.city.toLowerCase().replace(/\s/g, "-") === selectedCity;
      const matchesPrice = t.priceNum === 0 || (t.priceNum >= priceRange[0] && t.priceNum <= priceRange[1]);
      const matchesAvailable = !availableOnly || t.available;
      const matchesAvailableNow = !availableNowOnly || t.availableNow;
      return matchesSearch && matchesCity && matchesPrice && matchesAvailable && matchesAvailableNow;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.priceNum - b.priceNum;
      if (sortBy === "price-desc") return b.priceNum - a.priceNum;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviews - a.reviews;

      // Default sort: Available Now first (by tier), then regular profiles by tier
      const aIsAN = a.availableNow ? 1 : 0;
      const bIsAN = b.availableNow ? 1 : 0;
      if (aIsAN !== bIsAN) return bIsAN - aIsAN; // Available Now first

      if (a.availableNow && b.availableNow) {
        // Both Available Now: sort by tier priority, then time remaining
        const tierDiff = (TIER_RANK[a.availableNowTier || "free"] || 4) - (TIER_RANK[b.availableNowTier || "free"] || 4);
        if (tierDiff !== 0) return tierDiff;
        // More time remaining = lower urgency, show those with less time first (urgency)
        const aExp = a.availableNowExpires ? new Date(a.availableNowExpires).getTime() : 0;
        const bExp = b.availableNowExpires ? new Date(b.availableNowExpires).getTime() : 0;
        return aExp - bExp;
      }

      // Regular profiles: sort by tier
      return (TIER_RANK[a.availableNowTier || "free"] || 4) - (TIER_RANK[b.availableNowTier || "free"] || 4);
    });

  const handleSwipe = useCallback(
    (dir: "left" | "right") => {
      if (dir === "right") {
        setLiked((prev) => [...prev, filteredTherapists[cardIndex]?.id]);
      }
      setCardIndex((prev) => prev + 1);
    },
    [cardIndex, filteredTherapists],
  );

  const resetCards = () => setCardIndex(0);

  const viewModes: { key: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { key: "cards", icon: LayoutGrid, label: "AI Cards" },
    { key: "list", icon: List, label: "List" },
    { key: "map", icon: MapIcon, label: "Map" },
  ];

  const mapCenter = {
    lat: filteredTherapists.reduce((a, t) => a + t.lat, 0) / (filteredTherapists.length || 1),
    lng: filteredTherapists.reduce((a, t) => a + t.lng, 0) / (filteredTherapists.length || 1),
  };

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title="Explore Male Massage Therapists — Gay Massage Directory | MasseurMatch"
        description="Browse verified male massage therapists near you. Filter by city, massage type, price. Deep tissue, Swedish, sports recovery. Gay-friendly professionals."
        path="/explore"
        jsonLd={breadcrumbJsonLd}
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4"
            >
              Gay Massage Directory
            </motion.p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
              <TextReveal text="Explore Male Massage Therapists" delay={0.1} />
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-muted-foreground text-lg max-w-xl mx-auto"
            >
              Find verified, gay-friendly male massage therapists near you.
              Deep tissue, Swedish, sports recovery &amp; more.
            </motion.p>

            {/* Smart Match CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6"
            >
              <Button
                size="lg"
                onClick={() => setShowSmartMatch(true)}
                className="gap-2 text-base px-8"
              >
                <Sparkles className="w-4 h-4" />
                Smart Match — Find My Therapist
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                4 quick taps to find your best match
              </p>
            </motion.div>
          </div>

          {/* Search + Filters + View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-5xl mx-auto mb-10"
          >
            <div className="glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search therapists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
                <LocationPicker
                  availableCities={cities}
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                />
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Massage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deep-tissue">Deep Tissue</SelectItem>
                    <SelectItem value="swedish">Swedish</SelectItem>
                    <SelectItem value="sports">Sports Recovery</SelectItem>
                    <SelectItem value="hot-stone">Hot Stone</SelectItem>
                    <SelectItem value="therapeutic">Therapeutic</SelectItem>
                    <SelectItem value="bodywork">Men's Bodywork</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-border rounded-md overflow-hidden">
                  {viewModes.map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => { setViewMode(key); if (key === "cards") resetCards(); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                        viewMode === key
                          ? "bg-foreground text-background"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 mt-4 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Advanced Filters
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                {(availableOnly || availableNowOnly || priceRange[0] > 0 || priceRange[1] < 500 || sortBy !== "default") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>

              {/* Advanced Filters Panel */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-5 mt-4 border-t border-border">
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                          Price Range
                        </Label>
                        <Slider
                          min={0}
                          max={500}
                          step={10}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                          Availability
                        </Label>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={availableOnly}
                              onCheckedChange={setAvailableOnly}
                            />
                            <span className="text-sm">
                              {availableOnly ? "Online Only" : "All Therapists"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={availableNowOnly}
                              onCheckedChange={setAvailableNowOnly}
                            />
                            <span className="text-sm flex items-center gap-1.5">
                              Available Now
                              {availableNowOnly && (
                                <Zap className="w-3 h-3 text-primary" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                          Sort By
                        </Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Default" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="rating">Highest Rating</SelectItem>
                            <SelectItem value="reviews">Most Reviews</SelectItem>
                            <SelectItem value="price-asc">Price: Low → High</SelectItem>
                            <SelectItem value="price-desc">Price: High → Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                          &nbsp;
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setPriceRange([0, 500]);
                            setAvailableOnly(false);
                            setAvailableNowOnly(false);
                            setSortBy("default");
                            setSelectedCity("all");
                            setSelectedType("all");
                            setSearchQuery("");
                          }}
                        >
                          Reset All Filters
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center">
                          {filteredTherapists.length} result{filteredTherapists.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card overflow-hidden animate-pulse">
                    <div className="h-48 bg-secondary" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-secondary rounded w-2/3" />
                      <div className="h-3 bg-secondary rounded w-1/3" />
                      <div className="h-3 bg-secondary rounded w-full" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-4 bg-secondary rounded w-16" />
                        <div className="h-3 bg-secondary rounded w-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && therapists.length === 0 && (
            <div className="max-w-md mx-auto text-center py-20">
              <p className="text-muted-foreground mb-2">No therapists listed yet.</p>
              <p className="text-sm text-muted-foreground">Be the first to create a profile on MasseurMatch.</p>
              <Link to="/auth">
                <Button className="mt-6" variant="outline">Create Your Listing</Button>
              </Link>
            </div>
          )}

          {/* No Results After Filtering */}
          {!loading && therapists.length > 0 && filteredTherapists.length === 0 && (
            <div className="max-w-md mx-auto text-center py-20">
              <p className="text-muted-foreground mb-2">No therapists match your filters.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPriceRange([0, 500]);
                  setAvailableOnly(false);
                  setAvailableNowOnly(false);
                  setSortBy("default");
                  setSelectedCity("all");
                  setSelectedType("all");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              VIEW: AI CARDS (Tinder Swipe)
              ═══════════════════════════════════════════ */}
          {!loading && filteredTherapists.length > 0 && viewMode === "cards" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="relative h-[580px]">
                <AnimatePresence>
                  {filteredTherapists.slice(cardIndex, cardIndex + 2).map((t, i) => (
                    <SwipeCard
                      key={t.id}
                      therapist={t}
                      onSwipe={handleSwipe}
                      isFront={i === 0}
                    />
                  ))}
                </AnimatePresence>

                {cardIndex >= filteredTherapists.length && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground mb-4">No more profiles to show</p>
                    <Button variant="outline" onClick={resetCards}>Start Over</Button>
                    {liked.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-4">
                        You liked {liked.length} therapist{liked.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {cardIndex < filteredTherapists.length && (
                <div className="flex items-center justify-center gap-6 mt-6">
                  <button
                    onClick={() => handleSwipe("left")}
                    className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <Link to={`/therapist/${filteredTherapists[cardIndex]?.id}`}>
                    <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-foreground transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleSwipe("right")}
                    className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center hover:neon-ring transition-all"
                    style={{ color: "hsl(145 80% 50%)" }}
                  >
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════
              VIEW: LIST WITH PHOTOS
              ═══════════════════════════════════════════ */}
          {!loading && filteredTherapists.length > 0 && viewMode === "list" && (
            <div className="max-w-5xl mx-auto space-y-4">
              {filteredTherapists.map((therapist, i) => (
                <motion.div
                  key={therapist.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                >
                  <TiltCard className="glass-card overflow-hidden" maxTilt={8}>
                    <Link
                      to={`/therapist/${therapist.id}`}
                      className="flex flex-col md:flex-row gap-6 p-6 group"
                    >
                      <ImageReveal
                        direction={i % 2 === 0 ? "left" : "right"}
                        duration={0.9}
                        delay={i * 0.05}
                        className="relative w-full md:w-48 h-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={therapist.image}
                          alt={`${therapist.name} — male massage therapist in ${therapist.city}`}
                          loading="lazy"
                          width={192}
                          height={128}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                        {therapist.available && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 z-20">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(145 80% 50%)" }} />
                            <span className="text-[9px] font-semibold uppercase">Online</span>
                          </div>
                        )}
                        {therapist.verified && (
                          <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground border-border text-[10px] px-1.5 py-0.5 z-20">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                            Verified
                          </Badge>
                        )}
                      </ImageReveal>

                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{therapist.name}</h3>
                          {therapist.isTraveling && (
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary gap-1">
                              <Plane className="w-3 h-3" />
                              Visiting
                            </Badge>
                          )}
                          {therapist.availableNow && (
                            <Badge className="text-[10px] bg-primary/90 text-primary-foreground border-primary gap-1 animate-pulse">
                              <Zap className="w-3 h-3" />
                              Available Now
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3" />
                          {therapist.city}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{therapist.specialty}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{therapist.bio}</p>
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 flex-shrink-0">
                        <span className="text-lg font-bold">{therapist.price}</span>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-1">
                          View
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════
              VIEW: MAP
              ═══════════════════════════════════════════ */}
          {!loading && filteredTherapists.length > 0 && viewMode === "map" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-lg overflow-hidden border border-border relative">
                  <iframe
                    title="Therapists map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 30}%2C${mapCenter.lat - 15}%2C${mapCenter.lng + 30}%2C${mapCenter.lat + 15}&layer=mapnik`}
                    className="w-full h-[500px] border-0 grayscale contrast-125 invert"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-background/10" />

                  <div className="absolute inset-0 pointer-events-none">
                    {filteredTherapists.map((t) => {
                      const xPct = ((t.lng - (mapCenter.lng - 30)) / 60) * 100;
                      const yPct = ((mapCenter.lat + 15 - t.lat) / 30) * 100;
                      return (
                        <div
                          key={t.id}
                          className="absolute pointer-events-auto"
                          style={{ left: `${xPct}%`, top: `${yPct}%`, transform: "translate(-50%, -100%)" }}
                        >
                          <Link to={`/therapist/${t.id}`}>
                            <div className="relative group cursor-pointer">
                              <div className="w-8 h-8 rounded-full border-2 border-foreground overflow-hidden bg-card shadow-lg hover:scale-110 transition-transform">
                                <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                <div className="bg-card border border-border rounded-md px-3 py-1.5 text-xs shadow-lg">
                                  <p className="font-semibold">{t.name}</p>
                                  <p className="text-muted-foreground">{t.price}</p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredTherapists.map((t) => (
                    <TiltCard key={t.id} className="glass-card overflow-hidden" maxTilt={6}>
                      <Link
                        to={`/therapist/${t.id}`}
                        className="flex gap-3 p-3 group"
                      >
                        <img src={t.image} alt={t.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {t.city}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-semibold">{t.price}</span>
                          </div>
                        </div>
                      </Link>
                    </TiltCard>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* SEO content block */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="reveal text-3xl font-bold mb-6">{t("explore.title")}</h2>
            <div className="reveal reveal-delay-1 text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>
                MasseurMatch is an advertising directory for finding male massage therapists
                in your city. Whether you're looking for deep tissue massage, Swedish relaxation, sports recovery,
                hot stone therapy, or professional men's bodywork, our platform connects you with
                gay-friendly massage professionals who advertise their services here.
              </p>
              <p>
                Search by city — Los Angeles, San Francisco, New York,
                Miami, Chicago, Seattle, and 500+ more — to find male massage therapists near you.
                All arrangements are made directly between you and the provider.
              </p>
            </div>

            {/* Mini FAQ for Explore */}
            <div className="mt-12 space-y-6">
              <h3 className="text-xl font-bold text-foreground">Common Questions</h3>
              {[
                { q: "How do I choose a massage therapist?", a: "Browse profiles, read reviews, compare specialties and pricing. Contact providers directly through their listing to discuss your needs before booking." },
                { q: "What massage types are available?", a: "Our directory includes deep tissue, Swedish, sports recovery, hot stone, aromatherapy, Thai, shiatsu, reflexology, and therapeutic wellness bodywork." },
                { q: "Is MasseurMatch free to browse?", a: "Yes. Browsing the directory is completely free. No account is needed to view listings or contact providers." },
                { q: "Are the therapists verified?", a: "MasseurMatch does not verify licenses or credentials. 'Verified' badges indicate paid advertising placement. Always do your own research." },
              ].map((faq, i) => (
                <div key={i} className="border-b border-border pb-4">
                  <h4 className="font-semibold text-foreground text-sm mb-1">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>

            <p className="text-xs italic text-muted-foreground mt-6">
              MasseurMatch is an advertising directory only. We do not verify providers, guarantee services,
              or process bookings or payments. Users must be 18+.
            </p>

            {/* City links for internal linking */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Browse by City</h3>
              <div className="flex flex-wrap gap-2">
                {["los-angeles", "new-york", "san-francisco", "miami", "chicago", "seattle"].map(slug => (
                  <Link key={slug} to={`/city/${slug}`} className="text-xs text-muted-foreground border border-border rounded-md px-3 py-1.5 hover:bg-card transition-colors capitalize">
                    {slug.replace(/-/g, " ")}
                  </Link>
                ))}
              </div>
            </div>

            {/* Massage type links */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Popular Massage Types</h3>
              <div className="flex flex-wrap gap-2">
                {["Deep Tissue", "Swedish", "Sports Recovery", "Hot Stone", "Therapeutic", "Thai Massage", "Shiatsu", "Aromatherapy"].map(type => (
                  <span key={type} className="text-xs text-muted-foreground border border-border rounded-md px-3 py-1.5">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Intent Match Wizard */}
      <IntentMatchWizard
        therapists={therapists}
        isOpen={showSmartMatch}
        onClose={() => setShowSmartMatch(false)}
        availableCities={cities}
      />
    </div>
  );
};

export default Explore;
