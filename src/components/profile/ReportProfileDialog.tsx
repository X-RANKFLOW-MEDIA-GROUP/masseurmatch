"use client";

import { useState } from "react";
import { Flag, ShieldAlert, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { postJson, ApiError } from "@/app/_lib/client-api";

type ReportProfileDialogProps = {
  profileId: string;
  profileName: string;
  profileSlug?: string;
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: "sexual_solicitation", label: "Sexual solicitation or illegal services" },
  { value: "trafficking", label: "Suspected trafficking or exploitation" },
  { value: "prohibited_content", label: "Prohibited or explicit content" },
  { value: "csam", label: "Content involving a minor (CSAM)" },
  { value: "fake_or_stolen", label: "Fake profile or stolen photos" },
  { value: "harassment_safety", label: "Harassment or safety concern" },
  { value: "other", label: "Something else" },
];

export function ReportProfileDialog({ profileId, profileName, profileSlug }: ReportProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setCategory("");
    setReason("");
    setEmail("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!category) {
      toast({ title: "Select a reason", description: "Please choose a report category.", variant: "destructive" });
      return;
    }
    if (reason.trim().length < 10) {
      toast({ title: "Add more detail", description: "Please describe the issue in at least a few words.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await postJson("/api/report-profile", {
        profileId,
        profileSlug,
        profileName,
        category,
        reason: reason.trim(),
        reporterEmail: email.trim() || undefined,
      });
      toast({
        title: "Report received",
        description: "Thank you. Our trust & safety team reviews every report.",
      });
      reset();
      setOpen(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Please try again in a moment.";
      toast({ title: "Could not send report", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6F6F] transition-colors hover:text-[#8B1E2D]"
        >
          <Flag className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
          Report this profile
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-[#8B1E2D]" strokeWidth={2.25} />
            Report {profileName}
          </DialogTitle>
          <DialogDescription>
            Tell us what&apos;s wrong with this profile. Reports are confidential and reviewed by our trust &amp;
            safety team. If someone is in immediate danger, call 911.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="report-category">Reason</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="report-category">
                <SelectValue placeholder="Choose a reason" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-reason">What happened?</Label>
            <Textarea
              id="report-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Describe the issue — what you saw and why it concerns you."
              rows={4}
              maxLength={2000}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-email">
              Your email <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="report-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Only if you're willing to be contacted for follow-up"
            />
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            For suspected human trafficking, also contact the National Human Trafficking Hotline at{" "}
            <strong>1-888-373-7888</strong>. To report child sexual abuse material, contact the NCMEC
            CyberTipline at <strong>1-800-843-5678</strong>.
          </p>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                "Submit report"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
