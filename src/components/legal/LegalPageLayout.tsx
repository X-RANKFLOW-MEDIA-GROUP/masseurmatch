import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { SEOHead } from "@/components/seo/SEOHead";

interface LegalPageLayoutProps {
  title: string;
  seoTitle: string;
  seoDescription: string;
  path: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

const legalNav = [
  { to: "/terms", label: "Terms" },
  { to: "/therapist-agreement", label: "Subscription" },
  { to: "/privacy", label: "Privacy" },
  { to: "/cookies", label: "Cookies" },
  { to: "/billing-policy", label: "Billing" },
  { to: "/acceptable-use", label: "Use" },
  { to: "/photo-policy", label: "Photos" },
  { to: "/dmca", label: "DMCA" },
  { to: "/accessibility", label: "Accessibility" },
  { to: "/legal-contact", label: "Contact" },
];

export const LegalPageLayout = ({
  title,
  seoTitle,
  seoDescription,
  path,
  lastUpdated = "March 10, 2026",
  children,
}: LegalPageLayoutProps) => {
  const scrollRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead title={seoTitle} description={seoDescription} path={path} />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Legal nav */}
          <div className="max-w-4xl mx-auto mb-10">
            <nav className="flex flex-wrap gap-2 justify-center">
              {legalNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    path === item.to
                      ? "border-primary/30 bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4"
            >
              Legal
            </motion.p>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <TextReveal text={title} delay={0.1} />
            </h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 text-xs text-muted-foreground"
            >
              <span>Last updated: {lastUpdated}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">XRankFlow Media Group LLC — Dover, DE</span>
            </motion.div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto legal-content"
          >
            {children}
          </motion.div>

          {/* Bottom nav */}
          <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {legalNav.filter((n) => n.to !== path).slice(0, 6).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="underline-sweep hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
