-- Sample Google Trends Keyword Data for Testing Dashboard
-- Run this in Supabase SQL Editor to populate test data

-- Clear existing test data (optional)
-- DELETE FROM keyword_trends WHERE date >= '2026-06-01';
-- DELETE FROM keyword_insights WHERE created_at >= '2026-06-01T00:00:00';

-- Insert sample keyword trends (last 30 days)
INSERT INTO keyword_trends (keyword, score, date, week_avg, month_avg, peak_detected, week_over_week_change, day_over_day_change, data_source)
VALUES
  -- gay massage therapist (trending hot)
  ('gay massage therapist', 78, '2026-05-16', 65.0, 60.0, false, 8.0, 2, 'google_trends'),
  ('gay massage therapist', 82, '2026-05-17', 68.0, 62.0, false, 10.0, 4, 'google_trends'),
  ('gay massage therapist', 85, '2026-05-18', 70.0, 64.0, false, 15.0, 3, 'google_trends'),
  ('gay massage therapist', 88, '2026-05-19', 72.0, 66.0, false, 18.0, 3, 'google_trends'),
  ('gay massage therapist', 92, '2026-05-20', 75.0, 68.0, true, 25.0, 4, 'google_trends'),
  ('gay massage therapist', 95, '2026-05-21', 78.0, 70.0, true, 32.0, 3, 'google_trends'),
  ('gay massage therapist', 98, '2026-06-15', 82.0, 75.0, true, 28.0, 3, 'google_trends'),

  -- massage near me (steady)
  ('massage near me', 72, '2026-05-16', 68.0, 65.0, false, 5.0, 1, 'google_trends'),
  ('massage near me', 74, '2026-05-17', 69.0, 66.0, false, 6.0, 2, 'google_trends'),
  ('massage near me', 76, '2026-05-18', 70.0, 67.0, false, 8.0, 2, 'google_trends'),
  ('massage near me', 78, '2026-05-19', 71.0, 68.0, false, 10.0, 2, 'google_trends'),
  ('massage near me', 80, '2026-05-20', 72.0, 69.0, false, 12.0, 2, 'google_trends'),
  ('massage near me', 82, '2026-05-21', 73.0, 70.0, false, 14.0, 2, 'google_trends'),
  ('massage near me', 96, '2026-06-15', 78.0, 72.0, true, 8.0, 14, 'google_trends'),

  -- LGBTQ massage (emerging)
  ('LGBTQ massage', 42, '2026-05-16', 38.0, 35.0, false, -5.0, 1, 'google_trends'),
  ('LGBTQ massage', 45, '2026-05-17', 40.0, 36.0, false, -2.0, 3, 'google_trends'),
  ('LGBTQ massage', 48, '2026-05-18', 42.0, 37.0, false, 0.0, 3, 'google_trends'),
  ('LGBTQ massage', 52, '2026-05-19', 45.0, 39.0, false, 5.0, 4, 'google_trends'),
  ('LGBTQ massage', 58, '2026-05-20', 48.0, 41.0, false, 12.0, 6, 'google_trends'),
  ('LGBTQ massage', 65, '2026-05-21', 52.0, 43.0, false, 22.0, 7, 'google_trends'),
  ('LGBTQ massage', 72, '2026-06-15', 62.0, 50.0, false, 31.0, 7, 'google_trends'),

  -- massage therapist (stable)
  ('massage therapist', 68, '2026-05-16', 65.0, 62.0, false, 2.0, 1, 'google_trends'),
  ('massage therapist', 70, '2026-05-17', 66.0, 63.0, false, 3.0, 2, 'google_trends'),
  ('massage therapist', 72, '2026-05-18', 67.0, 64.0, false, 4.0, 2, 'google_trends'),
  ('massage therapist', 74, '2026-05-19', 68.0, 65.0, false, 5.0, 2, 'google_trends'),
  ('massage therapist', 75, '2026-05-20', 69.0, 66.0, false, 6.0, 1, 'google_trends'),
  ('massage therapist', 76, '2026-05-21', 70.0, 67.0, false, 7.0, 1, 'google_trends'),
  ('massage therapist', 85, '2026-06-15', 73.0, 68.0, false, -2.0, 9, 'google_trends'),

  -- professional massage (declining slightly)
  ('professional massage', 62, '2026-05-16', 65.0, 68.0, false, -2.0, -1, 'google_trends'),
  ('professional massage', 61, '2026-05-17', 64.0, 67.0, false, -3.0, -1, 'google_trends'),
  ('professional massage', 60, '2026-05-18', 63.0, 66.0, false, -5.0, -1, 'google_trends'),
  ('professional massage', 62, '2026-05-19', 62.0, 65.0, false, -3.0, 2, 'google_trends'),
  ('professional massage', 65, '2026-05-20', 62.0, 64.0, false, 2.0, 3, 'google_trends'),
  ('professional massage', 68, '2026-05-21', 63.0, 64.0, false, 5.0, 3, 'google_trends'),
  ('professional massage', 75, '2026-06-15', 65.0, 63.0, false, 2.0, 7, 'google_trends'),

  -- deep tissue massage (seasonal)
  ('deep tissue massage', 58, '2026-05-16', 55.0, 50.0, false, 8.0, 1, 'google_trends'),
  ('deep tissue massage', 60, '2026-05-17', 57.0, 52.0, false, 10.0, 2, 'google_trends'),
  ('deep tissue massage', 62, '2026-05-18', 59.0, 54.0, false, 12.0, 2, 'google_trends'),
  ('deep tissue massage', 65, '2026-05-19', 61.0, 56.0, false, 15.0, 3, 'google_trends'),
  ('deep tissue massage', 68, '2026-05-20', 63.0, 58.0, false, 18.0, 3, 'google_trends'),
  ('deep tissue massage', 72, '2026-05-21', 65.0, 60.0, false, 22.0, 4, 'google_trends'),
  ('deep tissue massage', 78, '2026-06-15', 70.0, 63.0, false, 5.0, 6, 'google_trends'),

  -- outcall massage (niche)
  ('outcall massage', 45, '2026-05-16', 42.0, 40.0, false, 3.0, 1, 'google_trends'),
  ('outcall massage', 48, '2026-05-17', 44.0, 41.0, false, 5.0, 3, 'google_trends'),
  ('outcall massage', 52, '2026-05-18', 47.0, 43.0, false, 8.0, 4, 'google_trends'),
  ('outcall massage', 55, '2026-05-19', 49.0, 45.0, false, 10.0, 3, 'google_trends'),
  ('outcall massage', 58, '2026-05-20', 51.0, 47.0, false, 12.0, 3, 'google_trends'),
  ('outcall massage', 62, '2026-05-21', 54.0, 49.0, false, 15.0, 4, 'google_trends'),
  ('outcall massage', 68, '2026-06-15', 59.0, 52.0, false, 10.0, 6, 'google_trends');

-- Insert sample insights
INSERT INTO keyword_insights (keyword, insight_type, title, description, action_recommended, priority, status, created_at)
VALUES
  ('gay massage therapist', 'peak', 'Critical Peak Detected',
   'gay massage therapist peaked at 98/100 on 2026-06-15. This is a critical trending opportunity.',
   'CREATE BLOG POST: "Top Gay Massage Therapists Near Me - 2026 Guide" + Update city pages + Add rich schema',
   'critical', 'new', NOW()),

  ('massage near me', 'peak', 'Major Peak Detected',
   'massage near me surged to 96/100. Strong consistent demand from searchers.',
   'UPDATE: Existing "Massage Near Me" page + Add local SEO optimizations + Increase paid ads',
   'high', 'new', NOW()),

  ('LGBTQ massage', 'trend', 'Emerging Trending Keyword',
   'LGBTQ massage is emerging with 31% week-over-week growth. This is a new market opportunity.',
   'WRITE NEW BLOG: "Creating Safe Spaces: LGBTQ Affirming Massage Therapy" + Update homepage mention',
   'high', 'new', NOW()),

  ('gay massage therapist', 'trend', 'Sustained High Demand',
   'gay massage therapist maintaining 85+ score. Keyword continues to show strong interest.',
   'MAINTAIN: Keep content fresh and prominent + Continue paid campaigns targeting this phrase',
   'medium', 'new', NOW()),

  ('deep tissue massage', 'trend', 'Seasonal Growth Pattern',
   'deep tissue massage growing 22% week-over-week. Shows seasonal demand increase.',
   'CREATE CONTENT: "Deep Tissue Massage Benefits + How to Find Best Therapist" blog series',
   'medium', 'new', NOW()),

  ('LGBTQ massage', 'opportunity', 'New Market Opportunity',
   'First time LGBTQ massage keyword reached 70+. Represents untapped market opportunity.',
   'STRATEGIC OPPORTUNITY: Consider focusing marketing efforts on LGBTQ community + create dedicated landing page',
   'high', 'new', NOW());

-- Verify data was inserted
SELECT 'Keyword Trends Records' as section, COUNT(*) as count FROM keyword_trends
UNION ALL
SELECT 'Keyword Insights Records', COUNT(*) FROM keyword_insights;

-- View sample data
SELECT
  keyword,
  score,
  date,
  week_avg,
  peak_detected,
  week_over_week_change
FROM keyword_trends
WHERE date >= '2026-06-01'
ORDER BY date DESC, score DESC
LIMIT 20;

-- View insights
SELECT
  keyword,
  insight_type,
  title,
  priority,
  status,
  created_at
FROM keyword_insights
ORDER BY priority DESC, created_at DESC;
