import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

const AdminAIPrecheck = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">AI Pre-check</h1>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="w-5 h-5" /> SightEngine Moderation + Human Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            The moderation system uses SightEngine API to automatically scan photos (nudity, violence, offensive content) and profile text (sexual content, personal info, links).
            Items flagged by SightEngine appear in the moderation queue for human review.
          </p>
          <div className="mt-4 p-4 rounded-lg bg-secondary border border-border space-y-2">
            <p className="text-sm font-medium">Status: Active</p>
            <p className="text-xs text-muted-foreground">Photos → <code className="text-xs">moderate-photo</code> (nudity-2.1, offensive, gore, violence, drugs)</p>
            <p className="text-xs text-muted-foreground">Text → <code className="text-xs">moderate-text</code> (nudity, links, personal info)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAIPrecheck;