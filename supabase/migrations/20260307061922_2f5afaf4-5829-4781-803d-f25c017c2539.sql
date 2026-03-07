
-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tradesman_id UUID NOT NULL REFERENCES public.tradesmen(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tradesman_id, resident_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);

-- Only residents with a lead can insert a review
CREATE POLICY "Residents with leads can create reviews" ON public.reviews FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = resident_id
  AND EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.tradesman_id = reviews.tradesman_id
    AND leads.resident_id = auth.uid()
    AND leads.created_at <= now() - interval '24 hours'
  )
);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE TO authenticated
USING (auth.uid() = resident_id)
WITH CHECK (auth.uid() = resident_id);

-- Monetization columns on tradesmen
ALTER TABLE public.tradesmen
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
