
-- Add new columns to tradesmen
ALTER TABLE public.tradesmen
  ADD COLUMN IF NOT EXISTS data_completeness_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS whatsapp_reachable text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS whatsapp_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS contact_method text NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS alternate_contact text,
  ADD COLUMN IF NOT EXISTS municipality text,
  ADD COLUMN IF NOT EXISTS location_verified boolean NOT NULL DEFAULT false;

-- Completeness score function
CREATE OR REPLACE FUNCTION public.compute_completeness_score()
RETURNS trigger
LANGUAGE plpgsql
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

-- Trigger to auto-compute on insert/update
DROP TRIGGER IF EXISTS trg_compute_completeness ON public.tradesmen;
CREATE TRIGGER trg_compute_completeness
  BEFORE INSERT OR UPDATE ON public.tradesmen
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_completeness_score();

-- Backfill existing rows (fires trigger to compute scores)
UPDATE public.tradesmen SET updated_at = now();
