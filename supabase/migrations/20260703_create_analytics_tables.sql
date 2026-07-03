-- Analytics tables for Market Intelligence

-- Search analytics: Track what users search for
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  filters JSONB,
  user_ip TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profile view analytics: Track profile visits
CREATE TABLE IF NOT EXISTS profile_view_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_city TEXT,
  viewer_state TEXT,
  viewer_zip TEXT,
  source TEXT,
  referrer TEXT,
  user_ip TEXT,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inquiry analytics: Track contact/inquiry attempts
CREATE TABLE IF NOT EXISTS inquiry_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  inquiry_type TEXT,
  technique_requested TEXT,
  session_type TEXT,
  user_city TEXT,
  user_state TEXT,
  user_zip TEXT,
  user_ip TEXT,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Booking analytics: Track confirmed sessions
CREATE TABLE IF NOT EXISTS booking_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  technique TEXT,
  session_type TEXT,
  session_duration_minutes INT,
  location_city TEXT,
  location_state TEXT,
  location_zip TEXT,
  price DECIMAL(10, 2),
  user_ip TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_search_analytics_city ON search_analytics(city, created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_zip ON search_analytics(zip_code, created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query, created_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_view_analytics(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_city ON profile_view_analytics(viewer_city, created_at);
CREATE INDEX IF NOT EXISTS idx_inquiry_profile ON inquiry_analytics(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_inquiry_city ON inquiry_analytics(user_city, created_at);
CREATE INDEX IF NOT EXISTS idx_booking_profile ON booking_analytics(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_booking_city ON booking_analytics(location_city, created_at);

-- Enable Row Level Security
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_view_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only allow reads from authenticated users for aggregated stats
CREATE POLICY "allow_read_search_analytics" ON search_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "allow_read_profile_views" ON profile_view_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "allow_read_inquiries" ON inquiry_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "allow_read_bookings" ON booking_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow inserts from service role (for tracking)
GRANT INSERT ON search_analytics TO anon, authenticated;
GRANT INSERT ON profile_view_analytics TO anon, authenticated;
GRANT INSERT ON inquiry_analytics TO anon, authenticated;
GRANT INSERT ON booking_analytics TO anon, authenticated;
