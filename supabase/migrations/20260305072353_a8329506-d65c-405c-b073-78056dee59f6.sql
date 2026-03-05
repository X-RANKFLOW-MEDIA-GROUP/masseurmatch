ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_methods text[] DEFAULT '{}'::text[];

-- Update demo profiles with sample payment methods
UPDATE public.profiles SET payment_methods = ARRAY['Cash', 'Venmo', 'Zelle', 'CashApp']
WHERE display_name LIKE '%★ Demo%' AND city = 'Los Angeles';

UPDATE public.profiles SET payment_methods = ARRAY['Cash', 'Venmo', 'Zelle']
WHERE display_name LIKE '%★ Demo%' AND city = 'Miami';

UPDATE public.profiles SET payment_methods = ARRAY['Cash', 'Venmo', 'CashApp', 'Apple Pay']
WHERE display_name LIKE '%★ Demo%' AND city = 'New York';

UPDATE public.profiles SET payment_methods = ARRAY['Cash', 'Venmo', 'Zelle', 'Apple Pay']
WHERE display_name LIKE '%★ Demo%' AND city = 'San Francisco';

UPDATE public.profiles SET payment_methods = ARRAY['Cash', 'Venmo', 'Zelle']
WHERE display_name LIKE '%★ Demo%' AND city = 'Chicago';