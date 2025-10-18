import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Shield, Star, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const featuredTherapists = [
    {
      id: 1,
      name: "Marcus Rivera",
      city: "Los Angeles",
      specialty: "Deep Tissue & Sports",
      rating: 4.9,
      reviews: 127,
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop",
      verified: true,
      plan: "Platinum"
    },
    {
      id: 2,
      name: "James Chen",
      city: "San Francisco",
      specialty: "Swedish & Relaxation",
      rating: 4.8,
      reviews: 94,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
      verified: true,
      plan: "Gold"
    },
    {
      id: 3,
      name: "David Anderson",
      city: "New York",
      specialty: "Therapeutic & Wellness",
      rating: 5.0,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop",
      verified: true,
      plan: "Premium"
    },
    {
      id: 4,
      name: "Alex Thompson",
      city: "Miami",
      specialty: "Hot Stone & Aromatherapy",
      rating: 4.9,
      reviews: 112,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop",
      verified: true,
      plan: "Premium"
    },
    {
      id: 5,
      name: "Ryan Martinez",
      city: "Chicago",
      specialty: "Sports Recovery",
      rating: 4.7,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop",
      verified: true,
      plan: "Standard"
    },
    {
      id: 6,
      name: "Kyle Johnson",
      city: "Seattle",
      specialty: "Prenatal & Wellness",
      rating: 4.8,
      reviews: 103,
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=800&fit=crop",
      verified: false,
      plan: "Standard"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section relative py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={heroImage} 
            alt="Professional massage therapy" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-1.5">
              Over 10,000+ Professional Therapists
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Find Your Perfect
              <span className="gradient-text block mt-2">Massage Therapist</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with verified, professional massage therapists in your area. 
              Book trusted wellness services with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/explore">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Explore Therapists
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="glass" size="lg" className="w-full sm:w-auto">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">Featured Professionals</Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Top <span className="gradient-text">Verified</span> Therapists
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our most trusted and highly-rated massage professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTherapists.map((therapist) => (
              <Link 
                key={therapist.id} 
                to={`/therapist/${therapist.id}`}
                className="glass-card p-6 card-hover group"
              >
                <div className="relative mb-4">
                  <img 
                    src={therapist.image} 
                    alt={therapist.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {therapist.verified && (
                    <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {therapist.plan === "Platinum" && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                      💎 Elite
                    </Badge>
                  )}
                  {therapist.plan === "Gold" && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white border-0">
                      ⭐ Gold
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-1">{therapist.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{therapist.city}</p>
                <p className="text-sm text-primary mb-3">{therapist.specialty}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{therapist.rating}</span>
                    <span className="text-sm text-muted-foreground">({therapist.reviews})</span>
                  </div>
                  <Button variant="ghost" size="sm" className="group-hover:text-primary">
                    View Profile →
                  </Button>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/explore">
              <Button variant="outline" size="lg">
                View All Therapists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Professionals</h3>
              <p className="text-muted-foreground">
                All therapists undergo thorough verification and background checks
              </p>
            </div>

            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trusted Reviews</h3>
              <p className="text-muted-foreground">
                Real reviews from verified clients to help you choose
              </p>
            </div>

            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Professional Growth</h3>
              <p className="text-muted-foreground">
                Flexible subscription plans to grow your practice
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="glass-card p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Ready to Join <span className="gradient-text">MassageConnect</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your free profile today and connect with clients seeking your expertise
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
