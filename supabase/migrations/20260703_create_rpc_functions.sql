-- RPC Functions for Keyword Trends Processing

-- Function to generate insights from recent peaks
CREATE OR REPLACE FUNCTION generate_keyword_insights()
RETURNS TABLE (insights_created INT) AS $$
DECLARE
  v_insights_created INT := 0;
  v_peak_records RECORD;
BEGIN
  -- Get peaks from the last 7 days
  FOR v_peak_records IN
    SELECT DISTINCT
      kt.keyword,
      MAX(kt.score) as max_score,
      MAX(kt.date) as latest_date,
      AVG(kt.score) as avg_score
    FROM keyword_trends kt
    WHERE kt.date >= CURRENT_DATE - INTERVAL '7 days'
      AND kt.peak_detected = TRUE
    GROUP BY kt.keyword
  LOOP
    -- Check if insight already exists
    IF NOT EXISTS (
      SELECT 1 FROM keyword_insights
      WHERE keyword = v_peak_records.keyword
        AND created_at >= CURRENT_DATE
        AND insight_type = 'peak'
    ) THEN
      -- Create peak insight
      INSERT INTO keyword_insights (
        keyword,
        insight_type,
        title,
        description,
        action_recommended,
        priority,
        status,
        created_at
      ) VALUES (
        v_peak_records.keyword,
        'peak',
        'Peak Detected: ' || v_peak_records.keyword,
        v_peak_records.keyword || ' peaked at ' || v_peak_records.max_score || '/100 on ' || v_peak_records.latest_date,
        'Create blog post or update content for "' || v_peak_records.keyword || '"',
        CASE WHEN v_peak_records.max_score > 95 THEN 'critical' ELSE 'high' END,
        'new',
        NOW()
      );

      v_insights_created := v_insights_created + 1;
    END IF;
  END LOOP;

  -- Get trending keywords (high week-over-week growth)
  FOR v_peak_records IN
    SELECT DISTINCT
      kt.keyword,
      MAX(kt.week_over_week_change) as max_change,
      MAX(kt.score) as current_score,
      MAX(kt.date) as latest_date
    FROM keyword_trends kt
    WHERE kt.date >= CURRENT_DATE - INTERVAL '7 days'
      AND kt.week_over_week_change > 20
    GROUP BY kt.keyword
    HAVING MAX(kt.score) >= 60
  LOOP
    -- Check if insight already exists
    IF NOT EXISTS (
      SELECT 1 FROM keyword_insights
      WHERE keyword = v_peak_records.keyword
        AND created_at >= CURRENT_DATE
        AND insight_type = 'trend'
    ) THEN
      -- Create trend insight
      INSERT INTO keyword_insights (
        keyword,
        insight_type,
        title,
        description,
        action_recommended,
        priority,
        status,
        created_at
      ) VALUES (
        v_peak_records.keyword,
        'trend',
        'Trending: ' || v_peak_records.keyword,
        v_peak_records.keyword || ' is growing ' || ROUND(v_peak_records.max_change::numeric, 1) || '% week-over-week',
        'Create new content or expand existing content for "' || v_peak_records.keyword || '"',
        'high',
        'new',
        NOW()
      );

      v_insights_created := v_insights_created + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_insights_created;
END;
$$ LANGUAGE plpgsql;

-- Function to get top trending keywords
CREATE OR REPLACE FUNCTION get_top_trending_keywords(
  p_limit INT DEFAULT 10,
  p_days INT DEFAULT 7
)
RETURNS TABLE (
  keyword VARCHAR,
  current_score INT,
  week_avg NUMERIC,
  trend_direction VARCHAR,
  peak_detected BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (kt.keyword)
    kt.keyword,
    kt.score::INT,
    ROUND(AVG(kt.score) OVER (PARTITION BY kt.keyword), 2),
    CASE
      WHEN kt.week_over_week_change > 10 THEN 'up'
      WHEN kt.week_over_week_change < -10 THEN 'down'
      ELSE 'stable'
    END,
    kt.peak_detected
  FROM keyword_trends kt
  WHERE kt.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  ORDER BY kt.keyword, kt.date DESC, kt.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get insight recommendations
CREATE OR REPLACE FUNCTION get_insight_recommendations(p_priority VARCHAR DEFAULT 'high')
RETURNS TABLE (
  keyword VARCHAR,
  insight_type VARCHAR,
  action VARCHAR,
  priority VARCHAR,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ki.keyword,
    ki.insight_type,
    ki.action_recommended,
    ki.priority,
    ki.created_at
  FROM keyword_insights ki
  WHERE ki.priority = p_priority
    AND ki.status = 'new'
    AND ki.created_at >= CURRENT_DATE
  ORDER BY ki.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to mark insight as actioned
CREATE OR REPLACE FUNCTION mark_insight_completed(
  p_insight_id UUID,
  p_action_taken TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE keyword_insights
  SET
    status = 'completed',
    action_taken = COALESCE(p_action_taken, action_taken),
    updated_at = NOW()
  WHERE id = p_insight_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate keyword stats
CREATE OR REPLACE FUNCTION calculate_keyword_stats(p_keyword VARCHAR)
RETURNS TABLE (
  keyword VARCHAR,
  current_score INT,
  peak_score INT,
  avg_score NUMERIC,
  day_over_day_change INT,
  week_over_week_change NUMERIC,
  month_over_month_change NUMERIC,
  days_tracked INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kt.keyword,
    kt.score::INT,
    MAX(kt.score)::INT,
    ROUND(AVG(kt.score)::NUMERIC, 2),
    (kt.score - LAG(kt.score) OVER (ORDER BY kt.date))::INT,
    ROUND(
      ((AVG(kt.score) FILTER (WHERE kt.date >= CURRENT_DATE - INTERVAL '7 days') -
        AVG(kt.score) FILTER (WHERE kt.date >= CURRENT_DATE - INTERVAL '14 days' AND kt.date < CURRENT_DATE - INTERVAL '7 days')) /
       NULLIF(AVG(kt.score) FILTER (WHERE kt.date >= CURRENT_DATE - INTERVAL '14 days' AND kt.date < CURRENT_DATE - INTERVAL '7 days'), 0) * 100)::NUMERIC,
      2
    ),
    ROUND(
      ((AVG(kt.score) FILTER (WHERE kt.date >= CURRENT_DATE - INTERVAL '30 days') -
        AVG(kt.score) FILTER (WHERE kt.date >= CURRENT_DATE - INTERVAL '60 days' AND kt.date < CURRENT_DATE - INTERVAL '30 days')) /
       NULLIF(AVG(kt.score) FILTER (WHERE kt.date >= CURRENT_DATE - INTERVAL '60 days' AND kt.date < CURRENT_DATE - INTERVAL '30 days'), 0) * 100)::NUMERIC,
      2
    ),
    COUNT(DISTINCT kt.date)::INT
  FROM keyword_trends kt
  WHERE kt.keyword = p_keyword
  GROUP BY kt.keyword, kt.score
  ORDER BY kt.date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
