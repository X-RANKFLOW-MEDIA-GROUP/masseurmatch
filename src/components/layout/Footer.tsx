"use client";

import Link from 'next/link';
import { useTranslation } from "react-i18next";
import { NewsletterSignup } from "../newsletter/NewsletterSignup";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  const linkGroups = [
    {
      title: t("footer.directory"),
      links: [
        { to: "/explore", label: t("footer.browseTherapists") },
        { to: "/los-angeles", label: "Los Angeles" },
        { to: "/new-york", label: "New York" },
        { to: "/san-francisco", label: "San Francisco" },
        { to: "/miami", label: "Miami" },
      ],
    },
    {
      title: t("footer.forProviders"),
      links: [
        { to: "/register", label: t("footer.listYourPractice") },
        { to: "/pricing", label: t("footer.advertisingPlans") },
        { to: "/dashboard", label: t("footer.providerDashboard") },
        { to: "/about", label: t("footer.aboutUs") },
      ],
    },
    {
      title: t("footer.legalSafety"),
      links: [
        { to: "/terms", label: t("footer.termsOfService") },
        { to: "/privacy", label: t("footer.privacyPolicy") },
        { to: "/safety", label: t("footer.safetyGuidelines") },
        { to: "/billing-policy", label: "Billing & Refunds" },
        { to: "/acceptable-use", label: "Acceptable Use" },
        { to: "/cookies", label: "Cookies" },
        { to: "/dmca", label: "DMCA" },
        { to: "/accessibility", label: "Accessibility" },
        { to: "/legal-contact", label: "Legal Contact" },
      ],
    },
  ];

  return (
    <footer className="relative bg-white border-t border-gray-100 overflow-hidden" role="contentinfo" aria-label="Site footer">
      {/* Decorative Blur Background */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 translate-y-1/2 translate-x-1/2"></div>
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-lg font-bold font-heading text-foreground mb-4">MasseurMatch</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t("footer.brandDescription")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("footer.disclaimer")}
            </p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">{group.title}</h4>
              <ul className="space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link href={link.to} className="text-muted-foreground hover:text-foreground transition-colors duration-300 underline-sweep">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Glass Newsletter Widget */}
        <div className="mt-10 bg-white/60 backdrop-blur-md border border-gray-200 p-2 rounded-2xl flex items-center shadow-sm max-w-md">
          <NewsletterSignup />
        </div>

        <div className="border-t border-border mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {t("footer.copyright")}
          </p>
          <p className="text-xs text-muted-foreground">
            Operated by XRankFlow Media Group LLC · Dover, DE
          </p>
          <p className="text-xs text-muted-foreground">
            {t("footer.ageNotice")}
          </p>
        </div>
      </div>
    </footer>
  );
};
