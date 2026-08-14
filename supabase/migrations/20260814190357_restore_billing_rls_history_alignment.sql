-- Forward record of the production policy repair applied on 2026-08-14.
-- The historical migration 20260813225500 is also marked applied remotely so
-- local and remote migration histories remain aligned.

drop policy if exists "therapist_subscriptions_select_own_or_admin" on public.therapist_subscriptions;
create policy "therapist_subscriptions_select_own_or_admin"
  on public.therapist_subscriptions for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = therapist_subscriptions.profile_id
        and (p.user_id = (select auth.uid()) or p.id = (select auth.uid()))
    )
  );

drop policy if exists "checkout_sessions_select_own_or_admin" on public.checkout_sessions;
create policy "checkout_sessions_select_own_or_admin"
  on public.checkout_sessions for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = checkout_sessions.profile_id
        and (p.user_id = (select auth.uid()) or p.id = (select auth.uid()))
    )
  );
