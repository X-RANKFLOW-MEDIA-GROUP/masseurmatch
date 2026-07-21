begin;
drop policy if exists "Public insert booking_inquiries" on public.booking_inquiries;
drop policy if exists "anon insert conversations" on public.bruno_conversations;
commit;
