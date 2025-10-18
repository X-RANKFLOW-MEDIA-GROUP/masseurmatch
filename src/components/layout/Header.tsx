import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black gradient-text">MassageConnect</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/explore" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Explore
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="hero" size="sm">Join Now</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
          <nav className="container mx-auto flex flex-col space-y-4 px-4 py-6">
            <Link to="/explore" className="text-sm font-medium text-white/80 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Explore
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium text-white/80 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-white/80 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            <div className="flex flex-col space-y-2 pt-4">
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full">Join Now</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
