"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { SignupPlanTier } from "./plans";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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
  neighborhood: string;
  visitingCities: string[];
  locationType: "incall" | "outcall" | "both" | "";
  serviceCategories: string[];
  sessionLengths: string[];
  startingPrice: string;
  addOns: string;
  availableNow: boolean;
  profilePhoto: File | null;
  galleryPhotos: File[];
  mediaCompliance: boolean;
}

export interface SignupState {
  /* Plan */
  selectedPlanTier: SignupPlanTier | null;

  /* Account */
  accountCreated: boolean;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;

  /* Verification */
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerificationStatus: IdentityVerificationStatus;
  stripeIdentitySessionId: string | null;

  /* Profile */
  profile: SignupProfile;
  profileCompleted: boolean;

  /* Submission */
  submissionStatus: SubmissionStatus;
  moderationNotes: string[];

  /* Billing */
  billingStatus: BillingStatus;
  stripeCustomerId: string | null;

  /* Terms */
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
  neighborhood: "",
  visitingCities: [],
  locationType: "",
  serviceCategories: [],
  sessionLengths: [],
  startingPrice: "",
  addOns: "",
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

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

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
  const [state, setState] = useState<SignupState>(initialState);

  const setPlan = useCallback(
    (tier: SignupPlanTier) => setState((s) => ({ ...s, selectedPlanTier: tier })),
    [],
  );

  const setAccountInfo = useCallback(
    (info: { fullName: string; displayName: string; email: string; phone: string }) =>
      setState((s) => ({ ...s, ...info })),
    [],
  );

  const markAccountCreated = useCallback(
    () => setState((s) => ({ ...s, accountCreated: true })),
    [],
  );

  const markEmailVerified = useCallback(
    () => setState((s) => ({ ...s, emailVerified: true })),
    [],
  );

  const markPhoneVerified = useCallback(
    () => setState((s) => ({ ...s, phoneVerified: true })),
    [],
  );

  const setIdentityStatus = useCallback(
    (status: IdentityVerificationStatus) =>
      setState((s) => ({ ...s, identityVerificationStatus: status })),
    [],
  );

  const setStripeIdentitySessionId = useCallback(
    (id: string) => setState((s) => ({ ...s, stripeIdentitySessionId: id })),
    [],
  );

  const updateProfile = useCallback(
    (updates: Partial<SignupProfile>) =>
      setState((s) => ({ ...s, profile: { ...s.profile, ...updates } })),
    [],
  );

  const markProfileCompleted = useCallback(
    () => setState((s) => ({ ...s, profileCompleted: true })),
    [],
  );

  const setTermsAccepted = useCallback(
    (v: boolean) => setState((s) => ({ ...s, termsAccepted: v })),
    [],
  );

  const setComplianceAcknowledged = useCallback(
    (v: boolean) => setState((s) => ({ ...s, complianceAcknowledged: v })),
    [],
  );

  const setSubmissionStatus = useCallback(
    (status: SubmissionStatus) => setState((s) => ({ ...s, submissionStatus: status })),
    [],
  );

  const setModerationNotes = useCallback(
    (notes: string[]) => setState((s) => ({ ...s, moderationNotes: notes })),
    [],
  );

  const setBillingStatus = useCallback(
    (status: BillingStatus) => setState((s) => ({ ...s, billingStatus: status })),
    [],
  );

  const setStripeCustomerId = useCallback(
    (id: string) => setState((s) => ({ ...s, stripeCustomerId: id })),
    [],
  );

  const reset = useCallback(() => setState(initialState), []);

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
