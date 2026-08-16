-- Remove redundant permissive RLS policies only where access is preserved by
-- an existing canonical policy. This reduces per-row policy evaluation without
-- broadening access.

-- contact_inquiries: exact duplicate SELECT policy. Keep contact_inquiries_select_own.
drop policy if exists "providers can view own inquiries" on public.contact_inquiries;

-- contact_inquiries: the legacy UPDATE policy has the same USING predicate but
-- no WITH CHECK. The canonical policy is stricter because it enforces ownership
-- both before and after the update. Keep providers can update own inquiries.
drop policy if exists contact_inquiries_update_own on public.contact_inquiries;

-- users: both legacy self-read policies are exact subsets of
-- users_select_self_or_admin. Keep the canonical policy so self access and admin
-- access remain intact while removing duplicate evaluations.
drop policy if exists "Authenticated users can see themselves" on public.users;
drop policy if exists "Users can see themselves" on public.users;
