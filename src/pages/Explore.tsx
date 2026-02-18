import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search, MapPin, CheckCircle2, Star, ArrowRight, Heart, X,
  LayoutGrid, List, Map as MapIcon, SlidersHorizontal, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";

type ViewMode = "cards" | "list" | "map";

const therapists = [
  {
    id: 1, name: "Marcus Rivera", city: "Los Angeles", lat: 34.0522, lng: -118.2437,
    specialty: "Deep Tissue & Sports Massage", rating: 4.9, reviews: 127,
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop",
    verified: true, price: "$120/hr", priceNum: 120, available: true,
    bio: "10+ years specializing in deep tissue and sports recovery for active men.",
  },
  {
    id: 2, name: "James Chen", city: "San Francisco", lat: 37.7749, lng: -122.4194,
    specialty: "Swedish & Relaxation Massage", rating: 4.8, reviews: 94,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
    verified: true, price: "$100/hr", priceNum: 100, available: true,
    bio: "Creating calm through expert Swedish technique in a safe, welcoming space.",
  },
  {
    id: 3, name: "David Anderson", city: "New York", lat: 40.7128, lng: -74.0060,
    specialty: "Therapeutic Wellness Bodywork", rating: 5.0, reviews: 156,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop",
    verified: true, price: "$150/hr", priceNum: 150, available: false,
    bio: "Holistic bodywork focused on total mind-body restoration.",
  },
  {
    id: 4, name: "Alex Thompson", city: "Miami", lat: 25.7617, lng: -80.1918,
    specialty: "Hot Stone & Aromatherapy", rating: 4.9, reviews: 112,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop",
    verified: true, price: "$110/hr", priceNum: 110, available: true,
    bio: "Blending hot stone therapy with aromatherapy for deep relaxation.",
  },
  {
    id: 5, name: "Ryan Martinez", city: "Chicago", lat: 41.8781, lng: -87.6298,
    specialty: "Sports Recovery Massage", rating: 4.7, reviews: 89,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop",
    verified: true, price: "$95/hr", priceNum: 95, available: true,
    bio: "Helping athletes push limits and recover faster.",
  },
  {
    id: 6, name: "Kyle Johnson", city: "Seattle", lat: 47.6062, lng: -122.3321,
    specialty: "Men's Wellness & Bodywork", rating: 4.8, reviews: 103,
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=800&fit=crop",
    verified: false, price: "$90/hr", priceNum: 90, available: true,
    bio: "Personalized wellness bodywork in a private studio.",
  },
];

/* ═══════════════════════════════════════════
   SWIPE CARD COMPONENT (Tinder-style)
   ═══════════════════════════════════════════ */
const SwipeCard = ({
  therapist,
  onSwipe,
  isFront,
}: {
  therapist: (typeof therapists)[0];
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
        {/* Image */}
        <img
          src={therapist.image}
          alt={therapist.name}
          className="w-full h-[65%] object-cover"
        />

        {/* Like / Nope overlays */}
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

        {/* Verified badge */}
        {therapist.verified && (
          <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-foreground border-border text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}

        {/* Available indicator */}
        {therapist.available && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
            <div className="w-2 h-2 rounded-full neon-ring" style={{ background: "hsl(145 80% 50%)" }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Online</span>
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{therapist.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-foreground text-foreground" />
              <span className="font-semibold text-sm">{therapist.rating}</span>
            </div>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [cardIndex, setCardIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);

  const [priceRange, setPriceRange] = useState([50, 200]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredTherapists = therapists
    .filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === "all" || t.city.toLowerCase().replace(/\s/g, "-") === selectedCity;
      const matchesPrice = t.priceNum >= priceRange[0] && t.priceNum <= priceRange[1];
      const matchesAvailable = !availableOnly || t.available;
      return matchesSearch && matchesCity && matchesPrice && matchesAvailable;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.priceNum - b.priceNum;
      if (sortBy === "price-desc") return b.priceNum - a.priceNum;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      return 0;
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

  // Map center calculation
  const mapCenter = {
    lat: filteredTherapists.reduce((a, t) => a + t.lat, 0) / (filteredTherapists.length || 1),
    lng: filteredTherapists.reduce((a, t) => a + t.lng, 0) / (filteredTherapists.length || 1),
  };

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
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
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="los-angeles">Los Angeles</SelectItem>
                    <SelectItem value="san-francisco">San Francisco</SelectItem>
                    <SelectItem value="new-york">New York</SelectItem>
                    <SelectItem value="miami">Miami</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="seattle">Seattle</SelectItem>
                  </SelectContent>
                </Select>
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

                {/* View mode toggle */}
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
                {(availableOnly || priceRange[0] > 50 || priceRange[1] < 200 || sortBy !== "default") && (
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
                      {/* Price Range */}
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                          Price Range
                        </Label>
                        <Slider
                          min={50}
                          max={200}
                          step={5}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>

                      {/* Available Now */}
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                          Availability
                        </Label>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={availableOnly}
                            onCheckedChange={setAvailableOnly}
                          />
                          <span className="text-sm">
                            {availableOnly ? "Available Now" : "All Therapists"}
                          </span>
                          {availableOnly && (
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(145 80% 50%)" }} />
                          )}
                        </div>
                      </div>

                      {/* Sort By */}
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

                      {/* Reset */}
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                          &nbsp;
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setPriceRange([50, 200]);
                            setAvailableOnly(false);
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

          {/* ═══════════════════════════════════════════
              VIEW: AI CARDS (Tinder Swipe)
              ═══════════════════════════════════════════ */}
          {viewMode === "cards" && (
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

              {/* Action buttons */}
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
          {viewMode === "list" && (
            <div className="max-w-5xl mx-auto space-y-px bg-border rounded-lg overflow-hidden">
              {filteredTherapists.map((therapist, i) => (
                <motion.div
                  key={therapist.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                >
                  <Link
                    to={`/therapist/${therapist.id}`}
                    className="flex flex-col md:flex-row gap-6 p-6 bg-background hover:bg-card transition-colors duration-500 group glow-hover relative"
                  >
                    <div className="relative w-full md:w-48 h-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={therapist.image}
                        alt={`${therapist.name} — male massage therapist in ${therapist.city}`}
                        loading="lazy"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                      {therapist.available && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(145 80% 50%)" }} />
                          <span className="text-[9px] font-semibold uppercase">Online</span>
                        </div>
                      )}
                      {therapist.verified && (
                        <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground border-border text-[10px] px-1.5 py-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-lg font-semibold mb-1">{therapist.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3" />
                        {therapist.city}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{therapist.specialty}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{therapist.bio}</p>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-foreground text-foreground" />
                        <span className="font-semibold text-sm">{therapist.rating}</span>
                        <span className="text-xs text-muted-foreground">({therapist.reviews})</span>
                      </div>
                      <span className="text-lg font-bold">{therapist.price}</span>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-1">
                        View
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════
              VIEW: MAP
              ═══════════════════════════════════════════ */}
          {viewMode === "map" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 rounded-lg overflow-hidden border border-border relative">
                  <iframe
                    title="Therapists map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 30}%2C${mapCenter.lat - 15}%2C${mapCenter.lng + 30}%2C${mapCenter.lat + 15}&layer=mapnik`}
                    className="w-full h-[500px] border-0 grayscale contrast-125 invert"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-background/10" />

                  {/* Pin overlay (simulated) */}
                  <div className="absolute inset-0 pointer-events-none">
                    {filteredTherapists.map((t) => {
                      // Simple projection to percentage (approximate)
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
                              {/* Tooltip */}
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

                {/* Side list */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredTherapists.map((t) => (
                    <Link
                      key={t.id}
                      to={`/therapist/${t.id}`}
                      className="flex gap-3 p-3 border border-border rounded-lg hover:bg-card transition-colors group"
                    >
                      <img src={t.image} alt={t.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {t.city}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-foreground text-foreground" />
                            <span className="text-xs font-semibold">{t.rating}</span>
                          </div>
                          <span className="text-xs font-semibold">{t.price}</span>
                        </div>
                      </div>
                    </Link>
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
            <h2 className="reveal text-3xl font-bold mb-6">Find Male Massage Therapists Near You</h2>
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
              <p className="text-xs italic">
                MasseurMatch is an advertising directory only. We do not verify providers, guarantee services,
                or process bookings or payments. Users must be 18+.
              </p>
            </div>

            {/* City links */}
            <div className="mt-8 flex flex-wrap gap-2">
              {["los-angeles", "new-york", "san-francisco", "miami", "chicago", "seattle"].map(slug => (
                <Link key={slug} to={`/city/${slug}`} className="text-xs text-muted-foreground border border-border rounded-md px-3 py-1.5 hover:bg-card transition-colors capitalize">
                  {slug.replace("-", " ")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Explore;