import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Star, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Index = () => {
  const scrollRef = useScrollReveal();

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

  const stats = [
    { label: "Verified Therapists", value: "10,000+" },
    { label: "Cities Covered", value: "500+" },
    { label: "Client Sessions", value: "2M+" },
    { label: "5-Star Reviews", value: "98%" },
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <p className="reveal text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
              The Professional Massage Directory
            </p>
            <h1 className="reveal reveal-delay-1 text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.9] tracking-tight mb-8">
              Find Your Perfect
              <br />
              Massage Therapist
            </h1>
            <p className="reveal reveal-delay-2 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Connect with verified, professional massage therapists in your area. 
              Book trusted wellness services with confidence.
            </p>
            <div className="reveal reveal-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/explore">
                <Button size="lg" className="w-full sm:w-auto group">
                  Explore Therapists
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle divider line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      </section>

      {/* Stats Section */}
      <section className="py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`reveal reveal-delay-${i + 1} text-center`}>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-heading">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="reveal mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Featured Professionals</p>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              Top Verified Therapists
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {featuredTherapists.map((therapist, i) => (
              <Link 
                key={therapist.id} 
                to={`/therapist/${therapist.id}`}
                className={`reveal reveal-delay-${(i % 3) + 1} bg-background p-8 group transition-colors duration-500 hover:bg-card`}
              >
                <div className="relative mb-6 overflow-hidden">
                  <img 
                    src={therapist.image} 
                    alt={therapist.name}
                    className="w-full h-72 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  {therapist.verified && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 text-xs text-foreground">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{therapist.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{therapist.city}</p>
                    <p className="text-sm text-muted-foreground">{therapist.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 fill-foreground text-foreground" />
                    <span>{therapist.rating}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  View Profile
                  <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="reveal text-center mt-16">
            <Link to="/explore">
              <Button variant="outline" size="lg" className="group">
                View All Therapists
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="reveal mb-16 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Why MassageConnect</p>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              Built on trust
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            <div className="reveal reveal-delay-1 bg-background p-12">
              <div className="text-5xl font-bold text-foreground mb-6 font-heading">01</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Verified Professionals</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All therapists undergo thorough verification and background checks before joining the platform.
              </p>
            </div>

            <div className="reveal reveal-delay-2 bg-background p-12">
              <div className="text-5xl font-bold text-foreground mb-6 font-heading">02</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Trusted Reviews</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real reviews from verified clients help you make informed decisions about your wellness journey.
              </p>
            </div>

            <div className="reveal reveal-delay-3 bg-background p-12">
              <div className="text-5xl font-bold text-foreground mb-6 font-heading">03</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Professional Growth</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Flexible subscription plans designed to help therapists grow their practice and reach more clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="reveal text-4xl md:text-7xl font-bold text-foreground tracking-tight mb-8">
              Ready to get started?
            </h2>
            <p className="reveal reveal-delay-1 text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Create your free profile today and connect with clients seeking your expertise.
            </p>
            <div className="reveal reveal-delay-2 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
