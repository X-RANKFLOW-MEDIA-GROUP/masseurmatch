import Link from "next/link";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

const documents = [
  {
    title: "Terms of Service",
    description: "Review the terms of service document that users must accept.",
    href: "/terms",
    action: "Open Terms",
  },
  {
    title: "Privacy Policy",
    description: "Review the privacy policy that outlines data handling.",
    href: "/privacy",
    action: "Open Privacy",
  },
  {
    title: "Code of Conduct",
    description: "Review the conduct rules for therapists and users.",
    href: "/community-guidelines",
    action: "Open Conduct",
  },
  {
    title: "Disclaimer",
    description: "Review the platform liability and service disclaimers.",
    href: "/platform-disclaimer",
    action: "Open Disclaimer",
  },
] as const;

export default function AdminLegalPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Legal & Compliance"
        description="Review the currently published terms, policies, and legal documents."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((document) => (
          <Card key={document.href} className="border-border bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-base">{document.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{document.description}</p>
              <Button className="w-full" variant="outline" asChild>
                <Link href={document.href} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {document.action}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
