"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  Star,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignup } from "../_lib/signup-context";

const SUPPORTED_PLATFORMS = [
  { id: "rubmaps", name: "RubMaps", example: "https://rubmaps.com/provider/..." },
  { id: "4corners", name: "4Corners", example: "https://4corners.xxx/..." },
  { id: "nuru", name: "NuruMap", example: "https://nurumap.com/provider/..." },
  { id: "custom", name: "Other Directory", example: "https://yoursite.com/..." },
];

export default function SignupMigrationPage() {
  const router = useRouter();
  const { state, updateProfile } = useSignup();
  const [urls, setUrls] = useState<Array<{ id: string; platform: string; url: string; status: "pending" | "validated" | "error" }>>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("rubmaps");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const validateUrl = async (url: string, platform: string) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const res = await fetch("/api/migrate/validate-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform }),
      });

      if (!res.ok) {
        const err = await res.json();
        setValidationError(err.message || "Could not validate URL. Please check and try again.");
        setIsValidating(false);
        return false;
      }

      return true;
    } catch (error) {
      setValidationError("Network error. Please check your connection.");
      setIsValidating(false);
      return false;
    }
  };

  const addUrl = async () => {
    if (!currentUrl.trim()) {
      setValidationError("Please enter a URL.");
      return;
    }

    if (!currentUrl.includes("http")) {
      setValidationError("URL must start with http:// or https://");
      return;
    }

    const isValid = await validateUrl(currentUrl, selectedPlatform);
    if (!isValid) return;

    const newEntry = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      url: currentUrl,
      status: "validated" as const,
    };

    setUrls([...urls, newEntry]);
    setCurrentUrl("");
    setValidationError(null);
    setIsValidating(false);
  };

  const removeUrl = (id: string) => {
    setUrls(urls.filter((u) => u.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/migrate/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileUrls: urls.map((u) => ({ platform: u.platform, url: u.url })),
          email: state.email,
        }),
      });

      if (!res.ok) {
        setValidationError("Failed to initiate migration. Please try again.");
        setIsSubmitting(false);
        return;
      }

      router.push("/signup/review");
    } catch (error) {
      setValidationError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const platformName = SUPPORTED_PLATFORMS.find((p) => p.id === selectedPlatform)?.name || "Platform";

  return (
    <div className="mx-auto max-w-3xl space-y-12 py-8">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="space-y-4">
          <div className="inline-block">
            <Badge variant="outline" className="border-[#8B1E2D]/20 bg-[#F8EDEE] text-[#8B1E2D]">
              <Star className="mr-1.5 h-3.5 w-3.5" strokeWidth={2.5} />
              Profile Transfer
            </Badge>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#111111]">
            Bring Your Reviews & Reputation
          </h1>
          <p className="text-lg text-[#6F6F6F]">
            Add links to your profiles on other directories. We'll migrate your reviews, ratings, and service history to MasseurMatch while you focus on clients.
          </p>
        </div>
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          { icon: Users, label: "Keep Your Reviews", detail: "All ratings and feedback migrate intact" },
          { icon: Clock, label: "We Handle It", detail: "Seamless transfer while you onboard" },
          { icon: CheckCircle2, label: "You Get Notified", detail: "Email confirmation when migration is live" },
        ].map((benefit) => (
          <Card key={benefit.label} className="border-[#E8E8E8] bg-white">
            <CardContent className="p-4 text-center">
              <benefit.icon className="mx-auto mb-3 h-5 w-5 text-[#8B1E2D]" strokeWidth={2.25} />
              <p className="text-sm font-semibold text-[#111111]">{benefit.label}</p>
              <p className="mt-1 text-xs text-[#8E8E8E]">{benefit.detail}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Input Section */}
      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <Card className="border-[#E8E8E8] bg-white">
          <CardContent className="p-6">
            <h2 className="mb-6 font-display text-lg font-semibold text-[#111111]">Add Your Profile URLs</h2>

            <div className="space-y-4">
              {/* Platform Selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#6F6F6F]">
                  Where are you listed?
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUPPORTED_PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        setValidationError(null);
                      }}
                      className={`rounded-lg border-2 p-3 text-left transition-all ${
                        selectedPlatform === platform.id
                          ? "border-[#8B1E2D] bg-[#F8EDEE]"
                          : "border-[#E8E8E8] bg-white hover:border-[#D9D9D9]"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#111111]">{platform.name}</p>
                      <p className="mt-1 text-xs text-[#8E8E8E]">{platform.example}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#6F6F6F]">
                  Your {platformName} profile URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://"
                    value={currentUrl}
                    onChange={(e) => {
                      setCurrentUrl(e.target.value);
                      setValidationError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addUrl();
                      }
                    }}
                    disabled={isValidating || isSubmitting}
                    className="flex-1 border-[#D9D9D9] bg-white text-[#111111] placeholder-[#8E8E8E] focus:border-[#8B1E2D]"
                  />
                  <Button
                    type="button"
                    onClick={addUrl}
                    disabled={isValidating || isSubmitting || !currentUrl.trim()}
                    className="bg-[#8B1E2D] hover:bg-[#6E1521]"
                  >
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    )}
                  </Button>
                </div>
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 p-3"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" strokeWidth={2.5} />
                    <p className="text-sm text-red-800">{validationError}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Added URLs List */}
        <AnimatePresence>
          {urls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F6F6F]">
                Profiles to migrate ({urls.length})
              </div>
              {urls.map((url, index) => (
                <motion.div
                  key={url.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between rounded-lg border border-[#D9D9D9] bg-white p-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#8B1E2D]" strokeWidth={2.25} />
                    <div className="min-w-0">
                      <Badge variant="outline" className="border-[#D9D9D9]">
                        {SUPPORTED_PLATFORMS.find((p) => p.id === url.platform)?.name}
                      </Badge>
                      <p className="mt-1.5 truncate text-sm text-[#6F6F6F]">{url.url}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUrl(url.id)}
                    className="ml-2 text-[#8E8E8E] hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="border-[#D9D9D9]"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#8B1E2D] hover:bg-[#6E1521]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Review
                <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.5} />
              </>
            )}
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => router.push("/signup/review")}
            disabled={isSubmitting}
            className="text-[#8E8E8E] hover:text-[#6F6F6F]"
          >
            Skip profile migration for now
          </Button>
        </div>
      </motion.form>

      {/* Trust Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-6 text-center"
      >
        <p className="text-sm text-[#6F6F6F]">
          Your profile URLs are used only for migration. We never share your profiles or contact information with other platforms.{" "}
          <Link href="/privacy" className="text-[#8B1E2D] hover:underline">
            Read our privacy policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
