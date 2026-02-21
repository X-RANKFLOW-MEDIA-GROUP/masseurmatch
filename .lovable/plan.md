

# Add Terms & Content Policy Acceptance Checkboxes to Profile Setup

## What Changes

Add a mandatory acceptance section at the bottom of the profile setup form (`StepProfile.tsx`, step 3 of onboarding) with three checkboxes that must all be checked before the user can submit:

1. **Terms & Conditions** -- "I have read and agree to the Terms of Service and Privacy Policy"
2. **Photo Policy** -- "I confirm my photos are recent (within 12 months), fully clothed, and comply with the Photo Guidelines. No nudity, sexual poses, or stock photos."
3. **Profile & Ad Description Policy** -- "I confirm my profile description is accurate, professional, and does not contain sexual content, coded language, misleading claims, or deceptive pricing."

## Where It Appears

The acceptance block will appear between the Photos section and the "Save Profile & Submit for Review" button in `StepProfile.tsx`. The submit button will be disabled until all three checkboxes are checked.

## Technical Details

**File modified:** `src/components/auth/StepProfile.tsx`

- Add three boolean state variables: `termsAccepted`, `photoTermsAccepted`, `adTermsAccepted`
- Add a styled section with three `Checkbox` + `Label` pairs, each linking to the relevant policy page (`/terms`, `/privacy`, `/safety`)
- Disable the submit button unless all three are `true`
- Store acceptance timestamp in the profile update payload (`terms_accepted_at` field) for audit purposes -- or simply gate submission client-side if no DB column is needed

No database changes required -- this is a client-side gate ensuring the user explicitly agrees before submitting.
