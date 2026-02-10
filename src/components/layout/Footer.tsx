import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const linkGroups = [
    {
      title: "Directory",
      links: [
        { to: "/explore", label: "Browse Male Therapists" },
        { to: "/pricing", label: "Therapist Plans" },
        { to: "/about", label: "About Us" },
        { to: "/contact", label: "Contact" },
      ],
    },
    {
      title: "For Therapists",
      links: [
        { to: "/register", label: "Join as Therapist" },
        { to: "/dashboard", label: "Dashboard" },
        { to: "/billing", label: "Billing" },
        { to: "/settings", label: "Settings" },
      ],
    },
    {
      title: "Legal",
      links: [
        { to: "/privacy", label: "Privacy Policy" },
        { to: "/terms", label: "Terms of Service" },
        { to: "/refund-policy", label: "Refund Policy" },
        { to: "/cookie-policy", label: "Cookie Policy" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border mt-0">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-lg font-bold font-heading text-foreground mb-4">MassageConnect</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The #1 gay massage directory connecting men with verified male massage therapists. 
              Professional, trusted, gay-friendly bodywork services.
            </p>
            <p className="text-xs text-muted-foreground">
              Gay massage • Male therapists • Men's bodywork • LGBTQ+ wellness
            </p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">{group.title}</h4>
              <ul className="space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-muted-foreground hover:text-foreground transition-colors duration-300 underline-sweep">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} MassageConnect — Gay Massage Directory. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Find verified male massage therapists near you
          </p>
        </div>
      </div>
    </footer>
  );
};
