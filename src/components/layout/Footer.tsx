import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border mt-32">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold font-heading text-foreground mb-4">MassageConnect</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting professional massage therapists with clients seeking quality wellness services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Explore Therapists</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Pricing Plans</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors duration-300">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Contact</Link></li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">For Professionals</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Join as Therapist</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Dashboard</Link></li>
              <li><Link to="/billing" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Billing</Link></li>
              <li><Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Settings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Refund Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MassageConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
