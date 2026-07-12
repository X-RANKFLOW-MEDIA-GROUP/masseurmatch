-- GET /auth/v1/admin/users 500s with "Database error finding users" once the
-- listing reaches the users seeded on 2025-12-07 (viewer/manager/superadmin
-- @example.com). Rows inserted directly into auth.users with SQL leave the
-- token columns NULL, and GoTrue scans them as non-nullable strings, so any
-- page containing such a row fails. Diagnosed by bisecting per_page: 43 rows
-- list fine, 44 errors.
--
-- Backfill empty strings (GoTrue's own default) for every NULL string column
-- it scans. Idempotent; touches only corrupted rows.

update auth.users
set
  confirmation_token         = coalesce(confirmation_token, ''),
  recovery_token             = coalesce(recovery_token, ''),
  email_change               = coalesce(email_change, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, '')
where confirmation_token is null
   or recovery_token is null
   or email_change is null
   or email_change_token_new is null
   or email_change_token_current is null
   or phone_change is null
   or phone_change_token is null
   or reauthentication_token is null;
