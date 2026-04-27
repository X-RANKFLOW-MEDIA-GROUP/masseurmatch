-- Multi-channel notification preferences and delivery tracking
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  marketing_enabled BOOLEAN NOT NULL DEFAULT false,
  phone_e164 TEXT,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  provider TEXT NOT NULL,
  provider_message_id TEXT,
  destination TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed')),
  error_message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user_created
  ON notification_deliveries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification
  ON notification_deliveries(notification_id);

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can view their own notification preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can upsert their own notification preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can update their own notification preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can view their own push subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can create their own push subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can update their own push subscriptions" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can delete their own push subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own notification deliveries" ON notification_deliveries;
CREATE POLICY "Users can view their own notification deliveries" ON notification_deliveries
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION set_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER trigger_user_notification_preferences_updated_at
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION set_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER trigger_push_subscriptions_updated_at
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_timestamp_updated_at();
