-- users_owner_read is redundant for authenticated users because
-- users_select_self_or_admin already allows the same self-read access and
-- additionally preserves admin access. Remove the duplicate evaluation.
drop policy if exists users_owner_read on public.users;
