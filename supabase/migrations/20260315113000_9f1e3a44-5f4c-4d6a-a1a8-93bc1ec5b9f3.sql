-- Lifecycle email system foundation: preferences, suppression, queue, logs, and policy RPCs

-- 1) Audience-level marketing preferences (explicit user setting)
CREATE TABLE IF NOT EXISTS public.marketing_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  newsletter_opt_in boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  source text,
  updated_by text
);

ALTER TABLE public.marketing_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own marketing preferences"
  ON public.marketing_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing preferences"
  ON public.marketing_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing preferences"
  ON public.marketing_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage marketing preferences"
  ON public.marketing_preferences FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- 2) Suppression table for bounces/complaints/manual unsubscribes
CREATE TABLE IF NOT EXISTS public.email_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  reason text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, reason, is_active)
);

CREATE INDEX IF NOT EXISTS idx_email_suppressions_email_active
  ON public.email_suppressions (email, is_active);

ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage suppressions"
  ON public.email_suppressions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- 3) Provider event stream (for segmentation and complaint monitoring)
CREATE TABLE IF NOT EXISTS public.email_provider_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'resend',
  provider_event_id text,
  recipient_email text,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);

CREATE INDEX IF NOT EXISTS idx_email_provider_events_type_time
  ON public.email_provider_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_provider_events_recipient
  ON public.email_provider_events (recipient_email, created_at DESC);

ALTER TABLE public.email_provider_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read provider events"
  ON public.email_provider_events FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert provider events"
  ON public.email_provider_events FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));


-- 4) Lifecycle queue and send log
CREATE TABLE IF NOT EXISTS public.lifecycle_email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email text,
  recipient_name text,
  segment text,
  campaign_key text,
  flow_key text,
  template_key text,
  send_category text NOT NULL CHECK (send_category IN ('marketing', 'transactional')),
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  from_address text,
  reply_to text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'suppressed', 'failed', 'skipped')),
  suppression_reason text,
  provider_id text,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 2,
  idempotency_key text,
  processing_started_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lifecycle_email_queue_recipient_check CHECK (user_id IS NOT NULL OR recipient_email IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lifecycle_email_queue_idempotency
  ON public.lifecycle_email_queue (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_queue_pending
  ON public.lifecycle_email_queue (status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_queue_user
  ON public.lifecycle_email_queue (user_id, created_at DESC);

ALTER TABLE public.lifecycle_email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lifecycle queue"
  ON public.lifecycle_email_queue FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


CREATE TABLE IF NOT EXISTS public.lifecycle_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES public.lifecycle_email_queue(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  segment text,
  campaign_key text,
  flow_key text,
  template_key text,
  send_category text NOT NULL CHECK (send_category IN ('marketing', 'transactional')),
  status text NOT NULL CHECK (status IN ('sent', 'suppressed', 'failed', 'skipped')),
  suppression_reason text,
  provider text NOT NULL DEFAULT 'resend',
  provider_id text,
  subject text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_log_recipient_time
  ON public.lifecycle_email_log (recipient_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_log_category_time
  ON public.lifecycle_email_log (send_category, created_at DESC);

ALTER TABLE public.lifecycle_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read lifecycle log"
  ON public.lifecycle_email_log FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- 5) Helper trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_now()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marketing_preferences_updated_at ON public.marketing_preferences;
CREATE TRIGGER trg_marketing_preferences_updated_at
BEFORE UPDATE ON public.marketing_preferences
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_now();

DROP TRIGGER IF EXISTS trg_email_suppressions_updated_at ON public.email_suppressions;
CREATE TRIGGER trg_email_suppressions_updated_at
BEFORE UPDATE ON public.email_suppressions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_now();

DROP TRIGGER IF EXISTS trg_lifecycle_email_queue_updated_at ON public.lifecycle_email_queue;
CREATE TRIGGER trg_lifecycle_email_queue_updated_at
BEFORE UPDATE ON public.lifecycle_email_queue
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_now();


-- 6) Marketing policy rules
CREATE OR REPLACE FUNCTION public.is_major_us_holiday(p_date date)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  y int := EXTRACT(YEAR FROM p_date);
  thanksgiving date;
BEGIN
  -- New Year (Jan 1)
  IF EXTRACT(MONTH FROM p_date) = 1 AND EXTRACT(DAY FROM p_date) = 1 THEN
    RETURN true;
  END IF;

  -- Christmas (Dec 25)
  IF EXTRACT(MONTH FROM p_date) = 12 AND EXTRACT(DAY FROM p_date) = 25 THEN
    RETURN true;
  END IF;

  -- Thanksgiving (4th Thursday of November)
  thanksgiving := make_date(y, 11, 1)
    + ((11 - EXTRACT(DOW FROM make_date(y, 11, 1))::int) % 7)
    + 21;

  RETURN p_date = thanksgiving;
END;
$$;


CREATE OR REPLACE FUNCTION public.can_send_marketing_email(
  p_user_id uuid,
  p_email text,
  p_send_time timestamptz DEFAULT now()
)
RETURNS TABLE (eligible boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_opt_in boolean;
  v_last_marketing timestamptz;
  v_monthly_count int;
  v_tx_same_day_count int;
  v_sent_30d int;
  v_complaints_30d int;
BEGIN
  IF v_email IS NULL OR v_email = '' THEN
    RETURN QUERY SELECT false, 'missing_email';
    RETURN;
  END IF;

  -- Never market to role-based inboxes
  IF split_part(v_email, '@', 1) ~* '^(info|admin|support)$' THEN
    RETURN QUERY SELECT false, 'role_based_address';
    RETURN;
  END IF;

  -- Explicit suppressions
  IF EXISTS (
    SELECT 1
    FROM public.email_suppressions s
    WHERE lower(s.email) = v_email
      AND s.is_active = true
  ) THEN
    RETURN QUERY SELECT false, 'suppressed_address';
    RETURN;
  END IF;

  -- Newsletter subscriber hard unsubscribe
  IF EXISTS (
    SELECT 1
    FROM public.newsletter_subscribers n
    WHERE lower(n.email) = v_email
      AND (n.is_active = false OR n.unsubscribed_at IS NOT NULL)
  ) THEN
    RETURN QUERY SELECT false, 'newsletter_unsubscribed';
    RETURN;
  END IF;

  -- User-level marketing opt-in (default true for legacy users with no row)
  IF p_user_id IS NOT NULL THEN
    SELECT mp.marketing_opt_in
    INTO v_opt_in
    FROM public.marketing_preferences mp
    WHERE mp.user_id = p_user_id;

    IF COALESCE(v_opt_in, true) = false THEN
      RETURN QUERY SELECT false, 'user_opted_out';
      RETURN;
    END IF;
  END IF;

  -- Holiday suppression
  IF public.is_major_us_holiday((p_send_time AT TIME ZONE 'America/New_York')::date) THEN
    RETURN QUERY SELECT false, 'major_holiday_blackout';
    RETURN;
  END IF;

  -- 24-hour cooldown between marketing emails
  SELECT max(l.created_at)
  INTO v_last_marketing
  FROM public.lifecycle_email_log l
  WHERE lower(l.recipient_email) = v_email
    AND l.send_category = 'marketing'
    AND l.status = 'sent';

  IF v_last_marketing IS NOT NULL AND p_send_time < v_last_marketing + interval '24 hours' THEN
    RETURN QUERY SELECT false, 'marketing_cooldown_24h';
    RETURN;
  END IF;

  -- Never send marketing same day as transactional
  SELECT count(*)
  INTO v_tx_same_day_count
  FROM public.lifecycle_email_log l
  WHERE lower(l.recipient_email) = v_email
    AND l.send_category = 'transactional'
    AND l.status = 'sent'
    AND (l.created_at AT TIME ZONE 'UTC')::date = (p_send_time AT TIME ZONE 'UTC')::date;

  IF v_tx_same_day_count > 0 THEN
    RETURN QUERY SELECT false, 'same_day_transactional';
    RETURN;
  END IF;

  -- Global cap: 8 marketing emails per month per recipient
  SELECT count(*)
  INTO v_monthly_count
  FROM public.lifecycle_email_log l
  WHERE lower(l.recipient_email) = v_email
    AND l.send_category = 'marketing'
    AND l.status = 'sent'
    AND date_trunc('month', l.created_at) = date_trunc('month', p_send_time);

  IF v_monthly_count >= 8 THEN
    RETURN QUERY SELECT false, 'monthly_marketing_cap_reached';
    RETURN;
  END IF;

  -- Complaint threshold guard: pause if > 0.08% over last 30 days
  SELECT count(*)
  INTO v_sent_30d
  FROM public.lifecycle_email_log l
  WHERE l.send_category = 'marketing'
    AND l.status = 'sent'
    AND l.created_at >= now() - interval '30 days';

  SELECT count(*)
  INTO v_complaints_30d
  FROM public.email_provider_events e
  WHERE e.event_type = 'complained'
    AND e.created_at >= now() - interval '30 days';

  IF v_sent_30d >= 200 AND (v_complaints_30d::numeric / v_sent_30d::numeric) > 0.0008 THEN
    RETURN QUERY SELECT false, 'global_complaint_threshold_exceeded';
    RETURN;
  END IF;

  RETURN QUERY SELECT true, 'ok';
END;
$$;


-- 7) Enqueue RPC with policy checks
CREATE OR REPLACE FUNCTION public.queue_lifecycle_email(
  p_user_id uuid,
  p_recipient_email text,
  p_recipient_name text,
  p_segment text,
  p_campaign_key text,
  p_flow_key text,
  p_template_key text,
  p_send_category text,
  p_subject text,
  p_body_html text,
  p_body_text text DEFAULT NULL,
  p_from_address text DEFAULT NULL,
  p_reply_to text DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_scheduled_for timestamptz DEFAULT now(),
  p_idempotency_key text DEFAULT NULL
)
RETURNS TABLE (queue_id uuid, status text, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_recipient_email));
  v_can_send record;
  v_id uuid;
  v_status text := 'queued';
  v_reason text := 'ok';
BEGIN
  IF p_send_category NOT IN ('marketing', 'transactional') THEN
    RAISE EXCEPTION 'Invalid send_category: %', p_send_category;
  END IF;

  IF p_subject IS NULL OR p_subject = '' THEN
    RAISE EXCEPTION 'Subject is required';
  END IF;

  IF p_body_html IS NULL OR p_body_html = '' THEN
    RAISE EXCEPTION 'body_html is required';
  END IF;

  IF v_email IS NULL OR v_email = '' THEN
    v_email := NULL;
  END IF;

  IF p_send_category = 'marketing' THEN
    SELECT * INTO v_can_send
    FROM public.can_send_marketing_email(p_user_id, v_email, p_scheduled_for)
    LIMIT 1;

    IF COALESCE(v_can_send.eligible, false) = false THEN
      v_status := 'suppressed';
      v_reason := COALESCE(v_can_send.reason, 'suppressed');
    END IF;
  END IF;

  INSERT INTO public.lifecycle_email_queue (
    user_id,
    recipient_email,
    recipient_name,
    segment,
    campaign_key,
    flow_key,
    template_key,
    send_category,
    subject,
    body_html,
    body_text,
    from_address,
    reply_to,
    payload,
    scheduled_for,
    status,
    suppression_reason,
    idempotency_key
  )
  VALUES (
    p_user_id,
    v_email,
    p_recipient_name,
    p_segment,
    p_campaign_key,
    p_flow_key,
    p_template_key,
    p_send_category,
    p_subject,
    p_body_html,
    p_body_text,
    p_from_address,
    p_reply_to,
    COALESCE(p_payload, '{}'::jsonb),
    COALESCE(p_scheduled_for, now()),
    v_status,
    CASE WHEN v_status = 'suppressed' THEN v_reason ELSE NULL END,
    p_idempotency_key
  )
  ON CONFLICT (idempotency_key)
  WHERE idempotency_key IS NOT NULL
  DO UPDATE SET updated_at = now()
  RETURNING id INTO v_id;

  IF v_status = 'suppressed' THEN
    INSERT INTO public.lifecycle_email_log (
      queue_id, user_id, recipient_email, segment, campaign_key, flow_key, template_key,
      send_category, status, suppression_reason, subject
    )
    VALUES (
      v_id, p_user_id, COALESCE(v_email, ''), p_segment, p_campaign_key, p_flow_key, p_template_key,
      p_send_category, 'suppressed', v_reason, p_subject
    );
  END IF;

  RETURN QUERY SELECT v_id, v_status, v_reason;
END;
$$;

GRANT EXECUTE ON FUNCTION public.queue_lifecycle_email(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text, jsonb, timestamptz, text
) TO authenticated;


-- 8) Queue claim RPC (safe batched worker lock)
CREATE OR REPLACE FUNCTION public.claim_lifecycle_queue_batch(p_limit integer DEFAULT 50)
RETURNS SETOF public.lifecycle_email_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH cte AS (
    SELECT q.id
    FROM public.lifecycle_email_queue q
    WHERE q.status = 'queued'
      AND q.scheduled_for <= now()
      AND q.retry_count <= q.max_retries
    ORDER BY q.scheduled_for ASC
    FOR UPDATE SKIP LOCKED
    LIMIT GREATEST(1, COALESCE(p_limit, 50))
  )
  UPDATE public.lifecycle_email_queue q
  SET status = 'processing',
      processing_started_at = now(),
      updated_at = now()
  FROM cte
  WHERE q.id = cte.id
  RETURNING q.*;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_lifecycle_queue_batch(integer) TO authenticated;


-- 9) Webhook ingestion helper (suppression automation)
CREATE OR REPLACE FUNCTION public.log_email_provider_event(
  p_provider text,
  p_provider_event_id text,
  p_recipient_email text,
  p_event_type text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_email text := lower(trim(p_recipient_email));
  v_soft_bounce_count int;
BEGIN
  INSERT INTO public.email_provider_events (
    provider,
    provider_event_id,
    recipient_email,
    event_type,
    payload
  )
  VALUES (
    COALESCE(NULLIF(p_provider, ''), 'resend'),
    p_provider_event_id,
    v_email,
    p_event_type,
    COALESCE(p_payload, '{}'::jsonb)
  )
  ON CONFLICT (provider, provider_event_id)
  DO UPDATE SET payload = EXCLUDED.payload
  RETURNING id INTO v_id;

  -- Immediate permanent suppression for hard bounce or complaint
  IF p_event_type IN ('bounced_hard', 'complained') AND v_email IS NOT NULL THEN
    INSERT INTO public.email_suppressions (email, reason, details)
    VALUES (
      v_email,
      CASE WHEN p_event_type = 'complained' THEN 'spam_complaint' ELSE 'hard_bounce' END,
      jsonb_build_object('source', 'provider_event', 'event_type', p_event_type, 'event_id', p_provider_event_id)
    )
    ON CONFLICT (email, reason, is_active) DO NOTHING;
  END IF;

  -- Soft-bounce suppression after 3 in 14 days
  IF p_event_type = 'bounced_soft' AND v_email IS NOT NULL THEN
    SELECT count(*) INTO v_soft_bounce_count
    FROM public.email_provider_events e
    WHERE lower(e.recipient_email) = v_email
      AND e.event_type = 'bounced_soft'
      AND e.created_at >= now() - interval '14 days';

    IF v_soft_bounce_count >= 3 THEN
      INSERT INTO public.email_suppressions (email, reason, details)
      VALUES (
        v_email,
        'soft_bounce_3x_14d',
        jsonb_build_object('source', 'provider_event', 'count', v_soft_bounce_count)
      )
      ON CONFLICT (email, reason, is_active) DO NOTHING;
    END IF;
  END IF;

  RETURN v_id;
END;
$$;


-- 10) One-click unsubscribe helper
CREATE OR REPLACE FUNCTION public.unsubscribe_marketing_email(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
BEGIN
  IF v_email IS NULL OR v_email = '' THEN
    RETURN;
  END IF;

  -- Update newsletter subscribers immediately
  UPDATE public.newsletter_subscribers
  SET is_active = false,
      unsubscribed_at = COALESCE(unsubscribed_at, now())
  WHERE lower(email) = v_email;

  -- Add suppression marker for audit/compliance
  INSERT INTO public.email_suppressions (email, reason, details)
  VALUES (
    v_email,
    'manual_unsubscribe',
    jsonb_build_object('source', 'one_click_unsubscribe')
  )
  ON CONFLICT (email, reason, is_active) DO NOTHING;

  -- If user exists, update preferences
  UPDATE public.marketing_preferences mp
  SET marketing_opt_in = false,
      newsletter_opt_in = false,
      updated_at = now(),
      source = COALESCE(mp.source, 'unsubscribe_link'),
      updated_by = 'system'
  WHERE mp.user_id IN (
    SELECT id FROM auth.users WHERE lower(email) = v_email
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.unsubscribe_marketing_email(text) TO anon, authenticated;
