-- Allow authenticated therapists to insert their own moderation queue items.
-- Previously the only policy was admin-only, blocking photo submission flow.
CREATE POLICY "Users can insert their own moderation queue items"
  ON moderation_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
