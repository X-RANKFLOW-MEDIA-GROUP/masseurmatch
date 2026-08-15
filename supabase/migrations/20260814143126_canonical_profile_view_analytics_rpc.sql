CREATE OR REPLACE FUNCTION public.get_profile_view_analytics(
  p_profile_id uuid,
  p_since timestamptz
)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
WITH bounds AS (
  SELECT
    p_since AS since_ts,
    date_trunc('day', p_since AT TIME ZONE 'UTC')::date AS since_day,
    date_trunc('day', now() AT TIME ZONE 'UTC')::date AS today_day
),
days AS (
  SELECT generate_series(b.since_day, b.today_day, interval '1 day')::date AS day
  FROM bounds b
),
daily AS (
  SELECT
    (e.created_at AT TIME ZONE 'UTC')::date AS day,
    count(*)::bigint AS views
  FROM public.profile_view_analytics e, bounds b
  WHERE e.profile_id = p_profile_id
    AND e.created_at >= b.since_ts
  GROUP BY 1
),
summary AS (
  SELECT
    count(*) FILTER (WHERE e.created_at >= b.since_ts)::bigint AS window_views,
    count(DISTINCT e.session_id) FILTER (
      WHERE e.created_at >= b.since_ts AND e.session_id IS NOT NULL
    )::bigint AS window_unique_visitors,
    count(*)::bigint AS all_time_views
  FROM public.profile_view_analytics e, bounds b
  WHERE e.profile_id = p_profile_id
)
SELECT jsonb_build_object(
  'series', COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object('date', d.day::text, 'views', COALESCE(v.views, 0))
      ORDER BY d.day
    )
    FROM days d
    LEFT JOIN daily v ON v.day = d.day
  ), '[]'::jsonb),
  'windowViews', COALESCE((SELECT window_views FROM summary), 0),
  'windowUniqueVisitors', COALESCE((SELECT window_unique_visitors FROM summary), 0),
  'allTimeViews', COALESCE((SELECT all_time_views FROM summary), 0)
);
$$;
