import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MasseurMatch — Premium Directory of LGBTQ+-Affirming Male Massage Therapists",
  description: "AI-powered verified therapist discovery — a premium directory of male massage therapists you can trust.",
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Find Your Perfect Therapist
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          MasseurMatch is a premium directory of LGBTQ+-affirming male massage therapists.
          Discover verified professionals you can trust in your area.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">For Clients</h2>
            <p className="text-muted-foreground mb-6">
              Browse and book appointments with verified male massage therapists who are LGBTQ+-affirming and trustworthy.
            </p>
            <a href="/explore" className="text-primary font-semibold hover:underline">
              Browse Therapists →
            </a>
          </div>
          <div className="border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">For Therapists</h2>
            <p className="text-muted-foreground mb-6">
              Grow your practice and connect with clients who value trust and quality.
            </p>
            <a href="/for-therapists" className="text-primary font-semibold hover:underline">
              List Your Practice →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
