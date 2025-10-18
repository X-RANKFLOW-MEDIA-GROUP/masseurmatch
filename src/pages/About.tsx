import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, TrendingUp, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">About Us</Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Connecting Wellness <span className="gradient-text">Professionals</span> with Clients
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            MassageConnect is the premier platform for verified massage therapists to showcase their expertise 
            and connect with clients seeking trusted wellness services.
          </p>

          <div className="glass-card p-8 mb-12">
            <h2 className="text-3xl font-black mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              We believe everyone deserves access to quality massage therapy and wellness services. 
              Our mission is to create a trusted marketplace where professional massage therapists can 
              build their practice and clients can find reliable, verified professionals with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trust & Safety</h3>
              <p className="text-muted-foreground">
                All professionals undergo thorough verification including license validation and background checks.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community First</h3>
              <p className="text-muted-foreground">
                We foster a supportive community of wellness professionals and mindful clients.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Professional Growth</h3>
              <p className="text-muted-foreground">
                Flexible tools and plans designed to help massage therapists grow their practice.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Standards</h3>
              <p className="text-muted-foreground">
                We maintain high standards to ensure clients receive exceptional wellness experiences.
              </p>
            </div>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-3xl font-black mb-4">Our Values</h2>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-white">Transparency:</strong> Clear pricing, honest reviews, and verified credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-white">Professionalism:</strong> High standards for all listed therapists</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-white">Accessibility:</strong> Easy-to-use platform for both professionals and clients</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-white">Growth:</strong> Supporting therapists at every stage of their career</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
