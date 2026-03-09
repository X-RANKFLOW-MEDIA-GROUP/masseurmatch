import { useState, useEffect } from "react";
import { ImportedReviewsManager } from "@/components/dashboard/ImportedReviews";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Save, AlertTriangle, Sparkles, MapPin, Ruler, CalendarIcon, Phone, Mail, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SPECIALTIES_OPTIONS = [
  "Relaxation Massage", "Therapeutic Massage", "Sports Massage",
  "Shiatsu", "Reflexology", "Lymphatic Drainage", "Tantric Massage",
  "Thai Massage", "Hot Stones", "Aromatherapy", "Chiropractic",
];

const LANGUAGES_OPTIONS = ["Portuguese", "English", "Spanish", "French", "German", "Italian"];

const BODY_TYPE_OPTIONS = ["Slim", "Athletic", "Average", "Muscular", "Stocky", "Large"];

// Generate height options from 4'8" to 7'0"
const HEIGHT_OPTIONS: { value: number; label: string }[] = [];
for (let inches = 56; inches <= 84; inches++) {
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  HEIGHT_OPTIONS.push({ value: inches, label: `${ft}'${rem}"` });
}

const DashboardProfile = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [newCert, setNewCert] = useState("");
  const [zipLoading, setZipLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    phone: "",
    zip_code: "",
    city: "",
    state: "",
    specialties: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
    presentation_video_url: "",
    social_media: { instagram: "", website: "", email: "", whatsapp: "" } as Record<string, string>,
    height_inches: null as number | null,
    body_type: null as string | null,
    date_of_birth: null as string | null,
    contact_methods: [] as string[],
    share_email: false,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        zip_code: (profile as any).zip_code || "",
        city: profile.city || "",
        state: profile.state || "",
        specialties: profile.specialties || [],
        certifications: profile.certifications || [],
        languages: profile.languages || [],
        presentation_video_url: profile.presentation_video_url || "",
        social_media: (profile.social_media as Record<string, string>) || { instagram: "", website: "", email: "", whatsapp: "" },
        height_inches: (profile as any).height_inches ?? null,
        body_type: (profile as any).body_type ?? null,
        date_of_birth: (profile as any).date_of_birth ?? null,
        contact_methods: (profile as any).contact_methods || [],
        share_email: (profile as any).share_email || false,
      });
    }
  }, [profile]);

  const lookupZip = async (zip: string) => {
    if (zip.length < 5) return;
    setZipLoading(true);
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (res.ok) {
        const data = await res.json();
        const place = data.places?.[0];
        if (place) {
          setForm((f) => ({
            ...f,
            city: place["place name"],
            state: place["state abbreviation"],
          }));
        }
      }
    } catch {
      // silently fail
    }
    setZipLoading(false);
  };

  const handleAiBio = async () => {
    if (!form.bio.trim()) {
      toast({ title: "Write something first", description: "Add a few lines about yourself and AI will polish it.", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-faq-answer", {
        body: {
          question: "Rewrite and improve this professional massage therapist bio. Keep the same meaning but make it more polished, professional and engaging. Return only the improved text, nothing else.",
          context: form.bio,
        },
      });
      if (data?.answer) {
        setForm((f) => ({ ...f, bio: data.answer }));
        toast({ title: "Bio enhanced!", description: "AI polished your bio. Review it before saving." });
      }
    } catch {
      toast({ title: "Error", description: "Could not enhance bio. Try again.", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const toggleItem = (field: "specialties" | "languages", item: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(item) ? f[field].filter((i) => i !== item) : [...f[field], item],
    }));
  };

  const handleSave = async () => {
    if (!user?.email && !form.phone) {
      toast({ title: "Error", description: "Email and phone are required.", variant: "destructive" });
      return;
    }
    if (!form.phone.trim()) {
      toast({ title: "Error", description: "Phone number is required.", variant: "destructive" });
      return;
    }
    setSaving(true);

    // Moderate bio text via SightEngine before saving
    if (form.bio.trim()) {
      try {
        const { data: textMod, error: modError } = await supabase.functions.invoke('moderate-text', {
          body: { profile_id: profile?.id, text: form.bio, field_name: 'bio' },
        });
        if (modError) {
          console.error('Text moderation error:', modError);
        } else if (textMod && !textMod.approved) {
          setSaving(false);
          toast({
            title: "Bio content flagged",
            description: textMod.reason || "Your bio contains content that violates our guidelines. Please revise it.",
            variant: "destructive",
          });
          return;
        }
      } catch (err) {
        console.error('Text moderation failed:', err);
      }
    }

    const { error } = await updateProfile({
      display_name: form.display_name || null,
      bio: form.bio || null,
      phone: form.phone || null,
      city: form.city || null,
      state: form.state || null,
      specialties: form.specialties,
      certifications: form.certifications,
      languages: form.languages,
      presentation_video_url: form.presentation_video_url || null,
      social_media: form.social_media,
      height_inches: form.height_inches,
      body_type: form.body_type,
      date_of_birth: form.date_of_birth,
      contact_methods: form.contact_methods,
      share_email: form.share_email,
    } as any);
    setSaving(false);
    toast({
      title: error ? "Error saving" : "Profile updated",
      description: error?.message || "Your changes have been saved. Your profile is now under review.",
      variant: error ? "destructive" : "default",
    });
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-40 bg-muted rounded" /></div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Edit your professional information</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </div>

      {/* Re-approval warning */}
      <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Changes require re-approval</p>
          <p className="text-xs text-muted-foreground">Saving changes to your profile will send it back for admin review before it goes live again.</p>
        </div>
      </div>

      {profile?.status === "pending_approval" && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
          <Loader2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Profile under review</p>
            <p className="text-xs text-muted-foreground">Your profile is currently being reviewed by our team.</p>
          </div>
        </div>
      )}

      {/* Contact Info - Required */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Email <span className="text-destructive">*</span></Label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">Linked to your account</p>
          </div>
          <div>
            <Label>Phone <span className="text-destructive">*</span></Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+1 555 123 4567"
              required
            />
          </div>
        </div>
      </section>

      {/* Contact Preferences */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Phone className="w-4 h-4" /> Contact Preferences
        </h2>
        <p className="text-xs text-muted-foreground">Choose how clients can reach you. All contact info is hidden by default — clients must click to reveal.</p>

        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Accepted Contact Methods</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "call", label: "Phone Call", icon: Phone },
              { value: "text", label: "Text / SMS", icon: MessageSquare },
              { value: "email", label: "Email", icon: Mail },
              { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
            ].map(({ value, label, icon: Icon }) => (
              <label key={value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                form.contact_methods.includes(value)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/30"
              }`}>
                <Checkbox
                  checked={form.contact_methods.includes(value)}
                  onCheckedChange={(checked) => {
                    setForm((f) => ({
                      ...f,
                      contact_methods: checked
                        ? [...f.contact_methods, value]
                        : f.contact_methods.filter((m) => m !== value),
                    }));
                  }}
                />
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">If none selected, Call and WhatsApp will be shown by default.</p>
        </div>

        {form.contact_methods.includes("email") && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.share_email}
                onCheckedChange={(v) => setForm((f) => ({ ...f, share_email: v }))}
              />
              <div>
                <Label className="text-sm">Share email on profile</Label>
                <p className="text-xs text-muted-foreground">Display your contact email publicly (click-to-reveal)</p>
              </div>
            </div>
            {form.share_email && (
              <div>
                <Label>Contact Email</Label>
                <Input
                  value={form.social_media.email || ""}
                  onChange={(e) => setForm((f) => ({ ...f, social_media: { ...f.social_media, email: e.target.value } }))}
                  placeholder={user?.email || "your@email.com"}
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to use your account email</p>
              </div>
            )}
          </div>
        )}

        {form.contact_methods.includes("whatsapp") && (
          <div className="pt-2 border-t border-border">
            <Label>WhatsApp Number</Label>
            <Input
              value={form.social_media.whatsapp || ""}
              onChange={(e) => setForm((f) => ({ ...f, social_media: { ...f.social_media, whatsapp: e.target.value } }))}
              placeholder="+1 555 123 4567"
            />
            <p className="text-xs text-muted-foreground mt-1">Include country code</p>
          </div>
        )}
      </section>

      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Zip Code</Label>
            <Input
              value={form.zip_code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                setForm((f) => ({ ...f, zip_code: val }));
                if (val.length === 5) lookupZip(val);
              }}
              placeholder="90210"
              maxLength={5}
            />
            {zipLoading && <p className="text-xs text-muted-foreground mt-1">Looking up...</p>}
          </div>
          <div>
            <Label>City</Label>
            <CityAutocomplete value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} placeholder="Los Angeles" />
          </div>
          <div>
            <Label>State</Label>
            <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="CA" />
          </div>
        </div>
      </section>

      {/* Basic */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Information</h2>
        <div>
          <Label>Display Name</Label>
          <Input value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} placeholder="How you want to be called" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>Professional Bio</Label>
            <Button type="button" variant="ghost" size="sm" onClick={handleAiBio} disabled={aiLoading} className="text-xs gap-1">
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI Enhance
            </Button>
          </div>
          <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell us about your experience and approach..." className="min-h-[120px]" />
          <p className="text-xs text-muted-foreground mt-1">Write freely, then use AI Enhance to polish your text.</p>
        </div>
      </section>

      {/* Specialties */}
      <section className="glass-card p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Specialties</h2>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES_OPTIONS.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => toggleItem("specialties", spec)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                form.specialties.includes(spec)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="glass-card p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Languages</h2>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES_OPTIONS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleItem("languages", lang)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                form.languages.includes(lang)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="glass-card p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Certifications</h2>
        <div className="flex gap-2">
          <Input value={newCert} onChange={(e) => setNewCert(e.target.value)} placeholder="Add certification..." onKeyDown={(e) => {
            if (e.key === "Enter" && newCert.trim()) {
              setForm((f) => ({ ...f, certifications: [...f.certifications, newCert.trim()] }));
              setNewCert("");
            }
          }} />
          <Button variant="outline" size="icon" onClick={() => { if (newCert.trim()) { setForm((f) => ({ ...f, certifications: [...f.certifications, newCert.trim()] })); setNewCert(""); } }}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.certifications.map((cert, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs bg-secondary border border-border flex items-center gap-1">
              {cert}
              <button onClick={() => setForm((f) => ({ ...f, certifications: f.certifications.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </section>

      {/* Physical Attributes */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Ruler className="w-4 h-4" /> Physical Attributes
        </h2>
        <p className="text-xs text-muted-foreground">Optional and self-reported. MasseurMatch does not verify this information.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Height</Label>
            <Select
              value={form.height_inches ? String(form.height_inches) : ""}
              onValueChange={(v) => setForm((f) => ({ ...f, height_inches: v ? Number(v) : null }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select height" />
              </SelectTrigger>
              <SelectContent>
                {HEIGHT_OPTIONS.map((h) => (
                  <SelectItem key={h.value} value={String(h.value)}>{h.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Body Type</Label>
            <Select
              value={form.body_type || ""}
              onValueChange={(v) => setForm((f) => ({ ...f, body_type: v || null }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                {BODY_TYPE_OPTIONS.map((bt) => (
                  <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.date_of_birth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.date_of_birth ? format(new Date(form.date_of_birth + "T00:00:00"), "PPP") : <span>Select date of birth</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.date_of_birth ? new Date(form.date_of_birth + "T00:00:00") : undefined}
                  onSelect={(date) => setForm((f) => ({ ...f, date_of_birth: date ? format(date, "yyyy-MM-dd") : null }))}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  captionLayout="dropdown-buttons"
                  fromYear={1940}
                  toYear={new Date().getFullYear() - 18}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1">Only your age will be displayed publicly, not the full date.</p>
          </div>
        </div>
      </section>

      {/* Social & Video */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Social Media & Video</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Instagram</Label>
            <Input value={form.social_media.instagram || ""} onChange={(e) => setForm((f) => ({ ...f, social_media: { ...f.social_media, instagram: e.target.value } }))} placeholder="@youruser" />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={form.social_media.website || ""} onChange={(e) => setForm((f) => ({ ...f, social_media: { ...f.social_media, website: e.target.value } }))} placeholder="https://..." />
          </div>
        </div>
        <div>
          <Label>Presentation Video (URL)</Label>
          <Input value={form.presentation_video_url} onChange={(e) => setForm((f) => ({ ...f, presentation_video_url: e.target.value }))} placeholder="https://youtube.com/..." />
        </div>
      </section>

      {/* Imported Reviews Section */}
      {profile?.id && (
        <section className="space-y-4 pt-6 border-t border-border">
          <h2 className="text-lg font-semibold">External Reviews</h2>
          <ImportedReviewsManager profileId={profile.id} />
        </section>
      )}
    </div>
  );
};

export default DashboardProfile;
