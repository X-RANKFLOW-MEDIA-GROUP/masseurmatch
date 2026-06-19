-- Fix contact_inquiries RLS policies.
-- The original SELECT/UPDATE policies check therapist_id via the therapists table,
-- but the frontend and API insert/query using profile_id via the profiles table.
-- This causes 403 errors when therapists try to view their inquiries.

-- Drop the old policies that reference the therapists table
drop policy if exists "contact_inquiries_select_own" on public.contact_inquiries;
drop policy if exists "contact_inquiries_update_own" on public.contact_inquiries;

-- New SELECT policy: match profile_id through profiles where user_id = auth.uid()
create policy "contact_inquiries_select_own"
  on public.contact_inquiries for select
  using (
    exists (
      select 1 from public.profiles
      where id = contact_inquiries.profile_id
      and user_id = auth.uid()
    )
  );

-- New UPDATE policy: same check via profiles
create policy "contact_inquiries_update_own"
  on public.contact_inquiries for update
  using (
    exists (
      select 1 from public.profiles
      where id = contact_inquiries.profile_id
      and user_id = auth.uid()
    )
  );

-- Grant SELECT on contact_inquiries to authenticated users (was only granted for insert)
grant select, update on public.contact_inquiries to authenticated;
