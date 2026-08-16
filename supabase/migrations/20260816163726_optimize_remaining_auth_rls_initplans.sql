-- Optimize only the Auth RLS initplan warnings still reported after
-- 20260816135000_optimize_admin_rls_initplans.sql and
-- 20260816140500_restore_is_admin_security_invoker.sql.
--
-- Authorization semantics are intentionally unchanged. This migration only
-- wraps auth.uid(), auth.role(), and auth.jwt() in scalar SELECT expressions
-- so PostgreSQL can evaluate them once per statement instead of once per row.

-- users
alter policy "Users can see themselves" on public.users
  using ((select auth.uid()) = id);
alter policy "Authenticated users can see themselves" on public.users
  using ((select auth.uid()) = id);
alter policy users_select_self_or_admin on public.users
  using ((id = (select auth.uid())) or is_admin());
alter policy users_insert_self_or_admin on public.users
  with check ((id = (select auth.uid())) or is_admin());
alter policy users_update_self_or_admin on public.users
  using ((id = (select auth.uid())) or is_admin())
  with check ((id = (select auth.uid())) or is_admin());

-- profiles
alter policy "Users can view own profile" on public.profiles
  using ((select auth.uid()) = id);
alter policy "Users can update own profile" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
alter policy "Users can insert own profile" on public.profiles
  with check ((select auth.uid()) = id);
alter policy profiles_owner_read on public.profiles
  using ((user_id = (select auth.uid())) or (id = (select auth.uid())));
alter policy profiles_owner_update on public.profiles
  using ((user_id = (select auth.uid())) or (id = (select auth.uid())))
  with check ((user_id = (select auth.uid())) or (id = (select auth.uid())));
alter policy profiles_insert_own on public.profiles
  with check ((select auth.uid()) = user_id);
alter policy profiles_admin_all on public.profiles
  using ((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));

-- subscriptions
alter policy subscriptions_select_self_or_admin on public.subscriptions
  using ((user_id = (select auth.uid())) or is_admin());
alter policy subscriptions_insert_self_or_admin on public.subscriptions
  with check ((user_id = (select auth.uid())) or is_admin());
alter policy subscriptions_update_self_or_admin on public.subscriptions
  using ((user_id = (select auth.uid())) or is_admin())
  with check ((user_id = (select auth.uid())) or is_admin());

-- therapists
alter policy therapists_public_read_approved on public.therapists
  using ((status = 'approved'::text) or (user_id = (select auth.uid())) or is_admin());
alter policy therapists_insert_self_or_admin on public.therapists
  with check ((user_id = (select auth.uid())) or is_admin());
alter policy therapists_update_self_or_admin on public.therapists
  using ((user_id = (select auth.uid())) or is_admin())
  with check ((user_id = (select auth.uid())) or is_admin());

-- profile photos
alter policy profile_photos_owner_select on public.profile_photos
  using (
    (user_id = (select auth.uid()))
    or exists (
      select 1
      from public.profiles p
      where p.id = profile_photos.profile_id
        and (p.user_id = (select auth.uid()) or p.id = (select auth.uid()))
    )
  );
alter policy profile_photos_owner_insert on public.profile_photos
  with check (
    (user_id = (select auth.uid()))
    and exists (
      select 1
      from public.profiles p
      where p.id = profile_photos.profile_id
        and (p.user_id = (select auth.uid()) or p.id = (select auth.uid()))
    )
  );
alter policy profile_photos_owner_update on public.profile_photos
  using (user_id = (select auth.uid()))
  with check (
    (user_id = (select auth.uid()))
    and exists (
      select 1
      from public.profiles p
      where p.id = profile_photos.profile_id
        and (p.user_id = (select auth.uid()) or p.id = (select auth.uid()))
    )
  );
alter policy profile_photos_owner_delete on public.profile_photos
  using (user_id = (select auth.uid()));

-- complaints
alter policy "Users can view their own complaints" on public.complaints
  using (((select auth.uid()) = complainant_id) or ((select auth.uid()) = respondent_id));
alter policy "Users can file complaints" on public.complaints
  with check ((select auth.uid()) = complainant_id);
alter policy "Admins can update complaint status" on public.complaints
  using (exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'::text
  ));

-- referrals
alter policy "Providers can read their own referral code" on public.referral_codes
  using ((select auth.uid()) = user_id);
alter policy "Providers can read referrals involving their account" on public.referral_signups
  using (((select auth.uid()) = referrer_user_id) or ((select auth.uid()) = referred_user_id));

-- reviews
alter policy "Authenticated users insert own reviews" on public.reviews
  with check ((select auth.uid()) is not null);

-- authenticated analytics reads
alter policy allow_read_inquiries on public.inquiry_analytics
  using ((select auth.role()) = 'authenticated'::text);
alter policy allow_read_keyword_alerts on public.keyword_alerts
  using ((select auth.role()) = 'authenticated'::text);
alter policy allow_read_keyword_content_map on public.keyword_content_map
  using ((select auth.role()) = 'authenticated'::text);
alter policy allow_read_keyword_insights on public.keyword_insights
  using ((select auth.role()) = 'authenticated'::text);
alter policy allow_read_profile_views on public.profile_view_analytics
  using ((select auth.role()) = 'authenticated'::text);
alter policy allow_read_search_analytics on public.search_analytics
  using ((select auth.role()) = 'authenticated'::text);

-- support service role policies
alter policy service_role_messages_all on public.support_ticket_messages
  using ((select auth.role()) = 'service_role'::text);
alter policy service_role_tickets_all on public.support_tickets
  using ((select auth.role()) = 'service_role'::text);

-- demand scores
alter policy "Elite subscribers can read demand scores" on public.demand_scores
  using (exists (
    select 1
    from public.subscriptions s
    where s.user_id = (select auth.uid())
      and s.status = 'active'::text
      and s.tier ~~* 'elite%'::text
  ));

-- imported reviews and migration ownership
alter policy "Admins can manage imported reviews" on public.imported_reviews
  using (exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::text
  ));
alter policy "Therapists can view their own imported reviews" on public.imported_reviews
  using (profile_id in (
    select profiles.id
    from public.profiles
    where profiles.user_id = (select auth.uid())
  ));
alter policy "Admins can manage migrations" on public.profile_migrations
  using (exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::text
  ));
alter policy "Users can view their own migrations" on public.profile_migrations
  using (profile_id in (
    select profiles.id
    from public.profiles
    where profiles.user_id = (select auth.uid())
  ));

-- SMS
alter policy "Admin full access sms_profiles" on public.sms_profiles
  using (exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::text
  ))
  with check (exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::text
  ));
alter policy "Provider manage own sms_profile" on public.sms_profiles
  using (profile_id in (
    select profiles.id
    from public.profiles
    where profiles.user_id = (select auth.uid())
  ))
  with check (profile_id in (
    select profiles.id
    from public.profiles
    where profiles.user_id = (select auth.uid())
  ));
alter policy "Admin full access sms_logs" on public.sms_logs
  using (exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::text
  ))
  with check (exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::text
  ));
alter policy "Provider read own sms_logs" on public.sms_logs
  using (profile_id in (
    select sp.id
    from public.sms_profiles sp
    join public.profiles p on p.id = sp.profile_id
    where p.user_id = (select auth.uid())
  ));
alter policy "Admin full access sms_follow_up_alerts" on public.sms_follow_up_alerts
  using (exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::text
  ))
  with check (exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::text
  ));
