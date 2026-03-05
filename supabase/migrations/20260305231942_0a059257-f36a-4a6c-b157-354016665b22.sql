
CREATE TABLE public.ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage replies"
  ON public.ticket_replies FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view replies on their own tickets
CREATE POLICY "Users can view replies on own tickets"
  ON public.ticket_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = ticket_replies.ticket_id
        AND support_tickets.user_id = auth.uid()
    )
  );

-- Users can insert replies on their own tickets (non-admin)
CREATE POLICY "Users can reply to own tickets"
  ON public.ticket_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_admin = false
    AND EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = ticket_replies.ticket_id
        AND support_tickets.user_id = auth.uid()
    )
  );
