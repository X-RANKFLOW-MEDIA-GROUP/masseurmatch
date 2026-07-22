"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { SignupPlanTier } from "./plans";
import { useAuth } from "@/contexts/AuthContext";

export type IdentityVerificationStatus =
  | "not_started"
  | "processing"
  | "verified"
  | "requires_input"
  | "failed";

export type SubmissionStatus =
  | "draft"
  | "pending_approval"
  | "under_review"
  | "approved"
  | "rejected";

export type BillingStatus =
  | "not_started"
  | "payment_method_collected"
  | "pending_activation"
  | "active"
  | "failed";

export type SignupPricingMode = "simple" | "technique" | "ask_me";

export interface SignupPricingSession {
  id: string;
  mode: SignupPricingMode;
  technique: string;
  minutes: number;
  incall_rate: number | null;
  outcall_rate: number | null;
  incall_ask_me: boolean;
  outcall_ask_me: boolean;
}

export interface ProfileMigrationUrl {
  platform: string;
  url: string;
}

export interface SignupProfile {
  tagline: string;
  bio: string;
  yearsExperience: string;
  languages: string[];
  education: string;
  certifications: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  locationDescription: string;
  serviceAreaCities: string[];
  landmarks: string[];
  visitingCities: string[];
  locationType: "incall" | "outcall" | "both" | "";
  serviceCategories: string[];
  sessionLengths: string[];
  startingPrice: string;
  pricingMode: SignupPricingMode;
  pricingSessions: SignupPricingSession[];
  addOns: string;
  heightInches: string;
  weightLb: string;
  bodyType: string;
  availableNow: boolean;
  profilePhoto: File | null;
  galleryPhotos: File[];
  removeProfilePhotoBackground: boolean;
  mediaCompliance: boolean;
  migrationUrls: ProfileMigrationUrl[];
}

export interface SignupState {
  selectedPlanTier: SignupPlanTier | null;
  accountCreated: boolean;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerificationStatus: IdentityVerificationStatus;
  stripeIdentitySessionId: string | null;
  profile: SignupProfile;
  profileCompleted: boolean;
  submissionStatus: SubmissionStatus;
  moderationNotes: string[];
  billingStatus: BillingStatus;
  stripeCustomerId: string | null;
  termsAccepted: boolean;
  complianceAcknowledged: boolean;
  ageAndConductAttested: boolean;
}

const emptyProfile: SignupProfile = {
  tagline: "",
  bio: "",
  yearsExperience: "",
  languages: [],
  education: "",
  certifications: "",
  city: "",
  state: "",
  zipCode: "",
  neighborhood: "",
  locationDescription: "",
  serviceAreaCities: [],
  landmarks: [],
  visitingCities: [],
  locationType: "",
  serviceCategories: [],
  sessionLengths: [],
  startingPrice: "",
  pricingMode: "simple",
  pricingSessions: [
    {
      id: "rate-1",
      mode: "simple",
      technique: "",
      minutes: 60,
      incall_rate: null,
      outcall_rate: null,
      incall_ask_me: false,
      outcall_ask_me: false,
    },
  ],
  addOns: "",
  heightInches: "",
  weightLb: "",
  bodyType: "",
  availableNow: false,
  profilePhoto: null,
  galleryPhotos: [],
  removeProfilePhotoBackground: true,
  mediaCompliance: false,
  migrationUrls: [],
};

const initialState: SignupState = {
  selectedPlanTier: null,
  accountCreated: false,
  fullName: "",
  displayName: "",
  email: "",
  phone: "",
  emailVerified: false,
  phoneVerified: false,
  identityVerificationStatus: "not_started",
  stripeIdentitySessionId: null,
  profile: emptyProfile,
  profileCompleted: false,
  submissionStatus: "draft",
  moderationNotes: [],
  billingStatus: "not_started",
  stripeCustomerId: null,
  termsAccepted: false,
  complianceAcknowledged: false,
  ageAndConductAttested: false,
};

export const SIGNUP_BOOTSTRAP_STORAGE_KEY = "mm_signup_bootstrap";
const SIGNUP_STATE_STORAGE_KEY = "mm_signup_state";

function hydrateProfile(value: Partial<SignupProfile> | undefined): Partial<SignupProfile> {
  if (!value) return {};
  const pricingSessions = Array.isArray(value.pricingSessions) && value.pricingSessions.length
    ? value.pricingSessions.map((session, index) => ({
        id: session.id || `rate-${index + 1}`,
        mode: session.mode || value.pricingMode || "simple",
        technique: session.technique || "",
        minutes: Number(session.minutes) || 60,
        incall_rate: typeof session.incall_rate === "number" ? session.incall_rate : null,
        outcall_rate: typeof session.outcall_rate === "number" ? session.outcall_rate : null,
        incall_ask_me: Boolean(session.incall_ask_me),
        outcall_ask_me: Boolean(session.outcall_ask_me),
      }))
    : undefined;
  return { ...value, ...(pricingSessions ? { pricingSessions } : {}) };
}

function createPersistedStateSnapshot(state: SignupState): SignupState {
  return {
    ...state,
    profile: {
      ...state.profile,
      profilePhoto: null,
      galleryPhotos: [],
    },
  };
}

interface SignupContextType {
  state: SignupState;
  setPlan: (tier: SignupPlanTier) => void;
  setAccountInfo: (info: { fullName: string; displayName: string; email: string; phone: string }) => void;
  markAccountCreated: () => void;
  markEmailVerified: () => void;
  markPhoneVerified: () => void;
  setIdentityStatus: (status: IdentityVerificationStatus) => void;
  setStripeIdentitySessionId: (id: string) => void;
  updateProfile: (updates: Partial<SignupProfile>) => void;
  markProfileCompleted: () => void;
  setTermsAccepted: (value: boolean) => void;
  setComplianceAcknowledged: (value: boolean) => void;
  setAgeAndConductAttested: (value: boolean) => void;
  setSubmissionStatus: (status: SubmissionStatus) => void;
  setModerationNotes: (notes: string[]) => void;
  setBillingStatus: (status: BillingStatus) => void;
  setStripeCustomerId: (id: string) => void;
  reset: () => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SignupState>(initialState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const persisted = window.sessionStorage.getItem(SIGNUP_STATE_STORAGE_KEY);
    const bootstrap = window.sessionStorage.getItem(SIGNUP_BOOTSTRAP_STORAGE_KEY);
    if (!persisted && !bootstrap) return;

    try {
      const stored = persisted ? (JSON.parse(persisted) as Partial<SignupState>) : {};
      const seeded = bootstrap ? (JSON.parse(bootstrap) as Partial<SignupState>) : {};
      setState((current) => ({
        ...current,
        ...stored,
        ...seeded,
        profile: {
          ...current.profile,
          ...hydrateProfile(stored.profile),
          ...hydrateProfile(seeded.profile),
        },
      }));
    } catch {
      // Ignore incompatible state from older signup builds.
    } finally {
      window.sessionStorage.removeItem(SIGNUP_BOOTSTRAP_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(SIGNUP_STATE_STORAGE_KEY, JSON.stringify(createPersistedStateSnapshot(state)));
  }, [state]);

  useEffect(() => {
    if (!user) return;
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const fullName = typeof metadata?.full_name === "string"
      ? metadata.full_name.trim()
      : typeof metadata?.name === "string"
        ? metadata.name.trim()
        : "";

    setState((current) => ({
      ...current,
      accountCreated: true,
      fullName: current.fullName || fullName,
      displayName: current.displayName || current.fullName || fullName,
      email: current.email || user.email?.trim() || "",
      phone: current.phone || user.phone?.trim() || "",
    }));
  }, [user]);

  const setPlan = useCallback((tier: SignupPlanTier) => setState((current) => ({ ...current, selectedPlanTier: tier })), []);
  const setAccountInfo = useCallback((info: { fullName: string; displayName: string; email: string; phone: string }) => setState((current) => ({ ...current, ...info })), []);
  const markAccountCreated = useCallback(() => setState((current) => ({ ...current, accountCreated: true })), []);
  const markEmailVerified = useCallback(() => setState((current) => ({ ...current, emailVerified: true })), []);
  const markPhoneVerified = useCallback(() => setState((current) => ({ ...current, phoneVerified: true })), []);
  const setIdentityStatus = useCallback((status: IdentityVerificationStatus) => setState((current) => ({ ...current, identityVerificationStatus: status })), []);
  const setStripeIdentitySessionId = useCallback((id: string) => setState((current) => ({ ...current, stripeIdentitySessionId: id })), []);
  const updateProfile = useCallback((updates: Partial<SignupProfile>) => setState((current) => ({ ...current, profile: { ...current.profile, ...updates } })), []);
  const markProfileCompleted = useCallback(() => setState((current) => ({ ...current, profileCompleted: true })), []);
  const setTermsAccepted = useCallback((value: boolean) => setState((current) => ({ ...current, termsAccepted: value })), []);
  const setComplianceAcknowledged = useCallback((value: boolean) => setState((current) => ({ ...current, complianceAcknowledged: value })), []);
  const setAgeAndConductAttested = useCallback((value: boolean) => setState((current) => ({ ...current, ageAndConductAttested: value })), []);
  const setSubmissionStatus = useCallback((status: SubmissionStatus) => setState((current) => ({ ...current, submissionStatus: status })), []);
  const setModerationNotes = useCallback((notes: string[]) => setState((current) => ({ ...current, moderationNotes: notes })), []);
  const setBillingStatus = useCallback((status: BillingStatus) => setState((current) => ({ ...current, billingStatus: status })), []);
  const setStripeCustomerId = useCallback((id: string) => setState((current) => ({ ...current, stripeCustomerId: id })), []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SIGNUP_BOOTSTRAP_STORAGE_KEY);
      window.sessionStorage.removeItem(SIGNUP_STATE_STORAGE_KEY);
    }
    setState(initialState);
  }, []);

  return (
    <SignupContext.Provider value={{
      state,
      setPlan,
      setAccountInfo,
      markAccountCreated,
      markEmailVerified,
      markPhoneVerified,
      setIdentityStatus,
      setStripeIdentitySessionId,
      updateProfile,
      markProfileCompleted,
      setTermsAccepted,
      setComplianceAcknowledged,
      setAgeAndConductAttested,
      setSubmissionStatus,
      setModerationNotes,
      setBillingStatus,
      setStripeCustomerId,
      reset,
    }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const context = useContext(SignupContext);
  if (!context) throw new Error("useSignup must be used within <SignupProvider>");
  return context;
}
