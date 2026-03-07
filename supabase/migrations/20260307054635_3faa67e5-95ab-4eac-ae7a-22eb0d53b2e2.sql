
CREATE OR REPLACE FUNCTION public.prevent_self_vetting()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from changing vetted_by_community or is_claimed on their own profile
  IF NEW.vetted_by_community IS DISTINCT FROM OLD.vetted_by_community THEN
    NEW.vetted_by_community := OLD.vetted_by_community;
  END IF;
  IF NEW.is_claimed IS DISTINCT FROM OLD.is_claimed THEN
    NEW.is_claimed := OLD.is_claimed;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_self_vetting
  BEFORE UPDATE ON public.tradesmen
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_vetting();
