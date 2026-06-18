-- Waitlist for the AI Voice Receptionist add-on.
-- Providers join the waitlist from their dashboard or the /pricing page.

CREATE TABLE IF NOT EXISTS waitlist_voice_ai (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id  uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  plan_tier   text        NOT NULL DEFAULT 'unknown',
  created_at  timestamptz DEFAULT now() NOT NULL,

  UNIQUE (user_id)
);

ALTER TABLE waitlist_voice_ai ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own waitlist entry"
  ON waitlist_voice_ai FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join the waitlist"
  ON waitlist_voice_ai FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove themselves from the waitlist"
  ON waitlist_voice_ai FOR DELETE
  USING (auth.uid() = user_id);
