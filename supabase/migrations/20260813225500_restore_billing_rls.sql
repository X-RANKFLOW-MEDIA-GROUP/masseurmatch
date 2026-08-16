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
    or exists (
      select 1 from public.therapist_profiles tp
      where tp.id = therapist_subscriptions.therapist_profile_id
        and tp.user_id = (select auth.uid())
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
