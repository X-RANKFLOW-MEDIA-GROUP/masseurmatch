import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link2, Star, Trash2, Globe, Sparkles, ExternalLink, AlertCircle } from "lucide-react";

interface ImportedProfileData {
  id: string;
  source_url: string;
  source_platform: string | null;
  ai_summary: string | null;
  extracted_bio: string | null;
  extracted_specialties: string[] | null;
  extracted_rating_avg: number | null;
  extracted_review_count: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface ImportedReview {
  id: string;
  source_url: string;
  source_platform: string | null;
  reviewer_name: string | null;
  review_text: string;
  rating: number | null;
  review_date: string | null;
  imported_at: string;
}

export function ImportedReviewsManager({ profileId }: { profileId: string }) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [imports, setImports] = useState<ImportedProfileData[]>([]);
  const [reviews, setReviews] = useState<ImportedReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [importsRes, reviewsRes] = await Promise.all([
      supabase
        .from("imported_profile_data")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false }),
      supabase
        .from("imported_reviews")
        .select("*")
        .eq("profile_id", profileId)
        .order("imported_at", { ascending: false }),
    ]);

    if (importsRes.data) setImports(importsRes.data as unknown as ImportedProfileData[]);
    if (reviewsRes.data) setReviews(reviewsRes.data as unknown as ImportedReview[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const handleImport = async () => {
    if (!url.trim()) return;

    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-external-profile", {
        body: { url: url.trim(), profile_id: profileId },
      });

      if (error) {
        toast({
          title: "Import failed",
          description: error.message || "Could not import from this URL",
          variant: "destructive",
        });
      } else if (data?.error) {
        toast({
          title: "Import failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import successful!",
          description: `Imported ${data.reviews_count} reviews from ${data.platform}`,
        });
        setUrl("");
        fetchData();
      }
    } catch (err) {
      toast({
        title: "Import failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteImport = async (importId: string, sourceUrl: string) => {
    await Promise.all([
      supabase.from("imported_profile_data").delete().eq("id", importId),
      supabase.from("imported_reviews").delete().eq("profile_id", profileId).eq("source_url", sourceUrl),
    ]);
    toast({ title: "Import removed" });
    fetchData();
  };

  const handleDeleteReview = async (reviewId: string) => {
    await supabase.from("imported_reviews").delete().eq("id", reviewId);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Import Reviews from Other Websites</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Paste your profile link from Yelp, Google, MassageBook, or any other platform. Our AI will extract your reviews and profile data.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://www.yelp.com/biz/your-profile..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-9"
                disabled={importing}
              />
            </div>
            <Button onClick={handleImport} disabled={importing || !url.trim()}>
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
          {importing && (
            <p className="text-xs text-muted-foreground mt-2">
              Scraping page and extracting data with AI... This may take 15-30 seconds.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Import history */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {imports.map((imp) => (
            <Card key={imp.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-xs">
                        {imp.source_platform || "Unknown"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          imp.status === "completed"
                            ? "bg-success/10 text-success border-success/30"
                            : imp.status === "failed"
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : "bg-warning/10 text-warning border-warning/30"
                        }`}
                      >
                        {imp.status}
                      </Badge>
                      {imp.extracted_rating_avg && (
                        <span className="flex items-center gap-0.5 text-sm">
                          <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                          {imp.extracted_rating_avg}
                        </span>
                      )}
                      {imp.extracted_review_count !== null && imp.extracted_review_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {imp.extracted_review_count} reviews
                        </span>
                      )}
                    </div>

                    <a
                      href={imp.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                    >
                      {imp.source_url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>

                    {imp.error_message && (
                      <div className="flex items-start gap-1.5 mt-2 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        {imp.error_message}
                      </div>
                    )}

                    {imp.ai_summary && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary">AI Summary</span>
                        </div>
                        <p className="text-sm text-foreground">{imp.ai_summary}</p>
                      </div>
                    )}

                    {imp.extracted_specialties && imp.extracted_specialties.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {imp.extracted_specialties.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleDeleteImport(imp.id, imp.source_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Individual reviews */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Imported Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {r.reviewer_name && (
                          <span className="text-sm font-medium">{r.reviewer_name}</span>
                        )}
                        {r.rating && (
                          <span className="flex items-center gap-0.5 text-xs">
                            <Star className="h-3 w-3 text-warning fill-warning" />
                            {r.rating}
                          </span>
                        )}
                        <Badge variant="outline" className="text-[9px]">
                          {r.source_platform || "Imported"}
                        </Badge>
                        {r.review_date && (
                          <span className="text-[10px] text-muted-foreground">{r.review_date}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{r.review_text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive/50 hover:text-destructive shrink-0"
                      onClick={() => handleDeleteReview(r.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {imports.length === 0 && reviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No imported reviews yet</p>
              <p className="text-xs mt-1">Paste a link above to import your reviews from other platforms</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
