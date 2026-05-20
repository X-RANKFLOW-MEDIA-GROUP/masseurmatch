"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageCircleQuestion, Save, Sparkles } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type FAQItem = {
  question: string;
  answer: string;
};

function isFAQItem(item: unknown): item is FAQItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "question" in item &&
    "answer" in item &&
    typeof (item as FAQItem).question === "string" &&
    typeof (item as FAQItem).answer === "string"
  );
}

const PREMADE_QUESTIONS = [
  "What types of massage do you specialize in?",
  "What should I expect during my first session?",
  "How do I book an appointment?",
  "What are your cancellation policies?",
  "Do you offer outcall or mobile services?",
  "Is your space LGBTQ+ friendly and inclusive?",
  "What certifications or training do you have?",
  "How long are your sessions?",
  "What should I wear or bring to a session?",
  "Do you offer couples or group sessions?",
];

export function DashboardFAQ() {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>(
    PREMADE_QUESTIONS.map((question) => ({
      question,
      answer: "",
    })),
  );

  useEffect(() => {
    const savedFaqs = profile?.custom_faq;
    if (!Array.isArray(savedFaqs)) {
      return;
    }

    setFaqs(
      PREMADE_QUESTIONS.map((question) => {
        const match = savedFaqs.find((item): item is FAQItem => isFAQItem(item) && item.question === question);
        return {
          question,
          answer: typeof match?.answer === "string" ? match.answer : "",
        };
      }),
    );
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const nextFaqs = faqs.filter((item) => item.answer.trim().length > 0);
    const { error } = await updateProfile({ custom_faq: nextFaqs });
    setSaving(false);

    toast({
      title: error ? "Could not save FAQ" : "FAQ updated",
      description: error?.message || "Your public Q&A is saved.",
      variant: error ? "destructive" : "default",
    });
  };

  const generateAnswer = async (index: number) => {
    setGeneratingIndex(index);

    try {
      const profileContext = profile
        ? `Name: ${profile.display_name || profile.full_name || "N/A"}. Bio: ${profile.bio || "N/A"}. Specialties: ${Array.isArray(profile.specialties) ? profile.specialties.join(", ") : "N/A"}. City: ${profile.city || "N/A"}. Languages: ${Array.isArray(profile.languages) ? profile.languages.join(", ") : "N/A"}.`
        : "No profile context available.";

      const { data, error } = await supabase.functions.invoke("generate-faq-answer", {
        body: {
          question: faqs[index]?.question,
          profileContext,
        },
      });

      if (error) {
        throw error;
      }

      if (typeof data?.answer === "string" && data.answer.trim()) {
        setFaqs((current) =>
          current.map((item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  answer: data.answer,
                }
              : item,
          ),
        );

        toast({
          title: "Answer generated",
          description: "Review it before publishing to your profile.",
        });
        return;
      }

      throw new Error(data?.error || "The AI response did not include an answer.");
    } catch (error) {
      toast({
        title: "Could not generate answer",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setGeneratingIndex(null);
    }
  };

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl border border-border bg-muted/30" />;
  }

  const answeredCount = faqs.filter((item) => item.answer.trim().length > 0).length;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5" />
            Profile Q&A
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Add answers to common questions so visitors can understand your services faster.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {answeredCount}/{PREMADE_QUESTIONS.length} answered
          </p>
        </div>

        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {faqs.map((faq, index) => (
          <section key={faq.question} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Visible on your profile once saved.</p>
              </div>

              {faq.answer.trim() ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
            </div>

            <Textarea
              value={faq.answer}
              onChange={(event) =>
                setFaqs((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? {
                          ...item,
                          answer: event.target.value,
                        }
                      : item,
                  ),
                )
              }
              placeholder="Write a clear answer for visitors."
              className="mt-3 min-h-24"
            />

            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void generateAnswer(index)}
                disabled={generatingIndex !== null}
              >
                {generatingIndex === index ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {generatingIndex === index ? "Generating..." : "Draft with AI"}
              </Button>
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
