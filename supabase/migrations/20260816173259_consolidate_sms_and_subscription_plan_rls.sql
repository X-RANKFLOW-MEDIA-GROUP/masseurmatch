-- sms_logs: preserve SELECT as provider-own OR admin; preserve writes as admin-only.
drop policy if exists "Admin full access sms_logs" on public.sms_logs;
drop policy if exists "Provider read own sms_logs" on public.sms_logs;
create policy sms_logs_select_own_or_admin on public.sms_logs for select to authenticated using (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'::text) or profile_id in (select sp.id from public.sms_profiles sp join public.profiles p on p.id = sp.profile_id where p.user_id = (select auth.uid())));
create policy sms_logs_admin_insert on public.sms_logs for insert to authenticated with check (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'::text));
create policy sms_logs_admin_update on public.sms_logs for update to authenticated using (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'::text)) with check (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'::text));
create policy sms_logs_admin_delete on public.sms_logs for delete to authenticated using (exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'::text));
drop policy if exists "Admin full access sms_profiles" on public.sms_profiles;
drop policy if exists "Provider manage own sms_profile" on public.sms_profiles;
create policy sms_profiles_owner_or_admin_all on public.sms_profiles for all to authenticated using (profile_id in (select p.id from public.profiles p where p.user_id = (select auth.uid())) or exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'::text)) with check (profile_id in (select p.id from public.profiles p where p.user_id = (select auth.uid())) or exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'admin'::text));
drop policy if exists "Admins can manage subscription plans" on public.subscription_plans;
drop policy if exists "Public can read active subscription plans" on public.subscription_plans;
create policy subscription_plans_anon_read_active on public.subscription_plans for select to anon using (is_active = true);
create policy subscription_plans_authenticated_read_active_or_admin on public.subscription_plans for select to authenticated using (is_active = true or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'::text));
create policy subscription_plans_admin_insert on public.subscription_plans for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'::text));
create policy subscription_plans_admin_update on public.subscription_plans for update to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'::text)) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'::text));
create policy subscription_plans_admin_delete on public.subscription_plans for delete to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'::text));
