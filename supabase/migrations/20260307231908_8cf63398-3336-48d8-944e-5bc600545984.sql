
-- Add attachment_urls column to support_tickets
ALTER TABLE public.support_tickets ADD COLUMN attachment_urls text[] DEFAULT '{}';

-- Add attachment_urls column to ticket_replies
ALTER TABLE public.ticket_replies ADD COLUMN attachment_urls text[] DEFAULT '{}';

-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', false);

-- RLS: Users can upload to ticket-attachments
CREATE POLICY "Users can upload ticket attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can view own attachments
CREATE POLICY "Users can view own ticket attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ticket-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Admins can view all ticket attachments
CREATE POLICY "Admins can view all ticket attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ticket-attachments' AND public.has_role(auth.uid(), 'admin'));
