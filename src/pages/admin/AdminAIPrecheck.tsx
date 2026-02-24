import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

const AdminAIPrecheck = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">AI Pre-check</h1>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="w-5 h-5" /> Automatic Scan + Human Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            The AI Pre-check system uses Gemini 2.0 Flash to automatically scan photos and profile content.
            Items flagged by AI appear in the moderation queue for human review.
          </p>
          <div className="mt-4 p-4 rounded-lg bg-secondary border border-border">
            <p className="text-sm font-medium">Status: Active</p>
            <p className="text-xs text-muted-foreground mt-1">Photos are automatically scanned on upload via the moderate-photo edge function.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAIPrecheck;