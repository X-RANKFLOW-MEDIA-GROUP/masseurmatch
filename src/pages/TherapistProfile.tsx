import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, CheckCircle2, Star, Phone, Mail, Globe, Clock, ArrowRight,
  MessageSquare, Bookmark, CreditCard, Banknote, Smartphone, Award,
  Languages, Droplets, ParkingCircle, ShowerHead, ChevronLeft, ChevronRight,
  Plane, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { useState, useRef } from "react";

const TherapistProfile = () => {
  const scrollRef = useScrollReveal();
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const travelRef = useRef<HTMLDivElement>(null);

  const therapist = {
    name: "Marcus Rivera",
    city: "Los Angeles, CA",
    specialty: "Deep Tissue & Sports Massage",
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=1200&h=800&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&h=400&fit=crop",
    verified: true,
    plan: "Elite",
    available: true,
    availableFor: 120,
    bio: "More than a service, an exchange of energy. With over 10 years of hands-on experience, I blend traditional techniques with modern recovery methods to create a deeply restorative experience. My practice is a safe, professional, LGBTQ+ affirming space where healing begins the moment you walk in.",
    philosophy: "I believe in treating the whole person — body, mind, and spirit. Each session is tailored to your unique needs, whether you're an athlete seeking recovery or someone in need of deep relaxation.",
    experience: "10+ years",
    languages: ["English", "Spanish", "Portuguese"],
    license: "CA-MT-12345",
    certifications: [
      { name: "Certified Massage Therapist", year: "2014" },
      { name: "Sports Massage Specialist", year: "2016" },
      { name: "Myofascial Release Certification", year: "2018" },
      { name: "AMTA Professional Member", year: "2014" },
    ],
    phone: "(555) 123-4567",
    email: "marcus@example.com",
    website: "www.marcusrivera.com",
    techniques: ["Deep Tissue", "Sports Recovery", "Swedish", "Shiatsu", "Hot Stone", "Myofascial Release", "Trigger Point"],
    amenities: ["Hot Towels", "Shower Available", "Free Parking", "Aromatherapy", "Filtered Water"],
    paymentMethods: ["Cash", "Venmo", "Zelle", "Apple Pay", "Credit Card"],
    services: [
      { name: "Deep Tissue Massage", incall30: "$70", incall60: "$120", incall90: "$170", outcall30: "$90", outcall60: "$150", outcall90: "$210" },
      { name: "Sports Recovery", incall30: "$80", incall60: "$140", incall90: "$200", outcall30: "$100", outcall60: "$170", outcall90: "$240" },
      { name: "Swedish Relaxation", incall30: "$60", incall60: "$100", incall90: "$140", outcall30: "$80", outcall60: "$130", outcall90: "$180" },
      { name: "Hot Stone Therapy", incall30: "—", incall60: "$150", incall90: "$210", outcall30: "—", outcall60: "—", outcall90: "—" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop",
    ],
    videoUrl: null as string | null,
    travelSchedule: [
      { city: "Houston, TX", dates: "Mar 15–19", status: "confirmed" },
      { city: "Miami, FL", dates: "Mar 28 – Apr 2", status: "confirmed" },
      { city: "New York, NY", dates: "Apr 10–15", status: "tentative" },
      { city: "Chicago, IL", dates: "Apr 22–26", status: "confirmed" },
      { city: "San Francisco, CA", dates: "May 5–9", status: "tentative" },
    ],
    reviewsList: [
      { name: "J. Thompson", rating: 5, date: "2 weeks ago", text: "Best deep tissue massage I've ever had. Marcus really understands the body and creates such a comfortable, professional environment. Highly recommend.", verified: true },
      { name: "A. Chen", rating: 5, date: "1 month ago", text: "Incredible experience. The studio is immaculate and Marcus is extremely skilled. I've been going monthly for 6 months now. Life-changing.", verified: true },
      { name: "R. Williams", rating: 5, date: "1 month ago", text: "Very professional and thorough. Helped my back pain significantly after just two sessions. The space is clean, quiet, and welcoming.", verified: true },
      { name: "M. Garcia", rating: 4, date: "2 months ago", text: "Great massage and very friendly. Studio is easy to find with free parking. Would definitely return.", verified: true },
    ],
    hours: {
      Monday: "9:00 AM – 7:00 PM",
      Tuesday: "9:00 AM – 7:00 PM",
      Wednesday: "9:00 AM – 7:00 PM",
      Thursday: "9:00 AM – 7:00 PM",
      Friday: "9:00 AM – 5:00 PM",
      Saturday: "10:00 AM – 4:00 PM",
      Sunday: "Closed",
    },
  };

  const avgRating = (therapist.reviewsList.reduce((a, r) => a + r.rating, 0) / therapist.reviewsList.length).toFixed(1);

  const scrollTravel = (dir: "left" | "right") => {
    if (travelRef.current) {
      travelRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <CursorGlow />
      <ScrollProgress />
      <Header />

      {/* ═══════════════════════════════════════════
          1. HERO — Dynamic Media + Status
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-72 md:h-96 overflow-hidden"
      >
        <img
          src={therapist.coverImage}
          alt={`${therapist.name} massage studio — gay-friendly massage in ${therapist.city}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
      </motion.div>

      <div className="container mx-auto px-4 -mt-28 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image with Neon Status Ring */}
              <div className="relative flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className={`w-36 h-36 rounded-full p-[3px] ${therapist.available ? "neon-ring" : ""}`}
                  style={{
                    background: therapist.available
                      ? "linear-gradient(135deg, hsl(145 80% 50%), hsl(160 70% 40%))"
                      : "hsl(0 0% 20%)",
                  }}
                >
                  <img
                    src={therapist.image}
                    alt={`${therapist.name} — verified male massage therapist`}
                    className="w-full h-full rounded-full object-cover border-2 border-background"
                  />
                </motion.div>
                {therapist.available && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap"
                    style={{ color: "hsl(145 80% 50%)" }}
                  >
                    Available · {therapist.availableFor} min
                  </motion.div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold">{therapist.name}</h1>
                  {therapist.verified && (
                    <Badge className="bg-foreground text-background text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs border-muted-foreground/30">
                    💎 {therapist.plan}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-muted-foreground/30">
                    🏳️‍🌈 LGBTQ+ Safe Space
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{therapist.city}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{therapist.specialty}</p>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-foreground text-foreground" />
                    <span className="font-semibold">{therapist.rating}</span>
                    <span className="text-muted-foreground">({therapist.reviews} reviews)</span>
                  </div>
                  <span className="text-border">|</span>
                  <span className="text-muted-foreground">{therapist.experience} experience</span>
                  <span className="text-border">|</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Languages className="w-3.5 h-3.5" />
                    <span>{therapist.languages.join(", ")}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <MagneticButton>
                    <Button className="group">
                      Book Online
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </MagneticButton>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Text Now
                  </Button>
                  <Button variant="ghost">
                    <Bookmark className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════
              2. ABOUT — Storytelling + Credentials
              ═══════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg"
          >
            <h2 className="text-2xl font-bold mb-6">About Me</h2>
            <div className="space-y-4 mb-8">
              <p className="text-muted-foreground leading-relaxed text-base italic">
                "{therapist.bio}"
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {therapist.philosophy}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Credentials */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  Credentials & Certifications
                </h3>
                <div className="space-y-3">
                  {therapist.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-sm">{cert.name}</span>
                      <span className="text-xs text-muted-foreground">{cert.year}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span>{therapist.phone}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span>{therapist.email}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Globe className="w-4 h-4 text-muted-foreground" /><a href={`https://${therapist.website}`} className="underline-sweep">{therapist.website}</a></div>
                </div>

                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mt-6 mb-3 flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {therapist.languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════
              3. SERVICES & PRICING
              ═══════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg"
          >
            <h2 className="text-2xl font-bold mb-6">Services & Pricing</h2>

            {/* Rate Table */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-semibold">Service</th>
                    <th className="text-center py-3 px-2 font-normal text-xs uppercase tracking-wider text-muted-foreground" colSpan={3}>Incall</th>
                    <th className="text-center py-3 px-2 font-normal text-xs uppercase tracking-wider text-muted-foreground" colSpan={3}>Outcall</th>
                  </tr>
                  <tr className="border-b border-border text-muted-foreground">
                    <th></th>
                    <th className="text-center py-2 px-2 text-xs font-normal">30m</th>
                    <th className="text-center py-2 px-2 text-xs font-normal">60m</th>
                    <th className="text-center py-2 px-2 text-xs font-normal">90m</th>
                    <th className="text-center py-2 px-2 text-xs font-normal">30m</th>
                    <th className="text-center py-2 px-2 text-xs font-normal">60m</th>
                    <th className="text-center py-2 px-2 text-xs font-normal">90m</th>
                  </tr>
                </thead>
                <tbody>
                  {therapist.services.map((s, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-4 pr-4 font-semibold">{s.name}</td>
                      <td className="text-center py-4 px-2 text-muted-foreground">{s.incall30}</td>
                      <td className="text-center py-4 px-2 font-semibold">{s.incall60}</td>
                      <td className="text-center py-4 px-2 text-muted-foreground">{s.incall90}</td>
                      <td className="text-center py-4 px-2 text-muted-foreground">{s.outcall30}</td>
                      <td className="text-center py-4 px-2 font-semibold">{s.outcall60}</td>
                      <td className="text-center py-4 px-2 text-muted-foreground">{s.outcall90}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Techniques */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Techniques</h3>
                <div className="flex flex-wrap gap-2">
                  {therapist.techniques.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Amenities</h3>
                <ul className="space-y-1.5">
                  {therapist.amenities.map((a) => (
                    <li key={a} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-foreground" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Payment</h3>
                <div className="flex flex-wrap gap-3">
                  {therapist.paymentMethods.map((method) => (
                    <div key={method} className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border rounded-md px-3 py-1.5">
                      {method === "Cash" && <Banknote className="w-3.5 h-3.5" />}
                      {method === "Credit Card" && <CreditCard className="w-3.5 h-3.5" />}
                      {(method === "Venmo" || method === "Zelle" || method === "Apple Pay") && <Smartphone className="w-3.5 h-3.5" />}
                      {method}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════
              4. TRAVEL CALENDAR
              ═══════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Plane className="w-5 h-5" />
                  Upcoming Travel
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Book in advance when I'm visiting your city</p>
              </div>
              <div className="hidden md:flex gap-2">
                <button onClick={() => scrollTravel("left")} className="border border-border rounded-md p-2 hover:bg-secondary transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollTravel("right")} className="border border-border rounded-md p-2 hover:bg-secondary transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div ref={travelRef} className="flex gap-4 overflow-x-auto travel-scroll pb-2">
              {therapist.travelSchedule.map((trip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0 w-56 border border-border rounded-lg p-5 hover:border-muted-foreground/40 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{trip.city}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{trip.dates}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${trip.status === "confirmed" ? "border-foreground/30" : "border-muted-foreground/20 text-muted-foreground"}`}>
                      {trip.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Book →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════
              5. GALLERY
              ═══════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg"
          >
            <h2 className="text-2xl font-bold mb-6">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {therapist.gallery.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="relative overflow-hidden rounded-md aspect-[4/3] cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`${therapist.name} studio photo ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Lightbox */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
                onClick={() => setSelectedImage(null)}
              >
                <motion.img
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  src={selectedImage}
                  alt="Gallery preview"
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════
              6. REVIEWS & SOCIAL PROOF
              ═══════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? "fill-foreground text-foreground" : "text-muted"}`} />
                  ))}
                </div>
                <span className="font-semibold">{avgRating}</span>
                <span className="text-sm text-muted-foreground">({therapist.reviewsList.length})</span>
              </div>
            </div>

            <div className="space-y-px bg-border rounded-lg overflow-hidden">
              {therapist.reviewsList.map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-background p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{review.name}</span>
                        {review.verified && (
                          <span className="text-[10px] text-muted-foreground ml-2 uppercase tracking-wider">Verified</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < review.rating ? "fill-foreground text-foreground" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════
              BUSINESS HOURS
              ═══════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border border-border bg-card p-8 md:p-10 mb-20 rounded-lg"
          >
            <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
            <div className="space-y-px bg-border rounded-lg overflow-hidden">
              {Object.entries(therapist.hours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-4 bg-background">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{day}</span>
                  </div>
                  <span className={`text-sm ${hours === "Closed" ? "text-muted-foreground" : "text-muted-foreground"}`}>{hours}</span>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          7. STICKY ACTION BAR
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border"
        style={{
          background: "hsl(0 0% 4% / 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between py-3 gap-3">
            <div className="hidden md:flex items-center gap-3">
              <img src={therapist.image} alt="" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold">{therapist.name}</p>
                <p className="text-xs text-muted-foreground">From $60 · {therapist.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Text Now
              </Button>
              <Button size="sm" className="flex-1 md:flex-none group">
                Book Online
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="pb-16" />
      <Footer />
    </div>
  );
};

export default TherapistProfile;