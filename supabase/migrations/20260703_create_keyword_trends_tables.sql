-- Keyword Trends Tables for Google Trends Monitoring

-- Main keyword trends table
CREATE TABLE IF NOT EXISTS keyword_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core data
  keyword VARCHAR(255) NOT NULL,
  score INT CHECK (score >= 0 AND score <= 100) NOT NULL,
  date DATE NOT NULL,

  -- Location (optional, for city-specific tracking)
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(100) DEFAULT 'USA',

  -- Calculated fields
  week_avg NUMERIC(5,2),
  month_avg NUMERIC(5,2),
  peak_detected BOOLEAN DEFAULT FALSE,
  peak_date DATE,
  peak_score INT,

  -- Trend direction
  day_over_day_change INT,
  week_over_week_change NUMERIC(5,2),
  month_over_month_change NUMERIC(5,2),
  yoy_change NUMERIC(5,2),

  -- Metadata
  data_source VARCHAR(50) DEFAULT 'google_trends',
  confidence_score NUMERIC(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_keyword_date UNIQUE(keyword, date, city)
);

-- Keyword insights table
CREATE TABLE IF NOT EXISTS keyword_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  keyword VARCHAR(255) NOT NULL,
  insight_type VARCHAR(50) NOT NULL,

  -- Insight content
  title VARCHAR(255),
  description TEXT,
  action_recommended TEXT,
  content_ideas TEXT[],

  -- Priority & status
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'new',

  -- Associated content
  related_keyword_date DATE,
  content_created BOOLEAN DEFAULT FALSE,
  blog_post_id UUID,
  page_updated BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Keyword alerts table
CREATE TABLE IF NOT EXISTS keyword_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  keyword VARCHAR(255) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,

  trigger_score INT,
  trigger_date TIMESTAMP,
  previous_score INT,
  change_percentage NUMERIC(5,2),

  -- Alert status
  sent BOOLEAN DEFAULT FALSE,
  sent_via TEXT[],
  acknowledged BOOLEAN DEFAULT FALSE,
  action_taken TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Keyword content map table
CREATE TABLE IF NOT EXISTS keyword_content_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  keyword VARCHAR(255) NOT NULL,
  content_type VARCHAR(50),
  content_url VARCHAR(500),

  is_current BOOLEAN DEFAULT TRUE,
  last_updated DATE,
  traffic_impact NUMERIC(8,2),

  -- SEO metrics
  current_ranking INT,
  target_ranking INT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_keyword_trends_keyword_date ON keyword_trends(keyword, date DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_trends_peak_detected ON keyword_trends(peak_detected) WHERE peak_detected = TRUE;
CREATE INDEX IF NOT EXISTS idx_keyword_trends_date ON keyword_trends(date DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_trends_keyword ON keyword_trends(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_trends_city_date ON keyword_trends(city, date) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_keyword_insights_keyword ON keyword_insights(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_insights_status ON keyword_insights(status);
CREATE INDEX IF NOT EXISTS idx_keyword_insights_priority ON keyword_insights(priority);
CREATE INDEX IF NOT EXISTS idx_keyword_alerts_keyword ON keyword_alerts(keyword);

-- Enable Row Level Security
ALTER TABLE keyword_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_content_map ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated reads for dashboards
CREATE POLICY "allow_read_keyword_trends" ON keyword_trends
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "allow_read_keyword_insights" ON keyword_insights
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "allow_read_keyword_alerts" ON keyword_alerts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "allow_read_keyword_content_map" ON keyword_content_map
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow inserts for system operations
GRANT INSERT ON keyword_trends TO anon, authenticated;
GRANT INSERT ON keyword_insights TO anon, authenticated;
GRANT INSERT ON keyword_alerts TO anon, authenticated;
GRANT INSERT ON keyword_content_map TO anon, authenticated;
