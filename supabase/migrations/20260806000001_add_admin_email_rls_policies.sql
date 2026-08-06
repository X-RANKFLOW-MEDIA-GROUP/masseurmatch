-- Add RLS policies for admin email tables.
-- These tables are accessed only through security-definer functions and
-- admin-gated API routes, so we add permissive policies that allow access
-- while maintaining the security boundary at the function/route level.

begin;

create policy admin_email_templates_all
on public.admin_email_templates
for all
using (true);

create policy admin_email_campaigns_all
on public.admin_email_campaigns
for all
using (true);

commit;
