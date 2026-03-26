
-- Staging table for raw scraped tradesman data from WhatsApp bot
CREATE TABLE public.tradesman_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Raw scraped fields
  raw_name text NOT NULL,
  raw_phone text,
  raw_bio text,
  raw_location text,
  raw_trade text,
  raw_languages text[] NOT NULL DEFAULT '{}',
  source text NOT NULL DEFAULT 'whatsapp_bot',
  
  -- Cleaned/approved fields (filled by admin)
  clean_name text,
  clean_bio text,
  clean_location text,
  
  -- Approval workflow
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  approved_tradesman_id uuid REFERENCES public.tradesmen(id),
  admin_notes text
);

-- RLS
ALTER TABLE public.tradesman_leads ENABLE ROW LEVEL SECURITY;

-- Only admins can see/manage leads
CREATE POLICY "Admins can view tradesman_leads"
  ON public.tradesman_leads FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert tradesman_leads"
  ON public.tradesman_leads FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update tradesman_leads"
  ON public.tradesman_leads FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete tradesman_leads"
  ON public.tradesman_leads FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Allow the service role (bot) to insert without auth
CREATE POLICY "Service role can insert tradesman_leads"
  ON public.tradesman_leads FOR INSERT TO service_role
  WITH CHECK (true);
