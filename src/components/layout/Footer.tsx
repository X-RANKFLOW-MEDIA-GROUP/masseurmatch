import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-black gradient-text mb-4">MassageConnect</h3>
            <p className="text-sm text-muted-foreground">
              Connecting professional massage therapists with clients seeking quality wellness services.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/explore" className="text-muted-foreground hover:text-white transition-colors">Explore Therapists</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-white transition-colors">Pricing Plans</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-bold text-white mb-4">For Professionals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="text-muted-foreground hover:text-white transition-colors">Join as Therapist</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/billing" className="text-muted-foreground hover:text-white transition-colors">Billing</Link></li>
              <li><Link to="/settings" className="text-muted-foreground hover:text-white transition-colors">Settings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="text-muted-foreground hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-muted-foreground hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MassageConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
