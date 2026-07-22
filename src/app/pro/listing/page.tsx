"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Banknote,
  Check,
  ChevronDown,
  Clock,
  GraduationCap,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ApiError, requestJson } from "@/app/_lib/request";
import { useToast } from "@/hooks/use-toast";
import { BODY_TYPE_OPTIONS, normalizeBodyTypeValue } from "@/lib/physical-profile";
import { lookupZipArea } from "@/lib/profile-autofill";

// ─────────────────────────────────────────────────────────────────────────
// Option lists (exact MasseurFinder strings)
// ─────────────────────────────────────────────────────────────────────────

const MASSAGE_TECHNIQUES = [
  "Acupressure", "Alexander Technique", "AMMA Therapy", "Anma", "Aromatherapy", "Ashiatsu",
  "Aston Patterning", "Ayurvedic", "Bhakti massage", "Breema", "British Sports",
  "Canadian Deep Muscle", "Chair massage", "Conscious Breathwork", "CranioSacral Therapy",
  "Deep Tissue", "Esalen", "Feldenkrais Method", "Hakomi", "Hellerwork", "Hot Stone",
  "Jin Shin Do", "Jin Shin Jyutsu", "Lomi Lomi", "Lymphatic Drainage", "Myofascial Release",
  "Neuromuscular", "Ortho-Bionomy", "Orthopedic", "Pfrimmer", "Polarity Therapy",
  "Prenatal and Postnatal", "Reflexology", "Reiki", "Rolfing", "Rosen Method",
  "Sensory Repatterning", "Shiatsu", "Soma Neuromuscular Integration", "Sports", "Steam Massage",
  "Swedish", "Tandem", "Tandem Massage", "Thai", "Thai Herbal", "Trager Integration",
  "Trigger Point", "Tui Na", "Watsu", "Zero Balancing",
];

const MASSAGE_SETUP = ["On a table", "On the floor", "On a mat", "Ask me for details"];

const MOBILE_EXTRAS = [
  "Aromatherapy Enhanced", "Candles", "Heated Massage Table", "Hot Towels", "Massage Table", "Music",
];

const ADDITIONAL_SERVICES = [
  "Acupuncture", "Body scrubs", "Body trimming", "Colonic cleansing", "Cupping", "Facials",
  "Fitness training", "Hair styling", "Hydrotherapy", "Manicures", "Meditation coaching",
  "Mud treatments", "Nutrition consulting", "Pedicures", "Personal coaching", "Personal training",
  "Physical therapy", "Waxing", "Yoga instruction",
];

const STUDIO_AMENITIES = [
  "Aromatherapy Enhanced", "Bottled Water", "Candles", "Drinking Water", "Free Parking",
  "Fully Handicapped Accessible", "Heated Massage Table", "Hot Towels", "Massage Table",
  "Metered Parking", "Music", "Pool", "Private Parking", "Private Restroom", "Sauna",
  "Secured Entrance/Doorman", "Shower", "Soft Drinks", "Spa/Hot Tub", "Tea", "Wine",
];

const PRODUCTS = [
  "Alba Botanica Lotion", "Aroma Vera Massage Lotion", "Aroma Vera Massage Oil",
  "Ask me for details", "Aura Care Massage Cream/Lotion", "AVEDA massage lotion/oil", "Biofreeze",
  "Biotone Massage Creme/Gel/Lotion/Oil", "Deep tissue massage lotion/cream", "Earthlite Massage Oil",
  "Heated lotion", "Heated oil", "Kiehl's Body Lotion", "Kiehl's Massage Oil", "Lotus Touch Lotion",
  "Massage cream", "Massage FX Cream/Lotion/Oil", "Massage gel", "Massage lotion", "Massage oil",
  "None", "Santa Barbara Massage Cream", "Soothing Touch Massage Cream/Lotion/Oil",
  "Therapro Massage Lotion/Oil", "Various",
];

const REGULAR_DISCOUNTS = [
  "active military", "law enforcement", "repeat clients", "ask for details", "first-time clients",
  "military veterans", "students", "dancers", "entertainment industry", "massage therapists",
  "senior citizens", "bodybuilders", "SAG/Equity members", "visiting clients",
  "AIDS ride participants", "birthdays", "emergency workers", "airline crews",
];

const RATE_DISCLAIMERS = [
  "Longer sessions available",
  "Amounts listed are base rates only. Actual rates vary based on distance travelled services provided etc.",
  "Ask about discounts for prepaid bodywork packages",
  "Gift certificates available",
];

const PAYMENT_METHODS = [
  "American Express", "Apple Pay", "Barter", "Bitcoin", "Cash", "Check", "Dash", "Discover", "Ether",
  "Google Wallet", "Mastercard", "Paypal", "QuickPay", "Ripple", "Samsung Pay", "Square Cash",
  "Venmo", "Visa", "Zelle",
];

const LANGUAGES = [
  "Afrikaans", "Arabic", "Czech", "Danish", "English", "Estonian", "Finnish", "French", "German",
  "Greek", "Hebrew", "Hungarian", "Italian", "Japanese", "Norwegian", "Polish", "Portuguese",
  "Romanian", "Russian", "Spanish", "Swedish", "Turkish",
];

const AFFILIATIONS = [
  "American College of Sports Medicine", "American Massage Therapy Association",
  "American Organization for Bodywork Therapies of Asia", "American Spa Association",
  "Associated Bodywork and Massage Professionals", "Esalen Massage and Bodywork Association",
  "Massage Association of Australia", "National Association of Massage Therapists",
  "National Association of Pregnancy Massage Therapy",
  "National Certification Board for Therapeutic Massage & Bodywork",
];

const HEADLINE_PRESETS = [
  "At-Home Massage", "Bodhi Healing", "Bodhi Massage", "Body Renewal", "Body+Spirit Healing",
  "Calming Bodywork", "Calming Massage", "Caring Bodywork", "Chi Balancing", "Clinical Bodywork",
  "Clinical Massage", "Comforting Massage", "Customized Massage", "Elevating Bodywork",
  "Elevating Massage", "Energetic Healing", "Energy Bodywork", "Energy Healing", "Energy Massage",
  "Energy Work", "Enlightened Massage", "Enlightening Massage", "Expert Massage",
  "Healing & Tranquility", "Healing Arts", "Healing Bodywork", "Higher Self Massage",
  "Holistic Healing", "Intuitive Bodywork", "Knot-busting", "Male Massage", "Massage & Yoga",
  "Massage Arts", "Massage Bliss", "Massage Rejuvenation", "Massage Therapy", "Masterful Massage",
  "Medical Massage", "Mind+Body Massage", "Mobile Day Spa", "Mobile Massage", "Neonatal Massage",
  "Pain Relief", "Pampering Massage", "Professional Relaxation", "Quantum Relaxation",
  "Rejuvenating Massage", "Revitalizing Massage", "Revitalizing Touch", "Sacred Massage",
  "Seasoned Bodywork", "Shamanistic Massage", "Soma Rejuvenation", "Spa at Home", "Sports Massage",
  "Sports Recovery", "Staycation Massage", "Stress Relief", "The Art of Massage", "The Art of Touch",
  "Therapeutic Healing", "Therapeutic Massage", "Therapeutic Touch", "Tranquil Touch",
  "Transformative Touch", "Yogic Bodywork", "Yogic Massage", "Zen Bodywork", "Zen Massage",
  "Zen Retreat",
];

const DISCOUNT_PERCENTS = [10, 20, 30, 40, 50];
const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS_DAYS = [
  "Every day", "Weekdays", "Saturday & Sunday", "Friday–Sunday",
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];
const OUTCALL_RADII = [10, 20, 40, 80, 160, 240];

const CURRENT_STATUS_OPTIONS = [
  "Available", "Available now", "Booking ahead", "Limited availability", "Away", "Unavailable",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CLOCK_HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const CLOCK_MINUTES = ["00", "15", "30", "45"];

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

const CURRENT_YEAR = 2026;
const YEARS = Array.from({ length: 71 }, (_, i) => CURRENT_YEAR - i);

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

type PricingSession = { minutes: number; incall_rate: number | null; outcall_rate: number | null };
type EducationEntry = {
  degree: string;
  institution: string;
  location: string;
  start_month: number | null;
  start_year: number | null;
  end_month: number | null;
  end_year: number | null;
};
type HoursEntry = { days: string; start: string; end: string };
type MobileHours = { sameAsStudio: true } | HoursEntry[];
type DayDiscount = { percent: number; day: string } | null;

type ProfileRecord = {
  id?: string;
  profile_status?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  headline?: string | null;
  bio?: string | null;
  tagline?: string | null;
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  zip_code?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  email_address?: string | null;
  show_email?: boolean | null;
  website?: string | null;
  booking_url?: string | null;
  booking_platform?: string | null;
  offers_incall?: boolean | null;
  offers_outcall?: boolean | null;
  outcall_radius?: number | null;
  map_enabled?: boolean | null;
  massage_techniques?: string[] | null;
  service_categories?: string[] | null;
  specialties?: string[] | null;
  massage_setup?: string[] | null;
  mobile_extras?: string[] | null;
  additional_services?: string[] | null;
  studio_amenities?: string[] | null;
  products_used?: string[] | null;
  products_sold?: string[] | null;
  payment_methods?: string[] | null;
  languages?: string[] | null;
  affiliations?: string[] | null;
  rate_disclaimers?: string[] | null;
  regular_discounts?: string[] | null;
  pricing_sessions?: PricingSession[] | null;
  day_of_week_discount?: DayDiscount;
  education_entries?: EducationEntry[] | null;
  studio_hours?: HoursEntry[] | null;
  mobile_hours?: MobileHours | null;
  start_date?: string | null;
  years_experience?: number | null;
  height_inches?: number | null;
  weight_lb?: number | null;
  body_type?: string | null;
  available_now?: boolean | null;
  available_now_expires?: string | null;
  current_status?: string | null;
  lgbtq_affirming?: boolean | null;
};

type ProfileResponse = { ok: boolean; profile: ProfileRecord | null };

type FormState = {
  displayName: string;
  headlinePreset: string;
  bio: string;
  tagline: string;
  city: string;
  state: string;
  neighborhood: string;
  zipCode: string;
  street1: string;
  street2: string;
  phone: string;
  whatsapp: string;
  email: string;
  showEmail: boolean;
  website: string;
  bookingUrl: string;
  bookingPlatform: string;
  offersIncall: boolean;
  offersOutcall: boolean;
  outcallRadius: string;
  mapEnabled: boolean;
  massageTechniques: string[];
  massageSetup: string[];
  mobileExtras: string[];
  additionalServices: string[];
  studioAmenities: string[];
  productsUsed: string[];
  productsSold: string[];
  paymentMethods: string[];
  languages: string[];
  affiliations: string[];
  rateDisclaimers: string[];
  regularDiscounts: string[];
  pricingSessions: PricingSession[];
  dayDiscountPercent: string;
  dayDiscountDay: string;
  educationEntries: EducationEntry[];
  studioHours: HoursEntry[];
  mobileSameAsStudio: boolean;
  mobileHours: HoursEntry[];
  startMonth: string;
  startYear: string;
  yearsExperience: string;
  heightInches: string;
  weightLb: string;
  bodyType: string;
  availableNow: boolean;
  currentStatus: string;
  lgbtqAffirming: boolean;
};

type SaveState = "idle" | "saving" | "success" | "error";

const EMPTY_FORM: FormState = {
  displayName: "",
  headlinePreset: "",
  bio: "",
  tagline: "",
  city: "",
  state: "",
  neighborhood: "",
  zipCode: "",
  street1: "",
  street2: "",
  phone: "",
  whatsapp: "",
  email: "",
  showEmail: false,
  website: "",
  bookingUrl: "",
  bookingPlatform: "",
  offersIncall: true,
  offersOutcall: true,
  outcallRadius: "",
  mapEnabled: false,
  massageTechniques: [],
  massageSetup: [],
  mobileExtras: [],
  additionalServices: [],
  studioAmenities: [],
  productsUsed: [],
  productsSold: [],
  paymentMethods: [],
  languages: [],
  affiliations: [],
  rateDisclaimers: [],
  regularDiscounts: [],
  pricingSessions: [],
  dayDiscountPercent: "",
  dayDiscountDay: "",
  educationEntries: [],
  studioHours: [],
  mobileSameAsStudio: false,
  mobileHours: [],
  startMonth: "",
  startYear: "",
  yearsExperience: "",
  heightInches: "",
  weightLb: "",
  bodyType: "",
  availableNow: false,
  currentStatus: "",
  lgbtqAffirming: false,
};

// ─────────────────────────────────────────────────────────────────────────
// Mapping helpers
// ─────────────────────────────────────────────────────────────────────────

function deriveHeadlinePreset(headline: string | null | undefined, displayName: string): string {
  if (!headline) return "";
  const suffix = ` by ${displayName}`;
  let base = headline.trim();
  if (displayName && base.endsWith(suffix)) base = base.slice(0, -suffix.length);
  const match = HEADLINE_PRESETS.find((p) => p === base);
  return match ?? "";
}

function parseStartDate(value: string | null | undefined): { month: string; year: string } {
  if (!value) return { month: "", year: "" };
  const [y, m] = value.split("-");
  return { month: m ? String(Number(m)) : "", year: y ?? "" };
}

function mapProfileToForm(profile: ProfileRecord | null | undefined): FormState {
  if (!profile) return EMPTY_FORM;
  const displayName = profile.display_name || profile.full_name || "";
  const start = parseStartDate(profile.start_date);
  const mobile = profile.mobile_hours;
  const mobileSameAsStudio = !!mobile && !Array.isArray(mobile) && mobile.sameAsStudio === true;
  return {
    displayName,
    headlinePreset: deriveHeadlinePreset(profile.headline, displayName),
    bio: profile.bio || "",
    tagline: profile.tagline || "",
    city: profile.city || "",
    state: profile.state || "",
    neighborhood: profile.neighborhood || "",
    zipCode: profile.zip_code || "",
    street1: "",
    street2: "",
    phone: profile.phone || "",
    whatsapp: profile.whatsapp_number || "",
    email: profile.email_address || "",
    showEmail: profile.show_email ?? false,
    website: profile.website || "",
    bookingUrl: profile.booking_url || "",
    bookingPlatform: profile.booking_platform || "",
    offersIncall: profile.offers_incall ?? true,
    offersOutcall: profile.offers_outcall ?? true,
    outcallRadius: typeof profile.outcall_radius === "number" ? String(profile.outcall_radius) : "",
    mapEnabled: profile.map_enabled ?? false,
    massageTechniques: profile.massage_techniques || [],
    massageSetup: profile.massage_setup || [],
    mobileExtras: profile.mobile_extras || [],
    additionalServices: profile.additional_services || [],
    studioAmenities: profile.studio_amenities || [],
    productsUsed: profile.products_used || [],
    productsSold: profile.products_sold || [],
    paymentMethods: profile.payment_methods || [],
    languages: profile.languages || [],
    affiliations: profile.affiliations || [],
    rateDisclaimers: profile.rate_disclaimers || [],
    regularDiscounts: Array.isArray(profile.regular_discounts) ? profile.regular_discounts : [],
    pricingSessions: Array.isArray(profile.pricing_sessions) ? profile.pricing_sessions : [],
    dayDiscountPercent: profile.day_of_week_discount?.percent ? String(profile.day_of_week_discount.percent) : "",
    dayDiscountDay: profile.day_of_week_discount?.day || "",
    educationEntries: Array.isArray(profile.education_entries) ? profile.education_entries : [],
    studioHours: Array.isArray(profile.studio_hours) ? profile.studio_hours : [],
    mobileSameAsStudio,
    mobileHours: Array.isArray(mobile) ? mobile : [],
    startMonth: start.month,
    startYear: start.year,
    yearsExperience: typeof profile.years_experience === "number" ? String(profile.years_experience) : "",
    heightInches: typeof profile.height_inches === "number" ? String(profile.height_inches) : "",
    weightLb: typeof profile.weight_lb === "number" ? String(profile.weight_lb) : "",
    bodyType: normalizeBodyTypeValue(profile.body_type) || "",
    availableNow: profile.available_now ?? false,
    currentStatus: profile.current_status || "",
    lgbtqAffirming: profile.lgbtq_affirming ?? false,
  };
}

function parseInt0(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
}

function buildPayload(form: FormState) {
  const headline = form.headlinePreset
    ? `${form.headlinePreset}${form.displayName ? ` by ${form.displayName}` : ""}`
    : null;

  const dayOfWeekDiscount: DayDiscount =
    form.dayDiscountPercent && form.dayDiscountDay
      ? { percent: Number(form.dayDiscountPercent), day: form.dayDiscountDay }
      : null;

  const startDate =
    form.startYear && form.startMonth
      ? `${form.startYear}-${String(Number(form.startMonth)).padStart(2, "0")}`
      : null;

  const mobileHours: MobileHours = form.mobileSameAsStudio
    ? { sameAsStudio: true }
    : form.mobileHours;

  return {
    displayName: form.displayName.trim(),
    headline,
    bio: form.bio || null,
    tagline: form.tagline || null,
    city: form.city || null,
    state: form.state || null,
    neighborhood: form.neighborhood || null,
    zipCode: form.zipCode || null,
    phone: form.phone || null,
    whatsapp: form.whatsapp || null,
    email: form.email || null,
    showEmail: form.showEmail,
    website: form.website || null,
    bookingUrl: form.bookingUrl || null,
    bookingPlatform: form.bookingPlatform || null,
    offersIncall: form.offersIncall,
    offersOutcall: form.offersOutcall,
    outcallRadius: parseInt0(form.outcallRadius),
    mapEnabled: form.mapEnabled,
    massageTechniques: form.massageTechniques,
    serviceCategories: form.massageTechniques,
    specialties: form.massageTechniques.slice(0, 12),
    massageSetup: form.massageSetup,
    mobileExtras: form.mobileExtras,
    additionalServices: form.additionalServices,
    studioAmenities: form.studioAmenities,
    productsUsed: form.productsUsed,
    productsSold: form.productsSold,
    paymentMethods: form.paymentMethods,
    languages: form.languages,
    affiliations: form.affiliations,
    rateDisclaimers: form.rateDisclaimers,
    regularDiscounts: form.regularDiscounts,
    pricingSessions: form.pricingSessions,
    dayOfWeekDiscount,
    educationEntries: form.educationEntries,
    studioHours: form.studioHours,
    mobileHours,
    startDate,
    yearsExperience: parseInt0(form.yearsExperience),
    heightInches: parseInt0(form.heightInches),
    weightLb: parseInt0(form.weightLb),
    bodyType: normalizeBodyTypeValue(form.bodyType),
    availableNow: form.availableNow,
    currentStatus: form.currentStatus || null,
    lgbtqAffirming: form.lgbtqAffirming,
  };
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// ─────────────────────────────────────────────────────────────────────────
// UI primitives
// ─────────────────────────────────────────────────────────────────────────

function inputCls(extra = "") {
  return `w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 ${extra}`;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function Accordion({
  id,
  icon: Icon,
  title,
  subtitle,
  count,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: typeof User;
  title: string;
  subtitle: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <Icon className="h-[1.1rem] w-[1.1rem] text-slate-600" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="truncate text-xs text-slate-500">{subtitle}</p>
        </div>
        {typeof count === "number" && count > 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{count}</span>
        )}
        <ChevronDown
          className={`h-[1.1rem] w-[1.1rem] shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>
      {open && <div className="space-y-5 p-5">{children}</div>}
    </section>
  );
}

function ChipGrid({
  options,
  selected,
  onToggle,
  columns = 3,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: 2 | 3 | 4;
}) {
  const colCls = columns === 4 ? "sm:grid-cols-4" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 gap-2 ${colCls}`}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all ${
              active
                ? "border-primary bg-primary/10 text-slate-900"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                active ? "border-primary bg-primary text-white" : "border-slate-300 bg-white"
              }`}
            >
              {active && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className="leading-tight">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm font-medium text-slate-700"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

function parseTime(value: string): { hour: string; minute: string; meridiem: string } {
  const m = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) return { hour: m[1], minute: m[2], meridiem: m[3].toUpperCase() };
  return { hour: "9", minute: "00", meridiem: "AM" };
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { hour, minute, meridiem } = parseTime(value);
  const emit = (h: string, mn: string, mer: string) => onChange(`${h}:${mn} ${mer}`);
  return (
    <div className="flex gap-1.5">
      <select className={inputCls("px-2")} value={hour} onChange={(e) => emit(e.target.value, minute, meridiem)}>
        {CLOCK_HOURS.map((h) => <option key={h} value={String(h)}>{h}</option>)}
      </select>
      <select className={inputCls("px-2")} value={minute} onChange={(e) => emit(hour, e.target.value, meridiem)}>
        {CLOCK_MINUTES.map((mn) => <option key={mn} value={mn}>{mn}</option>)}
      </select>
      <select className={inputCls("px-2")} value={meridiem} onChange={(e) => emit(hour, minute, e.target.value)}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

function HoursRows({
  rows,
  onChange,
}: {
  rows: HoursEntry[];
  onChange: (rows: HoursEntry[]) => void;
}) {
  const update = (idx: number, patch: Partial<HoursEntry>) => {
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const remove = (idx: number) => onChange(rows.filter((_, i) => i !== idx));
  const add = () => onChange([...rows, { days: "Every day", start: "9:00 AM", end: "9:00 PM" }]);

  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div key={idx} className="grid items-end gap-2 sm:grid-cols-[1.3fr_1fr_1fr_auto]">
          <Field>
            <FieldLabel>Days</FieldLabel>
            <select className={inputCls()} value={row.days} onChange={(e) => update(idx, { days: e.target.value })}>
              {HOURS_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field>
            <FieldLabel>Opens</FieldLabel>
            <TimePicker value={row.start} onChange={(v) => update(idx, { start: v })} />
          </Field>
          <Field>
            <FieldLabel>Closes</FieldLabel>
            <TimePicker value={row.end} onChange={(v) => update(idx, { end: v })} />
          </Field>
          <button
            type="button"
            onClick={() => remove(idx)}
            className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:text-rose-500"
            aria-label="Remove hours row"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} /> Add hours
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  "about", "location", "services", "pricing", "schedule", "credentials",
] as const;
type SectionId = (typeof SECTIONS)[number];

const SECTION_META: Record<SectionId, { icon: typeof User; title: string; subtitle: string }> = {
  about: { icon: User, title: "About You", subtitle: "Name, headline, bio, and physical profile" },
  location: { icon: MapPin, title: "Location & Contact", subtitle: "Where you work and how clients reach you" },
  services: { icon: Heart, title: "Services", subtitle: "Techniques, setup, amenities, and products" },
  pricing: { icon: Banknote, title: "Rates & Payments", subtitle: "Session pricing, discounts, and payment methods" },
  schedule: { icon: Clock, title: "Schedule", subtitle: "Operating hours and availability status" },
  credentials: { icon: GraduationCap, title: "Credentials", subtitle: "Education, experience, languages, and affiliations" },
};

function computeProgress(form: FormState): { filled: number; total: number; sectionDone: Record<SectionId, boolean> } {
  const checks = {
    about: !!form.displayName.trim(),
    location: !!form.city && !!form.state,
    services: form.massageTechniques.length > 0,
    pricing: form.pricingSessions.length > 0 && form.paymentMethods.length > 0,
    schedule: form.studioHours.length > 0 || form.currentStatus !== "",
    credentials: form.yearsExperience !== "" || form.educationEntries.length > 0,
  };
  const filled = Object.values(checks).filter(Boolean).length;
  return { filled, total: SECTIONS.length, sectionDone: checks };
}

export default function MyListingPage() {
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [zipStatus, setZipStatus] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    about: true, location: false, services: false,
    pricing: false, schedule: false, credentials: false,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await requestJson<ProfileResponse>("/api/pro/profile");
        if (!cancelled) {
          setForm(mapProfileToForm(response.profile));
          setProfileStatus(response.profile?.profile_status ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Could not load your profile",
            description: getApiErrorMessage(error, "Try again in a moment."),
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [toast]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleArr(key: keyof FormState, value: string) {
    setForm((f) => {
      const arr = f[key] as string[];
      return {
        ...f,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function toggleSection(id: SectionId) {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  }

  function handleZipChange(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 5);
    set("zipCode", cleaned);
    if (cleaned.length < 5) { setZipStatus(null); return; }
    const cached = lookupZipArea(cleaned);
    if (cached) {
      setForm((f) => ({ ...f, city: cached.city, state: cached.state, neighborhood: f.neighborhood || cached.primaryNeighborhood }));
      setZipStatus(`${cached.city}, ${cached.state}`);
      return;
    }
    setZipStatus("Looking up…");
    fetch(`/api/zip-lookup?zip=${cleaned}`)
      .then((r) => r.json())
      .then((res: { city: string; state: string; stateAbbr: string } | null) => {
        if (res?.city) {
          setForm((f) => ({ ...f, city: res.city, state: res.stateAbbr }));
          setZipStatus(`${res.city}, ${res.stateAbbr}`);
        } else {
          setZipStatus("Not found — enter manually");
        }
      })
      .catch(() => setZipStatus("Not found — enter manually"));
  }

  // Pricing sessions
  const addSession = () =>
    set("pricingSessions", [...form.pricingSessions, { minutes: 60, incall_rate: null, outcall_rate: null }]);
  const updateSession = (idx: number, patch: Partial<PricingSession>) =>
    set("pricingSessions", form.pricingSessions.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const removeSession = (idx: number) =>
    set("pricingSessions", form.pricingSessions.filter((_, i) => i !== idx));

  // Education
  const addEducation = () =>
    set("educationEntries", [...form.educationEntries, {
      degree: "", institution: "", location: "",
      start_month: null, start_year: null, end_month: null, end_year: null,
    }]);
  const updateEducation = (idx: number, patch: Partial<EducationEntry>) =>
    set("educationEntries", form.educationEntries.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  const removeEducation = (idx: number) =>
    set("educationEntries", form.educationEntries.filter((_, i) => i !== idx));

  const headlinePreview = useMemo(() => {
    if (!form.headlinePreset) return "";
    return `${form.headlinePreset}${form.displayName ? ` by ${form.displayName}` : ""}`;
  }, [form.headlinePreset, form.displayName]);

  const handleSave = async () => {
    if (!form.displayName.trim()) {
      toast({ title: "Display name required", description: "Add your professional name before saving.", variant: "destructive" });
      setOpen((o) => ({ ...o, about: true }));
      return;
    }
    setSaveState("saving");
    try {
      const payload = buildPayload(form);
      const response = await requestJson<ProfileResponse>("/api/pro/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (response.profile) {
        setForm(mapProfileToForm(response.profile));
        setProfileStatus(response.profile.profile_status ?? profileStatus);
      }
      setSaveState("success");
      toast({ title: "Profile saved", description: "Your changes were saved and sent to the review queue." });
      window.setTimeout(() => setSaveState("idle"), 2800);
    } catch (error) {
      setSaveState("error");
      toast({ title: "Could not save", description: getApiErrorMessage(error, "Review your fields and try again."), variant: "destructive" });
      window.setTimeout(() => setSaveState("idle"), 2800);
    }
  };

  const progress = useMemo(() => computeProgress(form), [form]);

  function sectionCount(id: SectionId): number | undefined {
    switch (id) {
      case "services": return form.massageTechniques.length + form.massageSetup.length + form.additionalServices.length + form.studioAmenities.length;
      case "pricing": return form.pricingSessions.length + form.paymentMethods.length;
      case "credentials": return form.educationEntries.length + form.affiliations.length;
      default: return undefined;
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 pb-36 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Fill in the sections below — your profile is reviewed before going live.</p>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Profile completion</span>
          <span className="font-semibold text-primary">{progress.filled}/{progress.total} sections</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(progress.filled / progress.total) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SECTIONS.map((id) => {
            const meta = SECTION_META[id];
            const done = progress.sectionDone[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => { setOpen((o) => ({ ...o, [id]: true })); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  done
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : <meta.icon className="h-3 w-3" strokeWidth={2.25} />}
                {meta.title}
              </button>
            );
          })}
        </div>
      </div>

      {profileStatus === "under_review" || profileStatus === "pending_approval" ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={2.25} />
          Your profile is in the review queue. New edits follow the same process.
        </div>
      ) : null}

      {/* 1. About You — name, headline, bio, physical */}
      <Accordion id="about" icon={SECTION_META.about.icon} title={SECTION_META.about.title} subtitle={SECTION_META.about.subtitle} open={open.about} onToggle={() => toggleSection("about")}>
        <Field>
          <FieldLabel required>Display Name</FieldLabel>
          <input className={inputCls()} value={form.displayName} onChange={(e) => set("displayName", e.target.value)} placeholder="Professional name shown on your listing" />
        </Field>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Headline</p>
          {headlinePreview && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Preview</span>
              <p className="mt-1 font-display font-semibold text-slate-900">{headlinePreview}</p>
            </div>
          )}
          <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/40 p-3 sm:grid-cols-2">
            {HEADLINE_PRESETS.map((preset) => {
              const active = form.headlinePreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => set("headlinePreset", active ? "" : preset)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                    active ? "border-primary bg-primary/10 font-medium text-slate-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? "border-primary bg-primary text-white" : "border-slate-300"}`}>
                    {active && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  {preset}
                </button>
              );
            })}
          </div>
          <Field>
            <FieldLabel>Tagline (free text)</FieldLabel>
            <input className={inputCls()} maxLength={120} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Optional one-liner shown on your card" />
          </Field>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Bio</p>
          <Field>
            <textarea
              className={`${inputCls()} min-h-[140px] resize-none leading-relaxed`}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              maxLength={4000}
              placeholder="Share your experience, massage style, pressure preference, specialties, and what clients can expect..."
            />
            <p className="text-right text-xs text-slate-400">{form.bio.length}/4000</p>
          </Field>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Physical profile (optional)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel>Height (inches)</FieldLabel>
              <input type="number" min={36} max={96} className={inputCls()} value={form.heightInches} onChange={(e) => set("heightInches", e.target.value)} placeholder={`72 = 6'0"`} />
              {form.heightInches && (() => {
                const n = Number(form.heightInches);
                if (!n) return null;
                return <p className="text-xs text-slate-400">{`${Math.floor(n / 12)}'${n % 12}" / ${Math.round(n * 2.54)} cm`}</p>;
              })()}
            </Field>
            <Field>
              <FieldLabel>Weight (lb)</FieldLabel>
              <input type="number" min={60} max={600} className={inputCls()} value={form.weightLb} onChange={(e) => set("weightLb", e.target.value)} placeholder="180" />
              {form.weightLb && <p className="text-xs text-slate-400">{Math.round(Number(form.weightLb) * 0.453592)} kg</p>}
            </Field>
            <Field>
              <FieldLabel>Body Type</FieldLabel>
              <select className={inputCls()} value={form.bodyType} onChange={(e) => set("bodyType", e.target.value)}>
                <option value="">Select</option>
                {BODY_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </Accordion>

      {/* 2. Location & Contact */}
      <Accordion id="location" icon={SECTION_META.location.icon} title={SECTION_META.location.title} subtitle={SECTION_META.location.subtitle} open={open.location} onToggle={() => toggleSection("location")}>
        <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
          <Field>
            <FieldLabel>ZIP Code</FieldLabel>
            <input className={inputCls()} inputMode="numeric" maxLength={5} value={form.zipCode} onChange={(e) => handleZipChange(e.target.value)} placeholder="10001" />
            {zipStatus && <p className="text-xs text-slate-500">{zipStatus}</p>}
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel required>City</FieldLabel>
              <input className={inputCls()} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="New York" />
            </Field>
            <Field>
              <FieldLabel>State</FieldLabel>
              <select className={inputCls()} value={form.state} onChange={(e) => set("state", e.target.value)}>
                <option value="">State</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field>
              <FieldLabel>Neighborhood</FieldLabel>
              <input className={inputCls()} value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="Chelsea" />
            </Field>
          </div>
        </div>
        <Field>
          <FieldLabel>Street Intersection (optional)</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputCls()} value={form.street1} onChange={(e) => set("street1", e.target.value)} placeholder="e.g. 8th Avenue" />
            <input className={inputCls()} value={form.street2} onChange={(e) => set("street2", e.target.value)} placeholder="e.g. W 23rd Street" />
          </div>
          <p className="text-xs text-slate-400">Shown as a cross-street so clients know your general area.</p>
        </Field>

        <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <Toggle checked={form.offersIncall} onChange={(v) => set("offersIncall", v)} label="I offer incall (clients come to me)" />
          <Toggle checked={form.offersOutcall} onChange={(v) => set("offersOutcall", v)} label="I offer outcall (I travel to clients)" />
          <Toggle checked={form.mapEnabled} onChange={(v) => set("mapEnabled", v)} label="Show my location on the map" />
          {form.offersOutcall && (
            <Field>
              <FieldLabel>Outcall Radius (km)</FieldLabel>
              <select className={inputCls()} value={form.outcallRadius} onChange={(e) => set("outcallRadius", e.target.value)}>
                <option value="">Not set</option>
                {OUTCALL_RADII.map((r) => <option key={r} value={String(r)}>{r} km</option>)}
              </select>
            </Field>
          )}
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Contact info</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel required>Phone</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" strokeWidth={2.25} />
                <input className={inputCls("pl-10")} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
              </div>
            </Field>
            <Field>
              <FieldLabel>WhatsApp</FieldLabel>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-slate-400" strokeWidth={2.25} />
                <input className={inputCls("pl-10")} type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+1 555 000 0000" />
              </div>
            </Field>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <input className={inputCls()} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
              {form.email && (
                <Toggle checked={form.showEmail} onChange={(v) => set("showEmail", v)} label="Show email on my public profile" />
              )}
            </Field>
            <Field>
              <FieldLabel>Website</FieldLabel>
              <input className={inputCls()} type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yoursite.com" />
            </Field>
            <Field>
              <FieldLabel>Booking URL</FieldLabel>
              <input className={inputCls()} type="url" value={form.bookingUrl} onChange={(e) => set("bookingUrl", e.target.value)} placeholder="https://book.yoursite.com" />
            </Field>
            <Field>
              <FieldLabel>Booking Platform</FieldLabel>
              <input className={inputCls()} value={form.bookingPlatform} onChange={(e) => set("bookingPlatform", e.target.value)} placeholder="e.g. Calendly, Square, Acuity" />
            </Field>
          </div>
        </div>
      </Accordion>

      {/* 3. Services — techniques, setup, amenities, products */}
      <Accordion id="services" icon={SECTION_META.services.icon} title={SECTION_META.services.title} subtitle={SECTION_META.services.subtitle} count={sectionCount("services")} open={open.services} onToggle={() => toggleSection("services")}>
        <Field>
          <FieldLabel>Massage Techniques</FieldLabel>
          <ChipGrid options={MASSAGE_TECHNIQUES} selected={form.massageTechniques} onToggle={(v) => toggleArr("massageTechniques", v)} columns={3} />
        </Field>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Setup & extras</p>
          <Field>
            <FieldLabel>Massage Setup</FieldLabel>
            <ChipGrid options={MASSAGE_SETUP} selected={form.massageSetup} onToggle={(v) => toggleArr("massageSetup", v)} columns={2} />
          </Field>
          <Field>
            <FieldLabel>Mobile / Outcall Extras</FieldLabel>
            <ChipGrid options={MOBILE_EXTRAS} selected={form.mobileExtras} onToggle={(v) => toggleArr("mobileExtras", v)} columns={3} />
          </Field>
          <Field>
            <FieldLabel>Additional Services</FieldLabel>
            <ChipGrid options={ADDITIONAL_SERVICES} selected={form.additionalServices} onToggle={(v) => toggleArr("additionalServices", v)} columns={3} />
          </Field>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Studio amenities & products</p>
          <Field>
            <FieldLabel>Studio Amenities</FieldLabel>
            <ChipGrid options={STUDIO_AMENITIES} selected={form.studioAmenities} onToggle={(v) => toggleArr("studioAmenities", v)} columns={3} />
          </Field>
          <Field>
            <FieldLabel>Products Used</FieldLabel>
            <ChipGrid options={PRODUCTS} selected={form.productsUsed} onToggle={(v) => toggleArr("productsUsed", v)} columns={3} />
          </Field>
          <Field>
            <FieldLabel>Products Sold</FieldLabel>
            <ChipGrid options={PRODUCTS} selected={form.productsSold} onToggle={(v) => toggleArr("productsSold", v)} columns={3} />
          </Field>
        </div>
      </Accordion>

      {/* 4. Rates & Payments — pricing, disclaimers, discounts, payment methods */}
      <Accordion id="pricing" icon={SECTION_META.pricing.icon} title={SECTION_META.pricing.title} subtitle={SECTION_META.pricing.subtitle} count={sectionCount("pricing")} open={open.pricing} onToggle={() => toggleSection("pricing")}>
        <div className="space-y-3">
          {form.pricingSessions.map((session, idx) => (
            <div key={idx} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Field>
                <FieldLabel>Minutes</FieldLabel>
                <input
                  type="number" min={1} className={inputCls()} value={session.minutes}
                  onChange={(e) => updateSession(idx, { minutes: Number(e.target.value) || 0 })}
                  placeholder="60"
                />
              </Field>
              <Field>
                <FieldLabel>Incall ($)</FieldLabel>
                <input
                  type="number" min={0} className={inputCls()}
                  value={session.incall_rate ?? ""}
                  onChange={(e) => updateSession(idx, { incall_rate: e.target.value === "" ? null : Number(e.target.value) })}
                  placeholder="150"
                />
              </Field>
              <Field>
                <FieldLabel>Outcall ($)</FieldLabel>
                <input
                  type="number" min={0} className={inputCls()}
                  value={session.outcall_rate ?? ""}
                  onChange={(e) => updateSession(idx, { outcall_rate: e.target.value === "" ? null : Number(e.target.value) })}
                  placeholder="220"
                />
              </Field>
              <button
                type="button"
                onClick={() => removeSession(idx)}
                className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:text-rose-500"
                aria-label="Remove session"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSession}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Add session length
          </button>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Disclaimers & discounts</p>
          <Field>
            <FieldLabel>Rate Disclaimers</FieldLabel>
            <ChipGrid options={RATE_DISCLAIMERS} selected={form.rateDisclaimers} onToggle={(v) => toggleArr("rateDisclaimers", v)} columns={2} />
          </Field>
          <Field>
            <FieldLabel>Regular Discounts</FieldLabel>
            <ChipGrid options={REGULAR_DISCOUNTS} selected={form.regularDiscounts} onToggle={(v) => toggleArr("regularDiscounts", v)} columns={3} />
          </Field>
          <Field>
            <FieldLabel>Day-of-Week Discount</FieldLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              <select className={inputCls()} value={form.dayDiscountPercent} onChange={(e) => set("dayDiscountPercent", e.target.value)}>
                <option value="">No percentage</option>
                {DISCOUNT_PERCENTS.map((p) => <option key={p} value={String(p)}>{p}% off</option>)}
              </select>
              <select className={inputCls()} value={form.dayDiscountDay} onChange={(e) => set("dayDiscountDay", e.target.value)}>
                <option value="">Select day</option>
                {WEEK_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </Field>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Payment methods</p>
          <ChipGrid options={PAYMENT_METHODS} selected={form.paymentMethods} onToggle={(v) => toggleArr("paymentMethods", v)} columns={3} />
        </div>
      </Accordion>

      {/* 5. Schedule — hours + availability */}
      <Accordion id="schedule" icon={SECTION_META.schedule.icon} title={SECTION_META.schedule.title} subtitle={SECTION_META.schedule.subtitle} open={open.schedule} onToggle={() => toggleSection("schedule")}>
        <Field>
          <FieldLabel>Studio Hours</FieldLabel>
          <HoursRows rows={form.studioHours} onChange={(rows) => set("studioHours", rows)} />
        </Field>
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <Toggle checked={form.mobileSameAsStudio} onChange={(v) => set("mobileSameAsStudio", v)} label="Mobile hours are the same as studio hours" />
          {!form.mobileSameAsStudio && (
            <Field>
              <FieldLabel>Mobile / Outcall Hours</FieldLabel>
              <HoursRows rows={form.mobileHours} onChange={(rows) => set("mobileHours", rows)} />
            </Field>
          )}
        </div>
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Current status</p>
          <Toggle checked={form.availableNow} onChange={(v) => set("availableNow", v)} label="I'm available now" />
          <Field>
            <FieldLabel>Current Status</FieldLabel>
            <select className={inputCls()} value={form.currentStatus} onChange={(e) => set("currentStatus", e.target.value)}>
              <option value="">Not set</option>
              {CURRENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Toggle checked={form.lgbtqAffirming} onChange={(v) => set("lgbtqAffirming", v)} label="My practice is LGBTQ+-affirming" />
        </div>
      </Accordion>

      {/* 6. Credentials — education, experience, languages, affiliations */}
      <Accordion id="credentials" icon={SECTION_META.credentials.icon} title={SECTION_META.credentials.title} subtitle={SECTION_META.credentials.subtitle} count={sectionCount("credentials")} open={open.credentials} onToggle={() => toggleSection("credentials")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Career Start Date</FieldLabel>
            <div className="flex gap-2">
              <select className={inputCls()} value={form.startMonth} onChange={(e) => set("startMonth", e.target.value)}>
                <option value="">Month</option>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select className={inputCls()} value={form.startYear} onChange={(e) => set("startYear", e.target.value)}>
                <option value="">Year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </Field>
          <Field>
            <FieldLabel>Years of Experience</FieldLabel>
            <input type="number" min={0} max={80} className={inputCls()} value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} placeholder="e.g. 8" />
          </Field>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Education</p>
          {form.educationEntries.map((entry, idx) => (
            <div key={idx} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Entry {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:text-rose-500"
                  aria-label="Remove education entry"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field>
                  <FieldLabel>Degree / Certification</FieldLabel>
                  <input className={inputCls()} value={entry.degree} onChange={(e) => updateEducation(idx, { degree: e.target.value })} placeholder="Certified Massage Therapist" />
                </Field>
                <Field>
                  <FieldLabel>Institution</FieldLabel>
                  <input className={inputCls()} value={entry.institution} onChange={(e) => updateEducation(idx, { institution: e.target.value })} placeholder="School name" />
                </Field>
                <Field>
                  <FieldLabel>Location</FieldLabel>
                  <input className={inputCls()} value={entry.location} onChange={(e) => updateEducation(idx, { location: e.target.value })} placeholder="City, State" />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Start</FieldLabel>
                  <div className="flex gap-2">
                    <select className={inputCls()} value={entry.start_month ?? ""} onChange={(e) => updateEducation(idx, { start_month: e.target.value === "" ? null : Number(e.target.value) })}>
                      <option value="">Month</option>
                      {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                    <select className={inputCls()} value={entry.start_year ?? ""} onChange={(e) => updateEducation(idx, { start_year: e.target.value === "" ? null : Number(e.target.value) })}>
                      <option value="">Year</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </Field>
                <Field>
                  <FieldLabel>End</FieldLabel>
                  <div className="flex gap-2">
                    <select className={inputCls()} value={entry.end_month ?? ""} onChange={(e) => updateEducation(idx, { end_month: e.target.value === "" ? null : Number(e.target.value) })}>
                      <option value="">Month</option>
                      {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                    <select className={inputCls()} value={entry.end_year ?? ""} onChange={(e) => updateEducation(idx, { end_year: e.target.value === "" ? null : Number(e.target.value) })}>
                      <option value="">Year</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addEducation}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Add education entry
          </button>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Languages & affiliations</p>
          <Field>
            <FieldLabel>Languages</FieldLabel>
            <ChipGrid options={LANGUAGES} selected={form.languages} onToggle={(v) => toggleArr("languages", v)} columns={4} />
          </Field>
          <Field>
            <FieldLabel>Affiliations</FieldLabel>
            <ChipGrid options={AFFILIATIONS} selected={form.affiliations} onToggle={(v) => toggleArr("affiliations", v)} columns={2} />
          </Field>
        </div>
      </Accordion>

      {/* Sticky save bar */}
      <div className="sticky bottom-6 z-30 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p className="hidden text-xs text-slate-500 sm:block">
          Changes are reviewed before going live. See our{" "}
          <Link href="/legal" className="font-semibold text-slate-900 underline underline-offset-2">platform rules</Link>.
        </p>
        <motion.button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all sm:w-auto sm:min-w-[200px] ${
            saveState === "success" ? "bg-emerald-500"
              : saveState === "error" ? "bg-rose-500"
                : "bg-primary hover:bg-primary/90"
          }`}
        >
          {saveState === "idle" && <><Save className="h-4 w-4" strokeWidth={2.25} /> Save changes</>}
          {saveState === "saving" && <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>}
          {saveState === "success" && <><Check className="h-4 w-4" strokeWidth={2.5} /> Saved</>}
          {saveState === "error" && <><ShieldAlert className="h-4 w-4" strokeWidth={2.25} /> Try again</>}
        </motion.button>
      </div>
    </div>
  );
}
