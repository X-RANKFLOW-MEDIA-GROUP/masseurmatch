"use client";

import {
  createContext,
  useContext,
  useCallback,
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
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export type BillingStatus =
  | "not_started"
  | "payment_method_collected"
  | "pending_activation"
  | "active"
  | "failed";

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
  addOns: string;
  heightInches: string;
  weightLb: string;
  bodyType: string;
  availableNow: boolean;
  profilePhoto: File | null;
  galleryPhotos: File[];
  mediaCompliance: boolean;
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
  addOns: "",
  heightInches: "",
  weightLb: "",
  bodyType: "",
  availableNow: false,
  profilePhoto: null,
  galleryPhotos: [],
  mediaCompliance: false,
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
};

export const SIGNUP_BOOTSTRAP_STORAGE_KEY = "mm_signup_bootstrap";
const SIGNUP_STATE_STORAGE_KEY = "mm_signup_state";

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
  setAccountInfo: (info: {
    fullName: string;
    displayName: string;
    email: string;
    phone: string;
  }) => void;
  markAccountCreated: () => void;
  markEmailVerified: () => void;
  markPhoneVerified: () => void;
  setIdentityStatus: (status: IdentityVerificationStatus) => void;
  setStripeIdentitySessionId: (id: string) => void;
  updateProfile: (updates: Partial<SignupProfile>) => void;
  markProfileCompleted: () => void;
  setTermsAccepted: (v: boolean) => void;
  setComplianceAcknowledged: (v: boolean) => void;
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
      const nextState = persisted ? (JSON.parse(persisted) as Partial<SignupState>) : {};
      const bootstrapState = bootstrap ? (JSON.parse(bootstrap) as Partial<SignupState>) : {};

      setState((current) => ({
        ...current,
        ...nextState,
        ...bootstrapState,
        profile: {
          ...current.profile,
          ...(nextState.profile || {}),
          ...(bootstrapState.profile || {}),
        },
      }));
    } catch {
      // Ignore malformed persisted state from older builds.
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
    const derivedFullName = typeof metadata?.full_name === "string"
      ? metadata.full_name.trim()
      : typeof metadata?.name === "string"
        ? metadata.name.trim()
        : "";
    const derivedEmail = user.email?.trim() ?? "";
    const derivedPhone = user.phone?.trim() ?? "";

    setState((current) => {
      const nextFullName = current.fullName || derivedFullName;
      const nextDisplayName = current.displayName || nextFullName;
      const nextEmail = current.email || derivedEmail;
      const nextPhone = current.phone || derivedPhone;

      if (
        current.accountCreated &&
        current.fullName === nextFullName &&
        current.displayName === nextDisplayName &&
        current.email === nextEmail &&
        current.phone === nextPhone
      ) {
        return current;
      }

      return {
        ...current,
        accountCreated: true,
        fullName: nextFullName,
        displayName: nextDisplayName,
        email: nextEmail,
        phone: nextPhone,
      };
    });
  }, [user]);

  const setPlan = useCallback((tier: SignupPlanTier) => setState((s) => ({ ...s, selectedPlanTier: tier })), []);
  const setAccountInfo = useCallback((info: { fullName: string; displayName: string; email: string; phone: string }) => setState((s) => ({ ...s, ...info })), []);
  const markAccountCreated = useCallback(() => setState((s) => ({ ...s, accountCreated: true })), []);
  const markEmailVerified = useCallback(() => setState((s) => ({ ...s, emailVerified: true })), []);
  const markPhoneVerified = useCallback(() => setState((s) => ({ ...s, phoneVerified: true })), []);
  const setIdentityStatus = useCallback((status: IdentityVerificationStatus) => setState((s) => ({ ...s, identityVerificationStatus: status })), []);
  const setStripeIdentitySessionId = useCallback((id: string) => setState((s) => ({ ...s, stripeIdentitySessionId: id })), []);
  const updateProfile = useCallback((updates: Partial<SignupProfile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...updates } })), []);
  const markProfileCompleted = useCallback(() => setState((s) => ({ ...s, profileCompleted: true })), []);
  const setTermsAccepted = useCallback((v: boolean) => setState((s) => ({ ...s, termsAccepted: v })), []);
  const setComplianceAcknowledged = useCallback((v: boolean) => setState((s) => ({ ...s, complianceAcknowledged: v })), []);
  const setSubmissionStatus = useCallback((status: SubmissionStatus) => setState((s) => ({ ...s, submissionStatus: status })), []);
  const setModerationNotes = useCallback((notes: string[]) => setState((s) => ({ ...s, moderationNotes: notes })), []);
  const setBillingStatus = useCallback((status: BillingStatus) => setState((s) => ({ ...s, billingStatus: status })), []);
  const setStripeCustomerId = useCallback((id: string) => setState((s) => ({ ...s, stripeCustomerId: id })), []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SIGNUP_BOOTSTRAP_STORAGE_KEY);
      window.sessionStorage.removeItem(SIGNUP_STATE_STORAGE_KEY);
    }
    setState(initialState);
  }, []);

  return (
    <SignupContext.Provider
      value={{
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
        setSubmissionStatus,
        setModerationNotes,
        setBillingStatus,
        setStripeCustomerId,
        reset,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error("useSignup must be used within <SignupProvider>");
  return ctx;
}
