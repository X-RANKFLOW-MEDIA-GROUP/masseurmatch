INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE id = '94cf1601-fb7d-4895-a0b3-ead59e29b160'
ON CONFLICT DO NOTHING;