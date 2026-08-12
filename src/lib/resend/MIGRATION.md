# Database Migration Guide

Instructions for setting up the Resend Topics database tables.

## Option 1: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com)
2. Open your project
3. Click **SQL Editor** in the sidebar
4. Click **New Query**
5. Copy the contents of `src/lib/resend/db-schema.sql`
6. Paste into the query editor
7. Click **Run**

## Option 2: Via Command Line

```bash
# Using psql directly
psql $DATABASE_URL < src/lib/resend/db-schema.sql

# Or using Supabase CLI
supabase db push
```

## Option 3: Step by Step in SQL Editor

Run each section in order:

### 1. Create Tables

```sql
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

CREATE TABLE IF NOT EXISTS user_topic_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES resend_topics(id) ON DELETE CASCADE,
  subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

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
```

### 2. Create Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_user_topic_subscriptions_user_id ON user_topic_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_subscriptions_topic_id ON user_topic_subscriptions(topic_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_to_email ON email_sends(to_email);
CREATE INDEX IF NOT EXISTS idx_email_sends_topic_id ON email_sends(topic_id);
CREATE INDEX IF NOT EXISTS idx_resend_topics_resend_id ON resend_topics(resend_id);
```

### 3. Enable RLS

```sql
ALTER TABLE resend_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
```

### 4. Create RLS Policies

```sql
-- Admin-only access to resend_topics
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

-- Users manage own subscriptions
CREATE POLICY "user_topic_subscriptions_select_own" ON user_topic_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_topic_subscriptions_update_own" ON user_topic_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_topic_subscriptions_delete_own" ON user_topic_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Admin view email logs
CREATE POLICY "email_sends_select_admin" ON email_sends
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

## Verification

After running the migration, verify the tables were created:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('resend_topics', 'user_topic_subscriptions', 'email_sends');

-- Expected output:
-- table_name
-- resend_topics
-- user_topic_subscriptions
-- email_sends

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('resend_topics', 'user_topic_subscriptions', 'email_sends');

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('resend_topics', 'user_topic_subscriptions', 'email_sends');
```

## Rollback (if needed)

To remove the tables and policies:

```sql
-- Drop tables (this will cascade delete related records)
DROP TABLE IF EXISTS email_sends CASCADE;
DROP TABLE IF EXISTS user_topic_subscriptions CASCADE;
DROP TABLE IF EXISTS resend_topics CASCADE;
```

## Next Steps

1. ✅ Run migration
2. ✅ Verify tables created
3. 🔄 Set `RESEND_API_KEY` in environment
4. 🔄 Restart the application
5. 🔄 Visit `/admin/resend-topics` to create topics
6. 🔄 Test sending emails with topics

## Troubleshooting

### "Permission denied" error
- Make sure you're using a role with admin/write permissions
- In Supabase, use the service role key for migrations

### "Relation already exists" error
- Tables were already created
- You can safely ignore this if running idempotent SQL
- Or drop and recreate with the provided migration

### RLS policies not working
- Verify RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Check `role='admin'` is set in user metadata
- Verify auth context is properly set in your app

### Indexes not being used
- Run `ANALYZE table_name;` to update query planner
- Check index names: `\di` in psql

## Support

For Supabase-specific issues: [Supabase Docs](https://supabase.com/docs)
For SQL issues: Consult [PostgreSQL Docs](https://www.postgresql.org/docs/)
