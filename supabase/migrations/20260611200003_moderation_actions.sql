-- Moderation actions log with reason NOT NULL enforcement.
-- Every enforcement action must include a human-readable reason for
-- transparency, audit trails, and regulatory compliance.

CREATE TABLE IF NOT EXISTS moderation_actions (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type     text        NOT NULL
                              CHECK (action_type IN (
                                'warning', 'content_removal', 'suspension',
                                'ban', 'badge_revocation', 'profile_suppression',
                                'listing_removal', 'reinstated'
                              )),
  target_user_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  target_profile_id uuid      REFERENCES profiles(id) ON DELETE SET NULL,
  -- reason is NOT NULL — every moderation action must be documented
  reason          text        NOT NULL CHECK (char_length(reason) >= 10),
  detail          text,
  actor_admin_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at     timestamptz,
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

-- Admins manage all rows (service-role only — no RLS policy needed for service key).
-- Affected users can view actions against their own account.
CREATE POLICY "Users can read moderation actions targeting them"
  ON moderation_actions FOR SELECT
  USING (auth.uid() = target_user_id);

CREATE INDEX IF NOT EXISTS moderation_actions_target_user_idx
  ON moderation_actions (target_user_id);

CREATE INDEX IF NOT EXISTS moderation_actions_created_at_idx
  ON moderation_actions (created_at DESC);
