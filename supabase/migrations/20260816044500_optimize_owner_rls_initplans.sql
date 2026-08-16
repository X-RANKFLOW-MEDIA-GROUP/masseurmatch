-- Optimize a second low-risk batch of owner/self RLS policies.
-- This migration changes only auth.uid() evaluation shape so PostgreSQL can
-- initialize the value once per statement instead of re-evaluating it per row.
-- Effective authorization predicates are intentionally preserved.

-- conversations
alter policy "Users can view own conversations"
  on public.conversations
  using (((select auth.uid()) = user_id) or ((select auth.uid()) = therapist_id));

-- favorites
alter policy "Users can manage own favorites"
  on public.favorites
  using ((select auth.uid()) = user_id);

-- messages
alter policy "Users can view own messages"
  on public.messages
  using (
    exists (
      select 1
      from public.conversations c
      where c.id = messages.id
        and (
          c.user_id = (select auth.uid())
          or c.therapist_id = (select auth.uid())
        )
    )
  );

-- MFA owner tables
alter policy "Users can manage own MFA pending"
  on public.mfa_pending
  using ((select auth.uid()) = user_id);

alter policy "Users can manage own MFA"
  on public.user_mfa
  using ((select auth.uid()) = user_id);

-- moderation actions visible to the target user
alter policy "Users can read moderation actions targeting them"
  on public.moderation_actions
  using ((select auth.uid()) = target_user_id);

-- moderation queue self insert
alter policy moderation_queue_insert_self
  on public.moderation_queue
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles p
      where p.id = moderation_queue.profile_id
        and (
          p.user_id = (select auth.uid())
          or p.id = (select auth.uid())
        )
    )
  );

-- profile documents
alter policy "Users can delete their own documents"
  on public.profile_documents
  using (
    (select auth.uid()) = (
      select profiles.user_id
      from public.profiles
      where profiles.id = profile_documents.profile_id
    )
  );

alter policy "Users can insert their own documents"
  on public.profile_documents
  with check (
    (select auth.uid()) = (
      select profiles.user_id
      from public.profiles
      where profiles.id = profile_documents.profile_id
    )
  );

alter policy "Users can update their own documents"
  on public.profile_documents
  using (
    (select auth.uid()) = (
      select profiles.user_id
      from public.profiles
      where profiles.id = profile_documents.profile_id
    )
  );

-- voice AI waitlist owner policies
alter policy "Users can remove themselves from the waitlist"
  on public.waitlist_voice_ai
  using ((select auth.uid()) = user_id);

alter policy "Users can join the waitlist"
  on public.waitlist_voice_ai
  with check ((select auth.uid()) = user_id);

alter policy "Users can read their own waitlist entry"
  on public.waitlist_voice_ai
  using ((select auth.uid()) = user_id);
