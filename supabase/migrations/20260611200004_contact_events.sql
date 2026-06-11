-- contact_events: logs each time a visitor clicks a contact button on a profile.
-- Used to gate review eligibility — only users who have contacted a therapist
-- can leave a verified review.

CREATE TABLE IF NOT EXISTS contact_events (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  method          text        NOT NULL CHECK (method IN ('call', 'sms', 'whatsapp', 'email', 'website')),
  ip_hash         text,
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE contact_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own contact events"
  ON contact_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS contact_events_user_profile_idx
  ON contact_events (user_id, profile_id);

CREATE INDEX IF NOT EXISTS contact_events_profile_idx
  ON contact_events (profile_id);
