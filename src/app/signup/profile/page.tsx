"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  CheckCircle2,
  DollarSign,
  Info,
  MapPin,
  Ruler,
  Scale,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignup } from "../_lib/signup-context";
import {
  BODY_TYPE_OPTIONS,
  PHOTO_RULES,
  PROFILE_RULES,
  SERVICE_OPTIONS,
  buildSeoDescription,
  createHeadlineOptions,
  createHeightOptions,
  fetchZipByCode,
  getCompletionScore,
  lookupZipArea,
  poundsToKilogramsLabel,
} from "@/lib/profile-autofill";

const SESSION_LENGTHS = ["60 min", "75 min", "90 min", "120 min"];
const LANGUAGE_OPTIONS = ["English", "Spanish", "Portuguese", "French", "Italian", "Mandarin", "Arabic"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
const HEIGHT_OPTIONS = createHeightOptions();

export default function SignupProfilePage() {
  const router = useRouter();
  const { state, updateProfile, markProfileCompleted } = useSignup();
  const p = state.profile;
  const [error, setError] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [zipMessage, setZipMessage] = useState<string | null>(null);

  const headlineOptions = useMemo(
    () => createHeadlineOptions({ city: p.city, neighborhood: p.neighborhood, specialties: p.serviceCategories }),
    [p.city, p.neighborhood, p.serviceCategories],
  );

  const completionScore = getCompletionScore([
    p.tagline,
    p.bio,
    p.city,
    p.state,
    p.neighborhood,
    p.serviceCategories,
    p.sessionLengths,
    p.startingPrice,
    p.locationType,
    p.heightInches,
    p.weightLb,
    p.bodyType,
    p.mediaCompliance,
  ]);

  function toggleInArray(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  function applyZipLookup(zipValue: string) {
    const cleanedZip = zipValue.replace(/\D/g, "").slice(0, 5);
    updateProfile({ zipCode: cleanedZip });

    if (cleanedZip.length < 5) {
      setZipMessage(null);
      return;
    }

    // Try local cache first (instant)
    const cached = lookupZipArea(cleanedZip);
    if (cached) {
      updateProfile({
        city: cached.city,
        state: cached.state,
        neighborhood: cached.primaryNeighborhood,
        serviceAreaCities: cached.serviceAreaCities,
        landmarks: cached.landmarks,
        locationDescription: `${cached.primaryNeighborhood} area near ${cached.landmarks.slice(0, 2).join(" and ")}`,
      });
      setZipMessage(`Auto filled: ${cached.primaryNeighborhood}, ${cached.city}, ${cached.state}`);
      return;
    }

    // Fall back to free API for any US ZIP
    setZipMessage("Looking up ZIP code…");
    fetchZipByCode(cleanedZip).then((result) => {
      if (result) {
        updateProfile({ city: result.city, state: result.stateAbbr });
        setZipMessage(`Auto filled: ${result.city}, ${result.stateAbbr}`);
      } else {
        setZipMessage("ZIP not found — enter city and state manually.");
      }
    });
  }

  function applyBioSuggestion() {
    const city = p.city || "my area";
    const services = p.serviceCategories.length ? p.serviceCategories.slice(0, 3).join(", ") : "professional massage";
    const years = p.yearsExperience ? `with ${p.yearsExperience} years of hands on experience` : "with a client focused approach";

    updateProfile({
      bio: `I provide ${services} in ${city}, ${years}. My sessions are designed around clear communication, professional boundaries, and a calm massage experience that helps clients relax, recover, and feel cared for. Clients can expect a clean setup, attentive pressure, and a respectful environment from start to finish.`,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!p.tagline.trim()) { setError("Headline is required."); return; }
    if (!p.bio.trim()) { setError("Profile description is required."); return; }
    if (!p.zipCode.trim() && (!p.city.trim() || !p.state.trim())) { setError("Add a ZIP code or enter city and state manually."); return; }
    if (p.serviceCategories.length === 0) { setError("Select at least one massage service."); return; }
    if (p.sessionLengths.length === 0) { setError("Select at least one session length."); return; }
    if (!p.startingPrice.trim()) { setError("Starting price is required."); return; }
    if (!p.locationType) { setError("Select incall, outcall, or both."); return; }
    if (!p.mediaCompliance) { setError("Confirm the profile and photo rules before continuing."); return; }

    markProfileCompleted();
    router.push("/signup/review");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Create a Standout Public Profile</h1>
          <p className="mt-3 text-muted-foreground">Use smart autofill, SEO ready headline presets, and clear compliance prompts to build a profile clients can trust.</p>
        </div>
        <Card className="border-brand-secondary/20 bg-brand-secondary/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Profile strength</span>
              <Badge variant="outline">{completionScore}%</Badge>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-brand-secondary transition-all" style={{ width: `${completionScore}%` }} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">More complete profiles usually earn better local discovery and higher client trust.</p>
          </CardContent>
        </Card>
      </div>

      {rulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Profile and Photo Rules</h2>
                  <p className="mt-1 text-sm text-muted-foreground">These rules protect the marketplace, improve approval speed, and keep profiles clean for search engines.</p>
                </div>
                <Button type="button" variant="outline" onClick={() => setRulesOpen(false)}>Close</Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold"><Info className="h-4 w-4" /> Profile description</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">{PROFILE_RULES.map((rule) => <li key={rule}>{rule}</li>)}</ul>
                </div>
                <div className="rounded-2xl border border-border/70 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold"><Camera className="h-4 w-4" /> Photos</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">{PHOTO_RULES.map((rule) => <li key={rule}>{rule}</li>)}</ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-brand-secondary"><User className="h-5 w-5" /><h2 className="font-display text-lg font-semibold text-foreground">SEO Profile Basics</h2></div>
              <Button type="button" variant="outline" onClick={() => setRulesOpen(true)}><AlertCircle className="mr-2 h-4 w-4" /> View Rules</Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">SEO Headline *</Label>
              <Input id="tagline" value={p.tagline} onChange={(e) => updateProfile({ tagline: e.target.value })} placeholder="Professional massage therapist serving your area" maxLength={120} />
              <div className="flex flex-wrap gap-2 pt-2">
                {headlineOptions.map((headline) => (
                  <button key={headline} type="button" onClick={() => updateProfile({ tagline: headline })} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-muted-foreground transition hover:border-brand-secondary hover:text-brand-secondary">
                    <Sparkles className="mr-1 inline h-3 w-3" /> {headline}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="bio">Profile Description *</Label>
                <Button type="button" variant="outline" size="sm" onClick={applyBioSuggestion}><Sparkles className="mr-2 h-4 w-4" /> Generate Clean Draft</Button>
              </div>
              <Textarea id="bio" value={p.bio} onChange={(e) => updateProfile({ bio: e.target.value })} placeholder="Describe your experience, massage style, pressure, setup, services, and what clients can expect." maxLength={1200} rows={7} />
              <p className="text-xs text-muted-foreground">{p.bio.length}/1200. Keep it professional, local, and focused on massage services.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="yearsExperience">Years of Experience</Label><Input id="yearsExperience" type="number" min="0" max="50" value={p.yearsExperience} onChange={(e) => updateProfile({ yearsExperience: e.target.value })} placeholder="5" /></div>
              <div className="space-y-2"><Label htmlFor="education">Training</Label><Input id="education" value={p.education} onChange={(e) => updateProfile({ education: e.target.value })} placeholder="Massage school or training" /></div>
              <div className="space-y-2"><Label htmlFor="certifications">Certifications</Label><Input id="certifications" value={p.certifications} onChange={(e) => updateProfile({ certifications: e.target.value })} placeholder="LMT, CPR, NCTMB" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center gap-2 text-brand-secondary"><MapPin className="h-5 w-5" /><h2 className="font-display text-lg font-semibold text-foreground">Location Autofill</h2></div>
            <div className="grid gap-4 sm:grid-cols-[180px_1fr_120px]">
              <div className="space-y-2"><Label htmlFor="zipCode">ZIP Code</Label><Input id="zipCode" inputMode="numeric" maxLength={5} value={p.zipCode} onChange={(e) => applyZipLookup(e.target.value)} placeholder="10001" /></div>
              <div className="space-y-2"><Label>Auto Filled Area</Label><div className="flex h-12 items-center rounded-xl border border-border/90 bg-bg-subtle/40 px-4 text-sm text-muted-foreground"><Search className="mr-2 h-4 w-4" /> {zipMessage || "Enter a ZIP code to auto fill city, state, neighborhood, landmarks, and service area."}</div></div>
              <div className="space-y-2"><Label htmlFor="state">State *</Label><select id="state" value={p.state} onChange={(e) => updateProfile({ state: e.target.value })} className="flex h-12 w-full rounded-xl border border-border/90 bg-white px-4 py-2 text-sm"><option value="">State</option>{US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="city">City *</Label><Input id="city" value={p.city} onChange={(e) => updateProfile({ city: e.target.value })} placeholder="New York" /></div>
              <div className="space-y-2"><Label htmlFor="neighborhood">Neighborhood or Area</Label><Input id="neighborhood" value={p.neighborhood} onChange={(e) => updateProfile({ neighborhood: e.target.value })} placeholder="Chelsea (optional)" /></div>
              <div className="space-y-2"><Label htmlFor="locationDescription">Location Note</Label><Input id="locationDescription" value={p.locationDescription} onChange={(e) => updateProfile({ locationDescription: e.target.value })} placeholder="Near major hotels or landmarks" /></div>
            </div>
            {(p.serviceAreaCities.length > 0 || p.landmarks.length > 0) && (
              <div className="flex flex-wrap gap-2">{[...p.serviceAreaCities, ...p.landmarks].slice(0, 10).map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center gap-2 text-brand-secondary"><BadgeCheck className="h-5 w-5" /><h2 className="font-display text-lg font-semibold text-foreground">Services, Pricing, and Body Details</h2></div>
            <div className="space-y-2"><Label>Massage Services *</Label><div className="flex flex-wrap gap-2">{SERVICE_OPTIONS.map((cat) => <button key={cat} type="button" onClick={() => updateProfile({ serviceCategories: toggleInArray(p.serviceCategories, cat) })} className={`rounded-full border px-3 py-1.5 text-sm transition ${p.serviceCategories.includes(cat) ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary" : "border-border bg-white text-muted-foreground hover:border-border-strong"}`}>{p.serviceCategories.includes(cat) && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}{cat}</button>)}</div></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Session Lengths *</Label><div className="flex flex-wrap gap-2">{SESSION_LENGTHS.map((len) => <button key={len} type="button" onClick={() => updateProfile({ sessionLengths: toggleInArray(p.sessionLengths, len) })} className={`rounded-full border px-3 py-1.5 text-sm ${p.sessionLengths.includes(len) ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary" : "border-border bg-white text-muted-foreground"}`}>{len}</button>)}</div></div>
              <div className="space-y-2"><Label htmlFor="startingPrice">Starting Price *</Label><div className="relative"><DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="startingPrice" type="number" min="0" value={p.startingPrice} onChange={(e) => updateProfile({ startingPrice: e.target.value })} placeholder="150" className="pl-9" /></div></div>
              <div className="space-y-2"><Label>Location Type *</Label><div className="flex flex-wrap gap-2">{(["incall", "outcall", "both"] as const).map((type) => <button key={type} type="button" onClick={() => updateProfile({ locationType: type })} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${p.locationType === type ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary" : "border-border bg-white text-muted-foreground"}`}>{type === "incall" ? "Incall" : type === "outcall" ? "Outcall" : "Both"}</button>)}</div></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="heightInches"><Ruler className="mr-1 inline h-4 w-4" /> Height</Label><select id="heightInches" value={p.heightInches} onChange={(e) => updateProfile({ heightInches: e.target.value })} className="flex h-12 w-full rounded-xl border border-border/90 bg-white px-4 py-2 text-sm"><option value="">Select height</option>{HEIGHT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
              <div className="space-y-2"><Label htmlFor="weightLb"><Scale className="mr-1 inline h-4 w-4" /> Weight</Label><Input id="weightLb" type="number" min="80" max="450" value={p.weightLb} onChange={(e) => updateProfile({ weightLb: e.target.value })} placeholder="180 lb" /><p className="text-xs text-muted-foreground">{poundsToKilogramsLabel(p.weightLb)}</p></div>
              <div className="space-y-2"><Label htmlFor="bodyType">Body Type</Label><select id="bodyType" value={p.bodyType} onChange={(e) => updateProfile({ bodyType: e.target.value })} className="flex h-12 w-full rounded-xl border border-border/90 bg-white px-4 py-2 text-sm"><option value="">Select body type</option>{BODY_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
            </div>
            <div className="space-y-2"><Label>Languages</Label><div className="flex flex-wrap gap-2">{LANGUAGE_OPTIONS.map((language) => <button key={language} type="button" onClick={() => updateProfile({ languages: toggleInArray(p.languages, language) })} className={`rounded-full border px-3 py-1.5 text-sm ${p.languages.includes(language) ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary" : "border-border bg-white text-muted-foreground"}`}>{language}</button>)}</div></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2 text-brand-secondary"><Camera className="h-5 w-5" /><h2 className="font-display text-lg font-semibold text-foreground">Photos and Compliance</h2></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="profilePhoto">Profile Photo</Label><Input id="profilePhoto" type="file" accept="image/*" onChange={(e) => updateProfile({ profilePhoto: e.target.files?.[0] ?? null })} /></div><div className="space-y-2"><Label htmlFor="galleryPhotos">Gallery Photos</Label><Input id="galleryPhotos" type="file" accept="image/*" multiple onChange={(e) => updateProfile({ galleryPhotos: e.target.files ? Array.from(e.target.files) : [] })} /></div></div>
            <div className="rounded-xl border border-border/60 bg-bg-subtle/30 p-4"><div className="flex items-start gap-3"><Checkbox id="mediaCompliance" checked={p.mediaCompliance} onCheckedChange={(v) => updateProfile({ mediaCompliance: v === true })} /><Label htmlFor="mediaCompliance" className="text-sm leading-snug">I confirm that my profile and photos follow MasseurMatch rules, are professional, accurate, and appropriate for a massage directory.</Label></div></div>
            <div className="rounded-xl border border-brand-secondary/20 bg-brand-secondary/5 p-4 text-sm text-muted-foreground"><strong className="text-foreground">Auto SEO preview:</strong> {buildSeoDescription({ displayName: state.displayName || state.fullName, city: p.city, neighborhood: p.neighborhood, specialties: p.serviceCategories })}</div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">Continue to Review</Button>
      </form>
    </div>
  );
}
