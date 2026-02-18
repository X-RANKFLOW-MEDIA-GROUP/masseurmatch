import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const linkGroups = [
    {
      title: "Directory",
      links: [
        { to: "/explore", label: "Browse Therapists" },
        { to: "/city/los-angeles", label: "Los Angeles" },
        { to: "/city/new-york", label: "New York" },
        { to: "/city/san-francisco", label: "San Francisco" },
        { to: "/city/miami", label: "Miami" },
      ],
    },
    {
      title: "For Providers",
      links: [
        { to: "/register", label: "List Your Practice" },
        { to: "/pricing", label: "Advertising Plans" },
        { to: "/dashboard", label: "Provider Dashboard" },
        { to: "/about", label: "About Us" },
      ],
    },
    {
      title: "Legal & Safety",
      links: [
        { to: "/safety", label: "Safety Guidelines" },
        { to: "/faq", label: "FAQ" },
        { to: "/terms", label: "Terms of Service" },
        { to: "/privacy", label: "Privacy Policy" },
        { to: "/contact", label: "Contact" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border mt-0">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-lg font-bold font-heading text-foreground mb-4">MasseurMatch</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              An advertising directory connecting men with male massage therapists. 
              Professional, trusted, gay-friendly bodywork services.
            </p>
            <p className="text-xs text-muted-foreground">
              This is an advertising directory only. We do not verify providers or guarantee services.
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
            &copy; {currentYear} MasseurMatch — Advertising Directory. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            18+ only · Not a marketplace · No booking or payments processed
          </p>
        </div>
      </div>
    </footer>
  );
};
