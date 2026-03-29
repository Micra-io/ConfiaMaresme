
-- Fix search_path on compute_completeness_score
CREATE OR REPLACE FUNCTION public.compute_completeness_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  score integer := 0;
  total_fields integer := 7;
BEGIN
  IF NEW.full_name IS NOT NULL AND NEW.full_name <> '' THEN score := score + 1; END IF;
  IF NEW.bio IS NOT NULL AND NEW.bio <> '' THEN score := score + 1; END IF;
  IF NEW.location IS NOT NULL AND NEW.location <> '' THEN score := score + 1; END IF;
  IF NEW.trade_category IS NOT NULL THEN score := score + 1; END IF;
  IF NEW.services IS NOT NULL AND array_length(NEW.services, 1) > 0 THEN score := score + 1; END IF;
  IF NEW.languages IS NOT NULL AND array_length(NEW.languages, 1) > 0 THEN score := score + 1; END IF;
  IF NEW.whatsapp_number IS NOT NULL AND NEW.whatsapp_number <> '' THEN score := score + 1; END IF;

  NEW.data_completeness_score := ROUND((score::numeric / total_fields) * 100);
  RETURN NEW;
END;
$$;

-- Add RLS policy to verification_attempts (service role only for inserts, no public access)
CREATE POLICY "Service role can manage verification_attempts"
  ON public.verification_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
