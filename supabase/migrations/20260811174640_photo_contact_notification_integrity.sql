-- Photo, contact and notification integrity hardening.

UPDATE public.profile_photos
SET is_primary = false
WHERE is_primary IS TRUE
  AND COALESCE(moderation_status, 'pending') <> 'approved';

WITH approved_profiles AS (
  SELECT DISTINCT profile_id
  FROM public.profile_photos
  WHERE profile_id IS NOT NULL
    AND moderation_status = 'approved'
), missing_primary AS (
  SELECT ap.profile_id
  FROM approved_profiles ap
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.profile_photos pp
    WHERE pp.profile_id = ap.profile_id
      AND pp.is_primary IS TRUE
      AND pp.moderation_status = 'approved'
  )
), candidates AS (
  SELECT DISTINCT ON (pp.profile_id)
    pp.id,
    pp.profile_id
  FROM public.profile_photos pp
  JOIN missing_primary mp ON mp.profile_id = pp.profile_id
  WHERE pp.moderation_status = 'approved'
  ORDER BY pp.profile_id, COALESCE(pp.sort_order, 0), pp.created_at, pp.id
)
UPDATE public.profile_photos pp
SET is_primary = true
FROM candidates c
WHERE pp.id = c.id;

CREATE OR REPLACE FUNCTION public.guard_profile_photo_primary()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_primary IS TRUE
     AND COALESCE(NEW.moderation_status, 'pending') <> 'approved' THEN
    NEW.is_primary := false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_photo_primary ON public.profile_photos;
CREATE TRIGGER trg_guard_profile_photo_primary
BEFORE INSERT OR UPDATE ON public.profile_photos
FOR EACH ROW
EXECUTE FUNCTION public.guard_profile_photo_primary();

CREATE OR REPLACE FUNCTION public.repair_profile_photo_primary()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
  v_candidate_id uuid;
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NULL;
  END IF;

  v_profile_id := COALESCE(NEW.profile_id, OLD.profile_id);
  IF v_profile_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.profile_photos
    WHERE profile_id = v_profile_id
      AND is_primary IS TRUE
      AND moderation_status = 'approved'
  ) THEN
    RETURN NULL;
  END IF;

  SELECT id
  INTO v_candidate_id
  FROM public.profile_photos
  WHERE profile_id = v_profile_id
    AND moderation_status = 'approved'
  ORDER BY COALESCE(sort_order, 0), created_at, id
  LIMIT 1;

  IF v_candidate_id IS NOT NULL THEN
    UPDATE public.profile_photos
    SET is_primary = true
    WHERE id = v_candidate_id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_repair_profile_photo_primary_insert ON public.profile_photos;
CREATE TRIGGER trg_repair_profile_photo_primary_insert
AFTER INSERT ON public.profile_photos
FOR EACH ROW
EXECUTE FUNCTION public.repair_profile_photo_primary();

DROP TRIGGER IF EXISTS trg_repair_profile_photo_primary_moderation ON public.profile_photos;
CREATE TRIGGER trg_repair_profile_photo_primary_moderation
AFTER UPDATE OF moderation_status ON public.profile_photos
FOR EACH ROW
EXECUTE FUNCTION public.repair_profile_photo_primary();

DROP TRIGGER IF EXISTS trg_repair_profile_photo_primary_delete ON public.profile_photos;
CREATE TRIGGER trg_repair_profile_photo_primary_delete
AFTER DELETE ON public.profile_photos
FOR EACH ROW
EXECUTE FUNCTION public.repair_profile_photo_primary();

ALTER TABLE public.contact_preferences
  ALTER COLUMN therapist_id SET NOT NULL,
  ALTER COLUMN allow_email SET DEFAULT true,
  ALTER COLUMN allow_phone SET DEFAULT true,
  ALTER COLUMN allow_whatsapp SET DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_preferences_therapist_id
  ON public.contact_preferences(therapist_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contact_preferences_therapist_id_fkey'
      AND conrelid = 'public.contact_preferences'::regclass
  ) THEN
    ALTER TABLE public.contact_preferences
      ADD CONSTRAINT contact_preferences_therapist_id_fkey
      FOREIGN KEY (therapist_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END
$$;

DROP POLICY IF EXISTS contact_preferences_owner_insert ON public.contact_preferences;
CREATE POLICY contact_preferences_owner_insert
ON public.contact_preferences
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = therapist_id
      AND p.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS contact_preferences_owner_update ON public.contact_preferences;
CREATE POLICY contact_preferences_owner_update
ON public.contact_preferences
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = therapist_id
      AND p.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = therapist_id
      AND p.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS contact_preferences_owner_delete ON public.contact_preferences;
CREATE POLICY contact_preferences_owner_delete
ON public.contact_preferences
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = therapist_id
      AND p.user_id = (SELECT auth.uid())
  )
);

UPDATE public.contact_inquiries
SET preferred_contact = 'email'
WHERE preferred_contact IS NULL;

ALTER TABLE public.contact_inquiries
  ALTER COLUMN profile_id SET NOT NULL,
  ALTER COLUMN client_name SET NOT NULL,
  ALTER COLUMN client_email SET NOT NULL,
  ALTER COLUMN message SET NOT NULL,
  ALTER COLUMN preferred_contact SET DEFAULT 'email',
  ALTER COLUMN preferred_contact SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'new',
  ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_name_length_check' AND conrelid = 'public.contact_inquiries'::regclass) THEN
    ALTER TABLE public.contact_inquiries ADD CONSTRAINT contact_inquiries_name_length_check CHECK (char_length(btrim(client_name)) BETWEEN 1 AND 120);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_email_shape_check' AND conrelid = 'public.contact_inquiries'::regclass) THEN
    ALTER TABLE public.contact_inquiries ADD CONSTRAINT contact_inquiries_email_shape_check CHECK (char_length(btrim(client_email)) BETWEEN 3 AND 254 AND client_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_message_length_check' AND conrelid = 'public.contact_inquiries'::regclass) THEN
    ALTER TABLE public.contact_inquiries ADD CONSTRAINT contact_inquiries_message_length_check CHECK (char_length(btrim(message)) BETWEEN 10 AND 2000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_preferred_contact_check' AND conrelid = 'public.contact_inquiries'::regclass) THEN
    ALTER TABLE public.contact_inquiries ADD CONSTRAINT contact_inquiries_preferred_contact_check CHECK (preferred_contact IN ('email', 'phone', 'whatsapp'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_status_check' AND conrelid = 'public.contact_inquiries'::regclass) THEN
    ALTER TABLE public.contact_inquiries ADD CONSTRAINT contact_inquiries_status_check CHECK (status IN ('new', 'viewed', 'responded', 'archived'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_profile_status_created
  ON public.contact_inquiries(profile_id, status, created_at DESC);

DROP POLICY IF EXISTS contact_inquiries_insert_public ON public.contact_inquiries;
CREATE POLICY contact_inquiries_insert_public
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  profile_id IS NOT NULL
  AND char_length(btrim(client_name)) BETWEEN 1 AND 120
  AND char_length(btrim(client_email)) BETWEEN 3 AND 254
  AND char_length(btrim(message)) BETWEEN 10 AND 2000
  AND preferred_contact IN ('email', 'phone', 'whatsapp')
  AND status = 'new'
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = profile_id
      AND p.profile_status = 'approved'
      AND p.visibility_status = 'public'
      AND COALESCE(p.is_suspended, false) = false
      AND COALESCE(p.is_banned, false) = false
  )
);

ALTER TABLE public.user_notification_preferences
  ALTER COLUMN user_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_notification_preferences_user_id
  ON public.user_notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_created
  ON public.notifications(user_id, is_read, created_at DESC);
