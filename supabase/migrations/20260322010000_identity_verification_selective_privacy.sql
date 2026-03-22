-- Identity Verification with Selective Privacy for LGBTQ+ Safety
-- Therapists can verify their identity without exposing their legal name publicly
-- Only verification status (badge) is shown — legal details are encrypted/hashed

-- ══════════════════════════════════════════════════════════════════════════════
-- Verification requests table
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL,  -- references profiles(id) but allowing flexibility

  -- What they submit (encrypted at rest by Supabase; we store only hashes for matching)
  legal_name_hash text NOT NULL,  -- SHA-256 of normalized legal name
  document_type text NOT NULL CHECK (document_type IN (
    'drivers_license', 'passport', 'state_id', 'military_id'
  )),
  document_country text NOT NULL DEFAULT 'US',
  document_expiry date,

  -- Photo ID upload reference (stored in private bucket, auto-deleted after verification)
  document_storage_path text,

  -- Selfie for liveness check reference
  selfie_storage_path text,

  -- Verification result
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'reviewing', 'approved', 'rejected', 'expired'
  )),
  rejection_reason text,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,

  -- Privacy controls — what the therapist consents to share publicly
  show_verified_badge boolean NOT NULL DEFAULT true,
  show_first_name boolean NOT NULL DEFAULT false,
  show_verification_date boolean NOT NULL DEFAULT true,
  show_document_type boolean NOT NULL DEFAULT false,

  -- Audit
  verification_method text NOT NULL DEFAULT 'manual' CHECK (verification_method IN (
    'manual', 'automated', 'partner_api'
  )),
  verified_at timestamptz,
  expires_at timestamptz,  -- verifications expire after 2 years
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_user
  ON public.identity_verifications (user_id, status);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_profile
  ON public.identity_verifications (profile_id, status);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_pending
  ON public.identity_verifications (status, created_at)
  WHERE status IN ('pending', 'reviewing');

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own verifications
DROP POLICY IF EXISTS "verifications_select_own" ON public.identity_verifications;
CREATE POLICY "verifications_select_own"
  ON public.identity_verifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "verifications_insert_own" ON public.identity_verifications;
CREATE POLICY "verifications_insert_own"
  ON public.identity_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "verifications_update_admin" ON public.identity_verifications;
CREATE POLICY "verifications_update_admin"
  ON public.identity_verifications FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- Public verification status view — ONLY exposes what therapist consents to
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.public_verification_status AS
SELECT
  v.profile_id,
  v.status = 'approved' AND (v.expires_at IS NULL OR v.expires_at > now()) AS is_verified,
  CASE WHEN v.show_verified_badge THEN true ELSE false END AS show_badge,
  CASE WHEN v.show_verification_date THEN v.verified_at ELSE NULL END AS verified_since,
  CASE WHEN v.show_document_type THEN v.document_type ELSE NULL END AS document_type,
  v.verification_method
FROM public.identity_verifications v
WHERE v.status = 'approved'
  AND (v.expires_at IS NULL OR v.expires_at > now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Private storage bucket for verification documents (NOT public)
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identity-documents',
  'identity-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Only the user can upload their own documents
DROP POLICY IF EXISTS "User can upload own identity docs" ON storage.objects;
CREATE POLICY "User can upload own identity docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'identity-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin can read all documents for review
DROP POLICY IF EXISTS "Admin can read identity docs" ON storage.objects;
CREATE POLICY "Admin can read identity docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'identity-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- Admin can delete documents after review/expiry
DROP POLICY IF EXISTS "Admin can delete identity docs" ON storage.objects;
CREATE POLICY "Admin can delete identity docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'identity-documents'
    AND public.is_admin()
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- RPC to submit verification request (hashes the legal name server-side)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.submit_identity_verification(
  p_profile_id uuid,
  p_legal_name text,
  p_document_type text,
  p_document_country text DEFAULT 'US',
  p_document_expiry date DEFAULT NULL,
  p_document_storage_path text DEFAULT NULL,
  p_selfie_storage_path text DEFAULT NULL,
  p_show_first_name boolean DEFAULT false,
  p_show_verification_date boolean DEFAULT true,
  p_show_document_type boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _name_hash text;
  _existing_id uuid;
  _new_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check for existing pending/reviewing verification
  SELECT id INTO _existing_id
  FROM public.identity_verifications
  WHERE user_id = _user_id
    AND profile_id = p_profile_id
    AND status IN ('pending', 'reviewing')
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'You already have a pending verification request';
  END IF;

  -- Hash the legal name (SHA-256) — the plain text is never stored
  _name_hash := encode(digest(lower(trim(p_legal_name)), 'sha256'), 'hex');

  INSERT INTO public.identity_verifications (
    user_id, profile_id, legal_name_hash, document_type,
    document_country, document_expiry, document_storage_path,
    selfie_storage_path, show_first_name, show_verification_date,
    show_document_type
  ) VALUES (
    _user_id, p_profile_id, _name_hash, p_document_type,
    p_document_country, p_document_expiry, p_document_storage_path,
    p_selfie_storage_path, p_show_first_name, p_show_verification_date,
    p_show_document_type
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- RPC for admin to approve/reject verification
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.review_identity_verification(
  p_verification_id uuid,
  p_decision text,  -- 'approved' or 'rejected'
  p_rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reviewer_id uuid := auth.uid();
  _profile_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Decision must be approved or rejected';
  END IF;

  UPDATE public.identity_verifications
  SET
    status = p_decision,
    rejection_reason = CASE WHEN p_decision = 'rejected' THEN p_rejection_reason ELSE NULL END,
    reviewer_id = _reviewer_id,
    reviewed_at = timezone('utc', now()),
    verified_at = CASE WHEN p_decision = 'approved' THEN timezone('utc', now()) ELSE NULL END,
    expires_at = CASE WHEN p_decision = 'approved' THEN timezone('utc', now()) + interval '2 years' ELSE NULL END,
    updated_at = timezone('utc', now())
  WHERE id = p_verification_id
    AND status IN ('pending', 'reviewing')
  RETURNING profile_id INTO _profile_id;

  -- Update the profile's verification flags
  IF p_decision = 'approved' AND _profile_id IS NOT NULL THEN
    -- Try profiles table first, then therapists table
    UPDATE public.profiles
    SET is_verified_identity = true
    WHERE id = _profile_id;

    IF NOT FOUND THEN
      UPDATE public.therapists
      SET status = 'approved'
      WHERE id = _profile_id;
    END IF;
  END IF;
END;
$$;

-- Grant service_role access for edge function processing
GRANT ALL ON public.identity_verifications TO service_role;
GRANT SELECT ON public.public_verification_status TO anon, authenticated;
