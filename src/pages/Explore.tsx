import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, CheckCircle2, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";

const Explore = () => {
  const scrollRef = useScrollReveal();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const therapists = [
    {
      id: 1, name: "Marcus Rivera", city: "Los Angeles",
      specialty: "Deep Tissue & Sports Massage", rating: 4.9, reviews: 127,
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop",
      verified: true, price: "$120/hr"
    },
    {
      id: 2, name: "James Chen", city: "San Francisco",
      specialty: "Swedish & Relaxation Massage", rating: 4.8, reviews: 94,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
      verified: true, price: "$100/hr"
    },
    {
      id: 3, name: "David Anderson", city: "New York",
      specialty: "Therapeutic Wellness Bodywork", rating: 5.0, reviews: 156,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop",
      verified: true, price: "$150/hr"
    },
    {
      id: 4, name: "Alex Thompson", city: "Miami",
      specialty: "Hot Stone & Aromatherapy", rating: 4.9, reviews: 112,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop",
      verified: true, price: "$110/hr"
    },
    {
      id: 5, name: "Ryan Martinez", city: "Chicago",
      specialty: "Sports Recovery Massage", rating: 4.7, reviews: 89,
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop",
      verified: true, price: "$95/hr"
    },
    {
      id: 6, name: "Kyle Johnson", city: "Seattle",
      specialty: "Men's Wellness & Bodywork", rating: 4.8, reviews: 103,
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=800&fit=crop",
      verified: false, price: "$90/hr"
    }
  ];

  const filteredTherapists = therapists.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || t.city.toLowerCase().replace(/\s/g, "-") === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-16 text-center">
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

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search male massage therapists..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-secondary border-border"
                    />
                  </div>
                </div>

                <div>
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
                </div>

                <div>
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
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
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
                  className="bg-background p-8 group transition-all duration-700 hover:bg-card block glow-hover relative"
                >
                  <div className="relative mb-6 overflow-hidden">
                    <img
                      src={therapist.image}
                      alt={`${therapist.name} — male massage therapist in ${therapist.city}, gay-friendly bodywork`}
                      loading="lazy"
                      className="w-full h-72 object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                    />
                    {therapist.verified && (
                      <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground border-border text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-1">{therapist.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    {therapist.city}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{therapist.specialty}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-foreground text-foreground" />
                      <span className="font-semibold text-sm">{therapist.rating}</span>
                      <span className="text-xs text-muted-foreground">({therapist.reviews})</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{therapist.price}</span>
                  </div>

                  <div className="mt-5 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-500 uppercase tracking-widest">
                    View Profile
                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO content block */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="reveal text-3xl font-bold mb-6">Find Gay Massage Therapists Near You</h2>
            <div className="reveal reveal-delay-1 text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>
                MasseurMatch is the leading gay massage directory for finding verified male massage therapists 
                in your city. Whether you're looking for deep tissue massage, Swedish relaxation, sports recovery, 
                hot stone therapy, or professional men's bodywork, our platform connects you with trusted, 
                gay-friendly massage professionals.
              </p>
              <p>
                Every male massage therapist on our platform is professionally verified with license checks, 
                identity verification, and client reviews. Search by city — Los Angeles, San Francisco, New York, 
                Miami, Chicago, Seattle, and 500+ more — to find the perfect male massage therapist near you.
              </p>
              <p>
                Our directory serves the LGBTQ+ community with a safe, inclusive space to discover professional 
                male bodywork services. From outcall massage to in-studio sessions, find exactly what you need 
                with transparent pricing, real reviews, and instant booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Explore;
