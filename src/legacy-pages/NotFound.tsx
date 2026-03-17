import { Link, useLocation } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <SEOHead
        title="Page Not Found — MasseurMatch"
        description="The page you're looking for doesn't exist or has been removed."
        path={location.pathname}
        noindex
      />
      <h1 className="text-8xl font-bold text-foreground font-heading mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">This page doesn't exist or has been removed.</p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
        <Link
          to="/explore"
          className="px-6 py-3 border border-border text-foreground rounded-md text-sm font-medium hover:bg-card transition-colors"
        >
          Explore Therapists
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
