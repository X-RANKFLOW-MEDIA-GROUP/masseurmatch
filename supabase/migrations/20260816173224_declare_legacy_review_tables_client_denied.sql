-- Make the intended deny-by-default state explicit for client roles while server-side service-role workflows continue to bypass RLS.
create policy reviews_client_deny_all on public.reviews
  for all to anon, authenticated
  using (false)
  with check (false);

create policy imported_reviews_client_deny_all on public.imported_reviews
  for all to anon, authenticated
  using (false)
  with check (false);

create policy profile_migrations_client_deny_all on public.profile_migrations
  for all to anon, authenticated
  using (false)
  with check (false);
