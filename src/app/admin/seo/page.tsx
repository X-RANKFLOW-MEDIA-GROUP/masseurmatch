import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Globe, Code } from "lucide-react";
import { getPublicTherapists } from "@/app/_lib/directory";

export default async function AdminSeoPage() {
  const { items: therapists } = await getPublicTherapists({ page: 1, pageSize: 5 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO Dashboard"
        description="Optimize your entire website for search engines."
      />

      <Tabs defaultValue="metadata">
        <TabsList className="mb-4">
          <TabsTrigger value="metadata">Metadata Editor</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap Tools</TabsTrigger>
          <TabsTrigger value="json-ld">JSON-LD Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="metadata">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-base">Global Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label htmlFor="meta-title" className="text-sm font-medium text-foreground">Meta Title</label>
                  <Input
                    id="meta-title"
                    defaultValue="MasseurMatch - Find your ideal massage therapist"
                    className="bg-secondary/30 border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="meta-desc" className="text-sm font-medium text-foreground">Meta Description</label>
                  <Textarea
                    id="meta-desc"
                    rows={3}
                    defaultValue="The largest directory of massage therapists. Find qualified professionals near you."
                    className="bg-secondary/30 border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="keywords" className="text-sm font-medium text-foreground">Keywords</label>
                  <Input
                    id="keywords"
                    defaultValue="massage, masseur, therapy, wellness, relaxation"
                    className="bg-secondary/30 border-border"
                  />
                </div>
                <div>
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-base">Sitemap Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Sitemap URL</label>
                  <Input defaultValue="https://www.masseurmatch.com/sitemap.xml" readOnly className="bg-secondary/30 border-border" />
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Preview (first 5 therapists):</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                    {therapists.map((t) => (
                      <li key={t.id}>
                        /therapists/{t.slug || t.id} ({t.status || "unknown"})
                      </li>
                    ))}
                    {therapists.length === 0 && <li>No therapist records found.</li>}
                  </ul>
                </div>
                <div>
                  <Button variant="outline" className="gap-2">
                    <Globe className="h-4 w-4" />
                    Regenerate Sitemap
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json-ld">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-base">JSON-LD Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="rounded-xl bg-secondary/30 p-4">
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">{`{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MasseurMatch",
  "url": "https://www.masseurmatch.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.masseurmatch.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "numberOfTherapists": ${therapists.length}
}`}</pre>
                </div>
                <div>
                  <Button variant="outline" className="gap-2">
                    <Code className="h-4 w-4" />
                    Test with Google&apos;s Tool
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
