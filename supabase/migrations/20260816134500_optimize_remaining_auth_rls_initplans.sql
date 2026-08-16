-- Optimize the remaining direct Supabase Auth helper calls reported by the
-- performance advisor after 20260816044500_optimize_owner_rls_initplans.sql.
--
-- Access semantics are intentionally preserved. This migration changes only
-- the evaluation shape of auth.uid(), auth.role() and auth.jwt() by wrapping
-- them in scalar SELECTs so PostgreSQL can initialize them once per statement.

-- profiles
ALTER POLICY "Users can insert own profile" ON public.profiles
  WITH CHECK ((SELECT auth.uid()) = id);
ALTER POLICY "Users can update own profile" ON public.profiles
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
ALTER POLICY "Users can view own profile" ON public.profiles
  USING ((SELECT auth.uid()) = id);
ALTER POLICY profiles_admin_all ON public.profiles
  USING ((((SELECT auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));
ALTER POLICY profiles_insert_own ON public.profiles
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY profiles_owner_read ON public.profiles
  USING ((user_id = (SELECT auth.uid())) OR (id = (SELECT auth.uid())));
ALTER POLICY profiles_owner_update ON public.profiles
  USING ((user_id = (SELECT auth.uid())) OR (id = (SELECT auth.uid())))
  WITH CHECK ((user_id = (SELECT auth.uid())) OR (id = (SELECT auth.uid())));
ALTER POLICY profiles_public_read_active ON public.profiles
  USING (
    ((profile_status = 'approved'::text)
      AND (visibility_status = 'public'::text)
      AND (COALESCE(is_suspended, false) = false)
      AND (COALESCE(is_banned, false) = false))
    OR (user_id = (SELECT auth.uid()))
    OR is_admin()
  );

-- users
ALTER POLICY "Authenticated users can see themselves" ON public.users
  USING ((SELECT auth.uid()) = id);
ALTER POLICY "Users can see themselves" ON public.users
  USING ((SELECT auth.uid()) = id);
ALTER POLICY users_insert_self_or_admin ON public.users
  WITH CHECK ((id = (SELECT auth.uid())) OR is_admin());
ALTER POLICY users_select_self_or_admin ON public.users
  USING ((id = (SELECT auth.uid())) OR is_admin());
ALTER POLICY users_update_self_or_admin ON public.users
  USING ((id = (SELECT auth.uid())) OR is_admin())
  WITH CHECK ((id = (SELECT auth.uid())) OR is_admin());

-- profile photos
ALTER POLICY profile_photos_owner_delete ON public.profile_photos
  USING (user_id = (SELECT auth.uid()));
ALTER POLICY profile_photos_owner_insert ON public.profile_photos
  WITH CHECK (
    (user_id = (SELECT auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_photos.profile_id
        AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
    )
  );
ALTER POLICY profile_photos_owner_select ON public.profile_photos
  USING (
    (user_id = (SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_photos.profile_id
        AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
    )
  );
ALTER POLICY profile_photos_owner_update ON public.profile_photos
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    (user_id = (SELECT auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_photos.profile_id
        AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
    )
  );

-- subscriptions and therapists
ALTER POLICY subscriptions_insert_self_or_admin ON public.subscriptions
  WITH CHECK ((user_id = (SELECT auth.uid())) OR is_admin());
ALTER POLICY subscriptions_select_self_or_admin ON public.subscriptions
  USING ((user_id = (SELECT auth.uid())) OR is_admin());
ALTER POLICY subscriptions_update_self_or_admin ON public.subscriptions
  USING ((user_id = (SELECT auth.uid())) OR is_admin())
  WITH CHECK ((user_id = (SELECT auth.uid())) OR is_admin());
ALTER POLICY therapists_insert_self_or_admin ON public.therapists
  WITH CHECK ((user_id = (SELECT auth.uid())) OR is_admin());
ALTER POLICY therapists_public_read_approved ON public.therapists
  USING ((status = 'approved'::text) OR (user_id = (SELECT auth.uid())) OR is_admin());
ALTER POLICY therapists_update_self_or_admin ON public.therapists
  USING ((user_id = (SELECT auth.uid())) OR is_admin())
  WITH CHECK ((user_id = (SELECT auth.uid())) OR is_admin());

-- complaints and referrals
ALTER POLICY "Admins can update complaint status" ON public.complaints
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'::text
  ));
ALTER POLICY "Users can file complaints" ON public.complaints
  WITH CHECK ((SELECT auth.uid()) = complainant_id);
ALTER POLICY "Users can view their own complaints" ON public.complaints
  USING (((SELECT auth.uid()) = complainant_id) OR ((SELECT auth.uid()) = respondent_id));
ALTER POLICY "Providers can read their own referral code" ON public.referral_codes
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "Providers can read referrals involving their account" ON public.referral_signups
  USING (((SELECT auth.uid()) = referrer_user_id) OR ((SELECT auth.uid()) = referred_user_id));

-- auth role gated analytics/support
ALTER POLICY allow_read_inquiries ON public.inquiry_analytics
  USING ((SELECT auth.role()) = 'authenticated'::text);
ALTER POLICY allow_read_keyword_alerts ON public.keyword_alerts
  USING ((SELECT auth.role()) = 'authenticated'::text);
ALTER POLICY allow_read_keyword_content_map ON public.keyword_content_map
  USING ((SELECT auth.role()) = 'authenticated'::text);
ALTER POLICY allow_read_keyword_insights ON public.keyword_insights
  USING ((SELECT auth.role()) = 'authenticated'::text);
ALTER POLICY allow_read_profile_views ON public.profile_view_analytics
  USING ((SELECT auth.role()) = 'authenticated'::text);
ALTER POLICY allow_read_search_analytics ON public.search_analytics
  USING ((SELECT auth.role()) = 'authenticated'::text);
ALTER POLICY service_role_messages_all ON public.support_ticket_messages
  USING ((SELECT auth.role()) = 'service_role'::text);
ALTER POLICY service_role_tickets_all ON public.support_tickets
  USING ((SELECT auth.role()) = 'service_role'::text);
ALTER POLICY newsletter_select_admin ON public.newsletter_subscribers
  USING (((SELECT auth.jwt()) ->> 'role'::text) = 'admin'::text);
ALTER POLICY "Authenticated users insert own reviews" ON public.reviews
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- demand and imported data
ALTER POLICY "Elite subscribers can read demand scores" ON public.demand_scores
  USING (EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = (SELECT auth.uid())
      AND s.status = 'active'::text
      AND s.tier ~~* 'elite%'::text
  ));
ALTER POLICY "Admins can manage imported reviews" ON public.imported_reviews
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'admin'::text
  ));
ALTER POLICY "Therapists can view their own imported reviews" ON public.imported_reviews
  USING (profile_id IN (
    SELECT profiles.id FROM public.profiles
    WHERE profiles.user_id = (SELECT auth.uid())
  ));
ALTER POLICY "Admins can manage migrations" ON public.profile_migrations
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'admin'::text
  ));
ALTER POLICY "Users can view their own migrations" ON public.profile_migrations
  USING (profile_id IN (
    SELECT profiles.id FROM public.profiles
    WHERE profiles.user_id = (SELECT auth.uid())
  ));

-- admin policies resolved through profiles
ALTER POLICY "Admins can manage imported profile data" ON public.imported_profile_data
  USING (((SELECT profiles.role FROM public.profiles WHERE profiles.id = (SELECT auth.uid())) = 'admin'::text));
ALTER POLICY "Admins can manage photo moderations" ON public.photo_moderations
  USING (((SELECT profiles.role FROM public.profiles WHERE profiles.id = (SELECT auth.uid())) = 'admin'::text));
ALTER POLICY "Admins can manage profile reports" ON public.profile_reports
  USING (((SELECT profiles.role FROM public.profiles WHERE profiles.id = (SELECT auth.uid())) = 'admin'::text));
ALTER POLICY "Admins can view debug logs" ON public.profile_status_debug_log
  USING (((SELECT profiles.role FROM public.profiles WHERE profiles.id = (SELECT auth.uid())) = 'admin'::text));
ALTER POLICY "Admins can view invalid status logs" ON public.profile_status_invalid_log
  USING (((SELECT profiles.role FROM public.profiles WHERE profiles.id = (SELECT auth.uid())) = 'admin'::text));
ALTER POLICY "Admins can manage site settings" ON public.site_settings
  USING (((SELECT profiles.role FROM public.profiles WHERE profiles.id = (SELECT auth.uid())) = 'admin'::text));
ALTER POLICY "Admins can manage learning scores" ON public.therapist_learning_scores
  USING (((SELECT profiles.role FROM public.profiles WHERE profiles.id = (SELECT auth.uid())) = 'admin'::text));
ALTER POLICY "Admins can manage suspensions" ON public.user_suspensions
  USING (((SELECT profiles.role FROM public.profiles WHERE profiles.id = (SELECT auth.uid())) = 'admin'::text));

-- SMS policies
ALTER POLICY "Admin full access sms_follow_up_alerts" ON public.sms_follow_up_alerts
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = (SELECT auth.uid()) AND user_roles.role = 'admin'::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = (SELECT auth.uid()) AND user_roles.role = 'admin'::text
  ));
ALTER POLICY "Admin full access sms_logs" ON public.sms_logs
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = (SELECT auth.uid()) AND user_roles.role = 'admin'::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = (SELECT auth.uid()) AND user_roles.role = 'admin'::text
  ));
ALTER POLICY "Provider read own sms_logs" ON public.sms_logs
  USING (profile_id IN (
    SELECT sp.id
    FROM public.sms_profiles sp
    JOIN public.profiles p ON p.id = sp.profile_id
    WHERE p.user_id = (SELECT auth.uid())
  ));
ALTER POLICY "Admin full access sms_profiles" ON public.sms_profiles
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = (SELECT auth.uid()) AND user_roles.role = 'admin'::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = (SELECT auth.uid()) AND user_roles.role = 'admin'::text
  ));
ALTER POLICY "Provider manage own sms_profile" ON public.sms_profiles
  USING (profile_id IN (
    SELECT profiles.id FROM public.profiles
    WHERE profiles.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (profile_id IN (
    SELECT profiles.id FROM public.profiles
    WHERE profiles.user_id = (SELECT auth.uid())
  ));
