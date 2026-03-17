import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo/SEOHead";
import { CheckCircle2, MapPin, ArrowRight, Loader2, AlertTriangle, UserCheck } from "lucide-react";

const ClaimProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeedProfile = async () => {
      if (!slug) { setLoading(false); return; }

      const { data, error: fetchErr } = await supabase
        .from("profiles")
        .select("id, display_name, full_name, city, state, specialties, bio, is_seed_profile, seed_claimed_by, seed_slug")
        .eq("seed_slug", slug)
        .maybeSingle();

      if (fetchErr || !data) {
        setError("Profile not found.");
      } else if (!data.is_seed_profile) {
        setError("This profile has already been claimed and is now a verified listing.");
      } else if (data.seed_claimed_by) {
        setError("This profile has already been claimed by another user.");
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchSeedProfile();
  }, [slug]);

  const handleClaim = async () => {
    if (!user) {
      navigate(`/auth?redirect=/claim/${slug}`);
      return;
    }

    setClaiming(true);
    setError(null);

    const { data, error: claimErr } = await supabase.functions.invoke("claim-profile", {
      body: { slug },
    });

    setClaiming(false);

    if (claimErr || data?.error) {
      setError(data?.error || claimErr?.message || "Failed to claim profile");
      return;
    }

    setClaimed(true);

    // Redirect to dashboard after 3 seconds
    setTimeout(() => navigate("/dashboard/profile"), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Claim Your Profile | MasseurMatch"
        description="Claim and verify your massage therapist profile on MasseurMatch."
        path={`/claim/${slug || ""}`}
        noindex
      />
      <Header />

      <div className="container mx-auto px-4 py-20 max-w-2xl">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : claimed ? (
          <div className="glass-card p-10 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Profile Claimed!</h1>
            <p className="text-muted-foreground">
              Your profile has been claimed successfully. Complete identity verification and photo upload to activate your listing.
            </p>
            <p className="text-xs text-muted-foreground">Redirecting to your dashboard...</p>
          </div>
        ) : error && !profile ? (
          <div className="glass-card p-10 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
            <h1 className="text-2xl font-bold">Unavailable</h1>
            <p className="text-muted-foreground">{error}</p>
            <Link to="/auth">
              <Button variant="outline" className="mt-4">
                Create a New Profile Instead
              </Button>
            </Link>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            <div className="text-center">
              <Badge variant="outline" className="mb-4 text-xs">
                <UserCheck className="w-3 h-3 mr-1" />
                Claim Your Listing
              </Badge>
              <h1 className="text-3xl font-bold mb-2">Is this your practice?</h1>
              <p className="text-muted-foreground">
                Claim this profile to take ownership, verify your identity, and activate your listing on MasseurMatch.
              </p>
            </div>

            <div className="glass-card p-8 space-y-4">
              <h2 className="text-2xl font-bold">{profile.display_name || profile.full_name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4" />
                {[profile.city, profile.state].filter(Boolean).join(", ")}
              </div>
              {profile.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(profile.specialties as string[]).slice(0, 4).map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}
              {profile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
              )}
            </div>

            <div className="glass-card p-6 space-y-3">
              <h3 className="font-semibold text-sm">What happens when you claim:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  This profile becomes yours — same URL, no broken links
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  You can edit all information (name, bio, pricing, photos)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Your listing is hidden until you complete identity verification
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Once verified, your profile goes live with a Verified badge
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={handleClaim}
                disabled={claiming}
                className="w-full gap-2"
              >
                {claiming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                {user ? "Claim This Profile" : "Sign Up to Claim"}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By claiming, you confirm you are the professional listed and agree to our{" "}
                <Link to="/terms" className="underline">Terms of Service</Link>.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
};

export default ClaimProfile;
