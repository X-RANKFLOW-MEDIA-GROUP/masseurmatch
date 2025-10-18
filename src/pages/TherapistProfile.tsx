import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, CheckCircle2, Star, Phone, Mail, Globe, Clock } from "lucide-react";

const TherapistProfile = () => {
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
    bio: "Licensed massage therapist with over 10 years of experience specializing in deep tissue and sports massage. I'm passionate about helping athletes recover and perform at their best. My approach combines traditional techniques with modern recovery methods.",
    experience: "10+ years",
    license: "CA-MT-12345",
    phone: "(555) 123-4567",
    email: "marcus@example.com",
    website: "www.marcusrivera.com",
    services: [
      { name: "Deep Tissue Massage", duration: "60 min", price: "$120" },
      { name: "Sports Massage", duration: "90 min", price: "$180" },
      { name: "Recovery Session", duration: "45 min", price: "$90" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop"
    ],
    hours: {
      monday: "9:00 AM - 7:00 PM",
      tuesday: "9:00 AM - 7:00 PM",
      wednesday: "9:00 AM - 7:00 PM",
      thursday: "9:00 AM - 7:00 PM",
      friday: "9:00 AM - 5:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed"
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Cover Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={therapist.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-background"></div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="glass-card p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={therapist.image}
                alt={therapist.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
              />
              
              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black">{therapist.name}</h1>
                  {therapist.verified && (
                    <Badge className="bg-primary/90">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {therapist.plan === "Platinum" && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                      💎 Elite
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{therapist.city}</span>
                </div>

                <p className="text-lg text-primary font-semibold mb-4">{therapist.specialty}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold">{therapist.rating}</span>
                    <span className="text-muted-foreground">({therapist.reviews} reviews)</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{therapist.experience} experience</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="hero">Book Appointment</Button>
                  <Button variant="outline">Contact</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="about" className="mb-12">
            <TabsList className="glass-card w-full justify-start overflow-x-auto">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="hours">Hours</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-black mb-4">About Me</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{therapist.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>{therapist.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>{therapist.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="w-4 h-4 text-primary" />
                        <a href={`https://${therapist.website}`} className="text-primary hover:underline">
                          {therapist.website}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3">Credentials</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong className="text-white">License:</strong> {therapist.license}</p>
                      <p><strong className="text-white">Experience:</strong> {therapist.experience}</p>
                      <p><strong className="text-white">Verified:</strong> ✓ Background Check Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-black mb-6">Services & Pricing</h2>
                <div className="space-y-4">
                  {therapist.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h3 className="font-bold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.duration}</p>
                      </div>
                      <span className="text-xl font-bold text-primary">{service.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-black mb-6">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {therapist.gallery.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hours" className="mt-6">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-black mb-6">Business Hours</h2>
                <div className="space-y-3">
                  {Object.entries(therapist.hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-semibold capitalize">{day}</span>
                      </div>
                      <span className="text-muted-foreground">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TherapistProfile;
