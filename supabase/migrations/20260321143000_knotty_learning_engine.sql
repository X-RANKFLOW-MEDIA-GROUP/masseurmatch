CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.ranking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  therapist_id uuid NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  event_name text NOT NULL CHECK (
    event_name IN (
      'knotty_open',
      'knotty_recommendation_shown',
      'knotty_profile_clicked',
      'knotty_contact_clicked',
      'knotty_call_clicked',
      'knotty_text_clicked',
      'knotty_whatsapp_clicked',
      'profile_viewed',
      'search_submitted',
      'filter_applied'
    )
  ),
  city text NULL,
  neighborhood text NULL,
  intent text NOT NULL DEFAULT 'general' CHECK (
    intent IN (
      'available_now',
      'mobile',
      'verified',
      'budget',
      'premium',
      'nearby',
      'technique',
      'travel',
      'help_choose',
      'general'
    )
  ),
  device_type text NULL CHECK (
    device_type IS NULL OR device_type IN ('mobile', 'tablet', 'desktop', 'unknown')
  ),
  position_in_results integer NULL,
  recommendation_source text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_ranking_events_created_at
  ON public.ranking_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ranking_events_session
  ON public.ranking_events (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ranking_events_therapist
  ON public.ranking_events (therapist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ranking_events_name
  ON public.ranking_events (event_name, created_at DESC);

ALTER TABLE public.ranking_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.therapist_learning_scores (
  therapist_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  city text NOT NULL DEFAULT '__all__',
  intent text NOT NULL DEFAULT 'general' CHECK (
    intent IN (
      'available_now',
      'mobile',
      'verified',
      'budget',
      'premium',
      'nearby',
      'technique',
      'travel',
      'help_choose',
      'general'
    )
  ),
  impressions integer NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  profile_clicks integer NOT NULL DEFAULT 0 CHECK (profile_clicks >= 0),
  contact_clicks integer NOT NULL DEFAULT 0 CHECK (contact_clicks >= 0),
  ctr numeric NOT NULL DEFAULT 0,
  contact_rate numeric NOT NULL DEFAULT 0,
  intent_conversion_rate numeric NOT NULL DEFAULT 0,
  score_7d numeric NOT NULL DEFAULT 0,
  score_30d numeric NOT NULL DEFAULT 0,
  weighted_score numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (therapist_id, city, intent)
);

CREATE INDEX IF NOT EXISTS idx_therapist_learning_scores_weighted
  ON public.therapist_learning_scores (weighted_score DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_therapist_learning_scores_city_intent
  ON public.therapist_learning_scores (city, intent, weighted_score DESC);

ALTER TABLE public.therapist_learning_scores ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.refresh_knotty_learning_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH base_events AS (
    SELECT
      therapist_id,
      COALESCE(NULLIF(TRIM(city), ''), '__all__') AS city_bucket,
      COALESCE(NULLIF(TRIM(intent), ''), 'general') AS intent_bucket,
      event_name,
      created_at
    FROM public.ranking_events
    WHERE therapist_id IS NOT NULL
      AND created_at >= timezone('utc', now()) - interval '30 days'
  ),
  expanded_events AS (
    SELECT therapist_id, city_bucket AS city, intent_bucket AS intent, event_name, created_at FROM base_events
    UNION ALL
    SELECT therapist_id, '__all__' AS city, intent_bucket AS intent, event_name, created_at FROM base_events
    UNION ALL
    SELECT therapist_id, city_bucket AS city, 'general' AS intent, event_name, created_at FROM base_events
    UNION ALL
    SELECT therapist_id, '__all__' AS city, 'general' AS intent, event_name, created_at FROM base_events
  ),
  aggregate_30d AS (
    SELECT
      therapist_id,
      city,
      intent,
      COUNT(*) FILTER (WHERE event_name = 'knotty_recommendation_shown') AS impressions_30d,
      COUNT(*) FILTER (WHERE event_name = 'knotty_profile_clicked') AS profile_clicks_30d,
      COUNT(*) FILTER (
        WHERE event_name IN (
          'knotty_contact_clicked',
          'knotty_call_clicked',
          'knotty_text_clicked',
          'knotty_whatsapp_clicked'
        )
      ) AS contact_clicks_30d,
      COUNT(*) FILTER (WHERE event_name = 'knotty_contact_clicked') AS generic_contact_clicks_30d,
      COUNT(*) FILTER (
        WHERE event_name IN ('knotty_call_clicked', 'knotty_text_clicked', 'knotty_whatsapp_clicked')
      ) AS direct_contact_clicks_30d
    FROM expanded_events
    GROUP BY therapist_id, city, intent
  ),
  aggregate_7d AS (
    SELECT
      therapist_id,
      city,
      intent,
      COUNT(*) FILTER (WHERE event_name = 'knotty_recommendation_shown') AS impressions_7d,
      COUNT(*) FILTER (WHERE event_name = 'knotty_profile_clicked') AS profile_clicks_7d,
      COUNT(*) FILTER (
        WHERE event_name IN (
          'knotty_contact_clicked',
          'knotty_call_clicked',
          'knotty_text_clicked',
          'knotty_whatsapp_clicked'
        )
      ) AS contact_clicks_7d,
      COUNT(*) FILTER (WHERE event_name = 'knotty_contact_clicked') AS generic_contact_clicks_7d,
      COUNT(*) FILTER (
        WHERE event_name IN ('knotty_call_clicked', 'knotty_text_clicked', 'knotty_whatsapp_clicked')
      ) AS direct_contact_clicks_7d
    FROM expanded_events
    WHERE created_at >= timezone('utc', now()) - interval '7 days'
    GROUP BY therapist_id, city, intent
  ),
  merged AS (
    SELECT
      a30.therapist_id,
      a30.city,
      a30.intent,
      a30.impressions_30d,
      a30.profile_clicks_30d,
      a30.contact_clicks_30d,
      COALESCE(a7.impressions_7d, 0) AS impressions_7d,
      COALESCE(a7.profile_clicks_7d, 0) AS profile_clicks_7d,
      COALESCE(a7.contact_clicks_7d, 0) AS contact_clicks_7d,
      COALESCE(a30.generic_contact_clicks_30d, 0) AS generic_contact_clicks_30d,
      COALESCE(a30.direct_contact_clicks_30d, 0) AS direct_contact_clicks_30d,
      COALESCE(a7.generic_contact_clicks_7d, 0) AS generic_contact_clicks_7d,
      COALESCE(a7.direct_contact_clicks_7d, 0) AS direct_contact_clicks_7d
    FROM aggregate_30d a30
    LEFT JOIN aggregate_7d a7
      ON a7.therapist_id = a30.therapist_id
     AND a7.city = a30.city
     AND a7.intent = a30.intent
  ),
  scored AS (
    SELECT
      therapist_id,
      city,
      intent,
      impressions_30d AS impressions,
      profile_clicks_30d AS profile_clicks,
      contact_clicks_30d AS contact_clicks,
      LEAST(1, COALESCE(profile_clicks_30d::numeric / NULLIF(impressions_30d, 0), 0)) AS ctr_30d,
      LEAST(1, COALESCE(contact_clicks_30d::numeric / NULLIF(impressions_30d, 0), 0)) AS contact_rate_30d,
      LEAST(
        1,
        COALESCE(
          (
            (profile_clicks_30d * 1) +
            (generic_contact_clicks_30d * 3) +
            (direct_contact_clicks_30d * 6)
          )::numeric / NULLIF(impressions_30d, 0),
          0
        )
      ) AS intent_conversion_rate_30d,
      LEAST(1, COALESCE(profile_clicks_7d::numeric / NULLIF(impressions_7d, 0), 0)) AS ctr_7d,
      LEAST(1, COALESCE(contact_clicks_7d::numeric / NULLIF(impressions_7d, 0), 0)) AS contact_rate_7d,
      LEAST(
        1,
        COALESCE(
          (
            (profile_clicks_7d * 1) +
            (generic_contact_clicks_7d * 3) +
            (direct_contact_clicks_7d * 6)
          )::numeric / NULLIF(impressions_7d, 0),
          0
        )
      ) AS intent_conversion_rate_7d,
      LEAST(1, COALESCE(impressions_7d::numeric / NULLIF(impressions_30d, 0), 0)) AS recency_boost
    FROM merged
  )
  INSERT INTO public.therapist_learning_scores (
    therapist_id,
    city,
    intent,
    impressions,
    profile_clicks,
    contact_clicks,
    ctr,
    contact_rate,
    intent_conversion_rate,
    score_7d,
    score_30d,
    weighted_score,
    updated_at
  )
  SELECT
    therapist_id,
    city,
    intent,
    impressions,
    profile_clicks,
    contact_clicks,
    ROUND(ctr_30d, 6),
    ROUND(contact_rate_30d, 6),
    ROUND(intent_conversion_rate_30d, 6),
    ROUND((ctr_7d * 0.30) + (contact_rate_7d * 0.45) + (intent_conversion_rate_7d * 0.15) + (recency_boost * 0.10), 6),
    ROUND((ctr_30d * 0.30) + (contact_rate_30d * 0.45) + (intent_conversion_rate_30d * 0.15) + (recency_boost * 0.10), 6),
    ROUND(
      (
        ((ctr_7d * 0.30) + (contact_rate_7d * 0.45) + (intent_conversion_rate_7d * 0.15) + (recency_boost * 0.10)) * 0.60
      ) +
      (
        ((ctr_30d * 0.30) + (contact_rate_30d * 0.45) + (intent_conversion_rate_30d * 0.15) + (recency_boost * 0.10)) * 0.40
      ),
      6
    ),
    timezone('utc', now())
  FROM scored
  ON CONFLICT (therapist_id, city, intent) DO UPDATE
  SET
    impressions = EXCLUDED.impressions,
    profile_clicks = EXCLUDED.profile_clicks,
    contact_clicks = EXCLUDED.contact_clicks,
    ctr = EXCLUDED.ctr,
    contact_rate = EXCLUDED.contact_rate,
    intent_conversion_rate = EXCLUDED.intent_conversion_rate,
    score_7d = EXCLUDED.score_7d,
    score_30d = EXCLUDED.score_30d,
    weighted_score = EXCLUDED.weighted_score,
    updated_at = EXCLUDED.updated_at;

  DELETE FROM public.therapist_learning_scores
  WHERE updated_at < timezone('utc', now()) - interval '45 days';
END;
$$;

DO $$
DECLARE
  _job_id bigint;
BEGIN
  SELECT jobid INTO _job_id FROM cron.job WHERE jobname = 'knotty_learning_refresh_hourly';
  IF _job_id IS NOT NULL THEN
    PERFORM cron.unschedule(_job_id);
  END IF;

  PERFORM cron.schedule(
    'knotty_learning_refresh_hourly',
    '17 * * * *',
    'SELECT public.refresh_knotty_learning_scores();'
  );
END $$;
