-- Resend Topics - Database schema for storing topic references
-- This helps track which topics are being used in the application

CREATE TABLE IF NOT EXISTS resend_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_subscription TEXT NOT NULL DEFAULT 'opt_out',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track user subscriptions to topics
CREATE TABLE IF NOT EXISTS user_topic_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES resend_topics(id) ON DELETE CASCADE,
  subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Email log with topic associations
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id TEXT UNIQUE,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic_id UUID REFERENCES resend_topics(id) ON DELETE SET NULL,
  status TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_topic_subscriptions_user_id ON user_topic_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_subscriptions_topic_id ON user_topic_subscriptions(topic_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_to_email ON email_sends(to_email);
CREATE INDEX IF NOT EXISTS idx_email_sends_topic_id ON email_sends(topic_id);
CREATE INDEX IF NOT EXISTS idx_resend_topics_resend_id ON resend_topics(resend_id);

-- Enable RLS if needed
ALTER TABLE resend_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only access)
CREATE POLICY "resend_topics_select_admin" ON resend_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "resend_topics_insert_admin" ON resend_topics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "resend_topics_update_admin" ON resend_topics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "resend_topics_delete_admin" ON resend_topics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can only see and manage their own subscriptions
CREATE POLICY "user_topic_subscriptions_select_own" ON user_topic_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_topic_subscriptions_update_own" ON user_topic_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_topic_subscriptions_delete_own" ON user_topic_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Email sends visible to admins and relevant recipients
CREATE POLICY "email_sends_select_admin" ON email_sends
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
