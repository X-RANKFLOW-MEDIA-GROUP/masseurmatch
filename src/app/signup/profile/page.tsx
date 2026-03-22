"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignup } from "../_lib/signup-context";

const SERVICE_CATEGORIES = [
  "Swedish Massage",
  "Deep Tissue",
  "Sports Massage",
  "Thai Massage",
  "Hot Stone",
  "Reflexology",
  "Aromatherapy",
  "Shiatsu",
  "Prenatal",
  "Lymphatic Drainage",
  "Myofascial Release",
  "Trigger Point",
];

const SESSION_LENGTHS = ["30 min", "60 min", "90 min", "120 min"];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV",
  "NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN",
  "TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

export default function SignupProfilePage() {
  const router = useRouter();
  const { state, updateProfile, markProfileCompleted } = useSignup();
  const p = state.profile;
  const [error, setError] = useState<string | null>(null);

  function toggleInArray(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!p.tagline.trim()) { setError("Tagline is required."); return; }
    if (!p.bio.trim()) { setError("Bio is required."); return; }
    if (!p.city.trim()) { setError("City is required."); return; }
    if (!p.state.trim()) { setError("State is required."); return; }
    if (!p.neighborhood.trim()) { setError("Neighborhood is required for local discovery."); return; }
    if (p.serviceCategories.length === 0) { setError("Select at least one service category."); return; }
    if (p.sessionLengths.length === 0) { setError("Select at least one session length."); return; }
    if (!p.startingPrice.trim()) { setError("Starting price is required."); return; }
    if (!p.locationType) { setError("Select a location type."); return; }

    markProfileCompleted();
    router.push("/signup/review");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Create Your Public Profile
        </h1>
        <p className="mt-3 text-muted-foreground">
          Add the details clients use to discover and evaluate your services.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section A: Professional Basics */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2 text-brand-secondary">
              <User className="h-5 w-5" />
              <h2 className="font-display text-lg font-semibold text-foreground">Professional Basics</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline *</Label>
              <Input
                id="tagline"
                value={p.tagline}
                onChange={(e) => updateProfile({ tagline: e.target.value })}
                placeholder="e.g. Experienced deep tissue specialist in Midtown"
                maxLength={120}
              />
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">{p.tagline.length}/120</p>
                <button
                  type="button"
                  className="ml-auto flex items-center gap-1 text-xs text-brand-secondary"
                  onClick={() => updateProfile({ tagline: "Professional massage therapist offering personalized sessions" })}
                >
                  <Sparkles className="h-3 w-3" /> AI Suggest
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={p.bio}
                onChange={(e) => updateProfile({ bio: e.target.value })}
                placeholder="Tell clients about your experience, approach, and specialties..."
                maxLength={1000}
                rows={5}
              />
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">{p.bio.length}/1000</p>
                <button
                  type="button"
                  className="ml-auto flex items-center gap-1 text-xs text-brand-secondary"
                  onClick={() => {}}
                >
                  <Sparkles className="h-3 w-3" /> AI Suggest
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  max="50"
                  value={p.yearsExperience}
                  onChange={(e) => updateProfile({ yearsExperience: e.target.value })}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education / Training</Label>
                <Input
                  id="education"
                  value={p.education}
                  onChange={(e) => updateProfile({ education: e.target.value })}
                  placeholder="School or certification program"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Input
                id="certifications"
                value={p.certifications}
                onChange={(e) => updateProfile({ certifications: e.target.value })}
                placeholder="e.g. LMT, NCTMB, CPR"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section B: Location */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2 text-brand-secondary">
              <MapPin className="h-5 w-5" />
              <h2 className="font-display text-lg font-semibold text-foreground">Location</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={p.city}
                  onChange={(e) => updateProfile({ city: e.target.value })}
                  placeholder="e.g. New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <select
                  id="state"
                  value={p.state}
                  onChange={(e) => updateProfile({ state: e.target.value })}
                  className="flex h-12 w-full rounded-xl border border-border/90 bg-white/92 px-4 py-2 text-sm"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood *</Label>
              <Input
                id="neighborhood"
                value={p.neighborhood}
                onChange={(e) => updateProfile({ neighborhood: e.target.value })}
                placeholder="e.g. Midtown, West Hollywood, South Beach"
              />
              <p className="text-xs text-muted-foreground">
                Neighborhood improves local search click-through rate significantly.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Location Type *</Label>
              <div className="flex flex-wrap gap-2">
                {(["incall", "outcall", "both"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateProfile({ locationType: type })}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      p.locationType === type
                        ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary"
                        : "border-border bg-white text-muted-foreground hover:border-border-strong"
                    }`}
                  >
                    {type === "incall" ? "In-Call" : type === "outcall" ? "Out-Call" : "Both"}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section C: Services */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2 text-brand-secondary">
              <Briefcase className="h-5 w-5" />
              <h2 className="font-display text-lg font-semibold text-foreground">Services</h2>
            </div>

            <div className="space-y-2">
              <Label>Service Categories *</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      updateProfile({
                        serviceCategories: toggleInArray(p.serviceCategories, cat),
                      })
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      p.serviceCategories.includes(cat)
                        ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary"
                        : "border-border bg-white text-muted-foreground hover:border-border-strong"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Lengths *</Label>
              <div className="flex flex-wrap gap-2">
                {SESSION_LENGTHS.map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() =>
                      updateProfile({
                        sessionLengths: toggleInArray(p.sessionLengths, len),
                      })
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      p.sessionLengths.includes(len)
                        ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary"
                        : "border-border bg-white text-muted-foreground hover:border-border-strong"
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="startingPrice"
                    type="number"
                    min="0"
                    value={p.startingPrice}
                    onChange={(e) => updateProfile({ startingPrice: e.target.value })}
                    placeholder="e.g. 100"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addOns">Add-Ons</Label>
                <Input
                  id="addOns"
                  value={p.addOns}
                  onChange={(e) => updateProfile({ addOns: e.target.value })}
                  placeholder="e.g. Hot stones +$20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section D: Availability */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2 text-brand-secondary">
              <Calendar className="h-5 w-5" />
              <h2 className="font-display text-lg font-semibold text-foreground">Availability</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateProfile({ availableNow: !p.availableNow })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  p.availableNow ? "bg-green-500" : "bg-gray-200"
                }`}
                role="switch"
                aria-checked={p.availableNow}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                    p.availableNow ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <div>
                <Label>Available Now</Label>
                <p className="text-xs text-muted-foreground">Toggle when you are accepting clients right now.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section E: Photos */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2 text-brand-secondary">
              <Camera className="h-5 w-5" />
              <h2 className="font-display text-lg font-semibold text-foreground">Photos</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhoto">Profile Photo</Label>
              <Input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  updateProfile({ profilePhoto: file });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="galleryPhotos">Gallery Photos</Label>
              <Input
                id="galleryPhotos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  updateProfile({ galleryPhotos: files });
                }}
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-bg-subtle/30 p-4">
              <Checkbox
                id="mediaCompliance"
                checked={p.mediaCompliance}
                onCheckedChange={(v) => updateProfile({ mediaCompliance: v === true })}
              />
              <Label htmlFor="mediaCompliance" className="text-sm leading-snug">
                I confirm that all uploaded photos are professional, appropriate,
                and do not contain explicit content.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Inline preview */}
        <Card className="border-brand-secondary/20 bg-brand-secondary/5">
          <CardContent className="p-6">
            <h3 className="mb-3 font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Profile Preview
            </h3>
            <div className="flex flex-wrap gap-3">
              {p.availableNow && (
                <Badge className="bg-green-500 text-white">
                  <Clock className="mr-1 h-3 w-3" /> Available Now
                </Badge>
              )}
              {p.neighborhood && (
                <Badge variant="outline">
                  <MapPin className="mr-1 h-3 w-3" /> {p.neighborhood}
                </Badge>
              )}
              {p.startingPrice && (
                <Badge variant="outline">
                  <DollarSign className="mr-1 h-3 w-3" /> From ${p.startingPrice}
                </Badge>
              )}
              {p.yearsExperience && (
                <Badge variant="outline">
                  {p.yearsExperience} yrs experience
                </Badge>
              )}
            </div>
            {p.tagline && (
              <p className="mt-3 text-sm font-medium text-foreground">{p.tagline}</p>
            )}
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Continue to Review
        </Button>
      </form>
    </div>
  );
}
