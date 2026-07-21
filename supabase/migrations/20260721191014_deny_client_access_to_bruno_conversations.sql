create policy "bruno_conversations_deny_client_access"
on public.bruno_conversations
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
