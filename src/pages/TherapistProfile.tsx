import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, CheckCircle2, Star, Phone, Mail, Globe, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";

const TherapistProfile = () => {
  const scrollRef = useScrollReveal();
  const { id } = useParams();

  const therapist = {
    name: "Marcus Rivera",
    city: "Los Angeles, CA",
    specialty: "Deep Tissue & Sports Massage",
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=1200&h=800&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&h=400&fit=crop",
    verified: true,
    plan: "Platinum",
    bio: "Licensed male massage therapist with over 10 years of experience specializing in deep tissue and sports massage for men. I'm passionate about helping athletes and active men recover and perform at their best. My gay-friendly practice combines traditional techniques with modern recovery methods in a safe, professional environment.",
    experience: "10+ years",
    license: "CA-MT-12345",
    phone: "(555) 123-4567",
    email: "marcus@example.com",
    website: "www.marcusrivera.com",
    services: [
      { name: "Deep Tissue Massage", duration: "60 min", price: "$120" },
      { name: "Sports Recovery Massage", duration: "90 min", price: "$180" },
      { name: "Men's Wellness Session", duration: "45 min", price: "$90" },
      { name: "Hot Stone Therapy", duration: "75 min", price: "$150" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop",
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

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <CursorGlow />
      <ScrollProgress />
      <Header />

      {/* Cover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-64 md:h-80 overflow-hidden"
      >
        <img
          src={therapist.coverImage}
          alt={`${therapist.name} massage studio — gay-friendly massage in ${therapist.city}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background" />
      </motion.div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="border border-border bg-card p-8 md:p-10 mb-8 rounded-lg"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                src={therapist.image}
                alt={`${therapist.name} — verified male massage therapist`}
                className="w-32 h-32 rounded-full object-cover border-2 border-border"
              />

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold">{therapist.name}</h1>
                  {therapist.verified && (
                    <Badge className="bg-foreground text-background text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {therapist.plan === "Platinum" && (
                    <Badge variant="outline" className="text-xs border-muted-foreground/30">
                      💎 Elite
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{therapist.city}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{therapist.specialty}</p>

                <div className="flex items-center gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-foreground text-foreground" />
                    <span className="font-semibold">{therapist.rating}</span>
                    <span className="text-muted-foreground">({therapist.reviews} reviews)</span>
                  </div>
                  <span className="text-border">|</span>
                  <span className="text-muted-foreground">{therapist.experience} experience</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <MagneticButton>
                    <Button className="group">
                      Book Appointment
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </MagneticButton>
                  <Button variant="outline">Contact</Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Tabs defaultValue="about" className="mb-20">
              <TabsList className="bg-card border border-border w-full justify-start overflow-x-auto rounded-lg">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="hours">Hours</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <div className="border border-border bg-card p-8 md:p-10 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">About Me</h2>
                  <p className="text-muted-foreground leading-relaxed mb-8">{therapist.bio}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Contact</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span>{therapist.phone}</span></div>
                        <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span>{therapist.email}</span></div>
                        <div className="flex items-center gap-3 text-sm"><Globe className="w-4 h-4 text-muted-foreground" /><a href={`https://${therapist.website}`} className="underline-sweep">{therapist.website}</a></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Credentials</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong className="text-foreground">License:</strong> {therapist.license}</p>
                        <p><strong className="text-foreground">Experience:</strong> {therapist.experience}</p>
                        <p><strong className="text-foreground">Verified:</strong> ✓ Background Check Complete</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <div className="border border-border bg-card p-8 md:p-10 rounded-lg">
                  <h2 className="text-2xl font-bold mb-6">Services & Pricing</h2>
                  <div className="space-y-px bg-border">
                    {therapist.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-5 bg-background">
                        <div>
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                          <p className="text-xs text-muted-foreground">{service.duration}</p>
                        </div>
                        <span className="text-lg font-bold text-foreground">{service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                <div className="border border-border bg-card p-8 md:p-10 rounded-lg">
                  <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                    {therapist.gallery.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="overflow-hidden bg-background"
                      >
                        <img
                          src={image}
                          alt={`${therapist.name} gallery — male massage therapist studio ${index + 1}`}
                          loading="lazy"
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hours" className="mt-6">
                <div className="border border-border bg-card p-8 md:p-10 rounded-lg">
                  <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
                  <div className="space-y-px bg-border">
                    {Object.entries(therapist.hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between p-4 bg-background">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">{day}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TherapistProfile;
