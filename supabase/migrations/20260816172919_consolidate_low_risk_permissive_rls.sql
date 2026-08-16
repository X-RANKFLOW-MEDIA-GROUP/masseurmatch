-- Remove permissive FALSE policies that do not deny access under PostgreSQL RLS OR semantics.
drop policy if exists audit_log_deny_client_access on public.audit_log;
drop policy if exists keyword_trends_insert_none on public.keyword_trends;
drop policy if exists support_ticket_messages_no_public_select on public.support_ticket_messages;
drop policy if exists support_tickets_no_public_select on public.support_tickets;

-- Remove exact duplicate admin policy on featured_masters.
drop policy if exists "Admins can manage featured_masters" on public.featured_masters;

-- blog_posts: preserve public SELECT and admin write semantics without an ALL policy also participating in SELECT.
drop policy if exists blog_posts_admin_manage on public.blog_posts;
create policy blog_posts_admin_insert on public.blog_posts
  for insert to public
  with check (is_admin());
create policy blog_posts_admin_update on public.blog_posts
  for update to public
  using (is_admin())
  with check (is_admin());
create policy blog_posts_admin_delete on public.blog_posts
  for delete to public
  using (is_admin());

-- cities: preserve public SELECT and admin write semantics without an ALL policy also participating in SELECT.
drop policy if exists cities_admin_manage on public.cities;
create policy cities_admin_insert on public.cities
  for insert to public
  with check (is_admin());
create policy cities_admin_update on public.cities
  for update to public
  using (is_admin())
  with check (is_admin());
create policy cities_admin_delete on public.cities
  for delete to public
  using (is_admin());

-- keywords: preserve public SELECT and admin write semantics without an ALL policy also participating in SELECT.
drop policy if exists keywords_admin_manage on public.keywords;
create policy keywords_admin_insert on public.keywords
  for insert to public
  with check (is_admin());
create policy keywords_admin_update on public.keywords
  for update to public
  using (is_admin())
  with check (is_admin());
create policy keywords_admin_delete on public.keywords
  for delete to public
  using (is_admin());

-- featured_masters: the previous SELECT behavior was (is_active = true) OR is_admin().
-- Represent that as one SELECT policy, with separate admin write policies.
drop policy if exists featured_masters_admin_all on public.featured_masters;
drop policy if exists featured_masters_public_read on public.featured_masters;
create policy featured_masters_select_active_or_admin on public.featured_masters
  for select to public
  using ((is_active = true) or is_admin());
create policy featured_masters_admin_insert on public.featured_masters
  for insert to public
  with check (is_admin());
create policy featured_masters_admin_update on public.featured_masters
  for update to public
  using (is_admin())
  with check (is_admin());
create policy featured_masters_admin_delete on public.featured_masters
  for delete to public
  using (is_admin());
