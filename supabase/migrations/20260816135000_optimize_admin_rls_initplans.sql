-- Optimize a third low-risk batch of administrative RLS policies.
-- Only auth helper evaluation shape changes; roles, commands, predicates,
-- implicit WITH CHECK behavior, and effective authorization remain unchanged.

alter policy "Admins can manage imported profile data"
  on public.imported_profile_data
  using (
    (
      select profiles.role
      from public.profiles
      where profiles.id = (select auth.uid())
    ) = 'admin'::text
  );

alter policy newsletter_select_admin
  on public.newsletter_subscribers
  using (((select auth.jwt()) ->> 'role'::text) = 'admin'::text);

alter policy "Admins can manage photo moderations"
  on public.photo_moderations
  using (
    (
      select profiles.role
      from public.profiles
      where profiles.id = (select auth.uid())
    ) = 'admin'::text
  );

alter policy "Admins can manage profile reports"
  on public.profile_reports
  using (
    (
      select profiles.role
      from public.profiles
      where profiles.id = (select auth.uid())
    ) = 'admin'::text
  );

alter policy "Admins can view debug logs"
  on public.profile_status_debug_log
  using (
    (
      select profiles.role
      from public.profiles
      where profiles.id = (select auth.uid())
    ) = 'admin'::text
  );

alter policy "Admins can view invalid status logs"
  on public.profile_status_invalid_log
  using (
    (
      select profiles.role
      from public.profiles
      where profiles.id = (select auth.uid())
    ) = 'admin'::text
  );

alter policy "Admins can manage site settings"
  on public.site_settings
  using (
    (
      select profiles.role
      from public.profiles
      where profiles.id = (select auth.uid())
    ) = 'admin'::text
  );

alter policy "Admins can manage learning scores"
  on public.therapist_learning_scores
  using (
    (
      select profiles.role
      from public.profiles
      where profiles.id = (select auth.uid())
    ) = 'admin'::text
  );

alter policy "Admins can manage suspensions"
  on public.user_suspensions
  using (
    (
      select profiles.role
      from public.profiles
      where profiles.id = (select auth.uid())
    ) = 'admin'::text
  );
